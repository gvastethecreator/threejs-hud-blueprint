import type { HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { emitDiagnostic } from "../contracts/diagnostics.js";
import { HudError } from "../contracts/errors.js";
import {
  fontCacheKey,
  isPreprocessedFontAsset,
  resolveFontMetadata,
  type FontMetadata,
  type FontRegistration,
  type FontSource,
} from "./contracts.js";

export type FontHandleState = "loading" | "ready" | "failed" | "disposed";

export type ParsedFontFace = Readonly<{
  cacheKey: string;
  owned: boolean;
  unitsPerEm: number;
}>;

export type FontHandle = Readonly<{
  id: string;
  cacheKey: string;
  state: FontHandleState;
  metadata: FontMetadata;
  generation: number;
  error?: string;
}>;

export type FontLifecycleEvent = Readonly<{
  type: "register" | "dedupe" | "ready" | "failed" | "abort" | "stale" | "unregister" | "dispose";
  id: string;
  cacheKey: string;
  generation: number;
}>;

export type FontLoadFn = (
  registration: FontRegistration,
  signal: AbortSignal,
) => Promise<ParsedFontFace>;

export type FontRegistryOptions = Readonly<{
  load?: FontLoadFn;
  onDiagnostic?: HudDiagnosticHandler;
}>;

type MutableHandle = {
  id: string;
  cacheKey: string;
  state: FontHandleState;
  metadata: FontMetadata;
  generation: number;
  error?: string;
  registration: FontRegistration;
};

export class FontRegistry {
  private readonly load: FontLoadFn;
  private readonly onDiagnostic: HudDiagnosticHandler | undefined;
  private readonly handles = new Map<string, MutableHandle>();
  private readonly faces = new Map<string, ParsedFontFace>();
  private readonly inflight = new Map<
    string,
    { promise: Promise<ParsedFontFace>; controllers: Set<AbortController> }
  >();
  private readonly refs = new Map<string, number>();
  private readonly log: FontLifecycleEvent[] = [];
  private epoch = 0;
  private disposed = false;

  constructor(options: FontRegistryOptions = {}) {
    this.load = options.load ?? defaultFontLoad;
    this.onDiagnostic = options.onDiagnostic;
  }

  events(): readonly FontLifecycleEvent[] {
    return this.log.slice();
  }

  snapshot(): readonly FontHandle[] {
    return Object.freeze([...this.handles.values()].map(freezeHandle));
  }

  get(id: string): FontHandle | undefined {
    const handle = this.handles.get(id);
    return handle ? freezeHandle(handle) : undefined;
  }

  async register(input: FontRegistration, signal?: AbortSignal): Promise<FontHandle> {
    this.assertAlive();
    if (this.handles.has(input.id)) {
      throw new HudError("INVALID_ARGUMENT", "Font id is already registered.", { id: input.id });
    }
    const cacheKey = fontCacheKey(input);
    const handle: MutableHandle = {
      id: input.id,
      cacheKey,
      state: "loading",
      metadata: resolveFontMetadata(input),
      generation: this.epoch,
      registration: input,
    };
    this.handles.set(input.id, handle);
    this.refs.set(cacheKey, (this.refs.get(cacheKey) ?? 0) + 1);
    this.push("register", handle);

    const existing = this.faces.get(cacheKey);
    if (existing) {
      handle.state = "ready";
      this.push("ready", handle);
      return freezeHandle(handle);
    }

    try {
      const face = await this.shareLoad(input, cacheKey, signal);
      if (!this.handles.has(input.id) || handle.generation !== this.epoch) {
        this.push("stale", handle);
        this.releaseFace(face);
        return freezeHandle({
          ...handle,
          state: this.handles.has(input.id) ? handle.state : "disposed",
        });
      }
      this.faces.set(cacheKey, face);
      handle.state = "ready";
      this.push("ready", handle);
      return freezeHandle(handle);
    } catch (error) {
      if (signal?.aborted) {
        handle.state = "disposed";
        this.handles.delete(input.id);
        this.dropRef(cacheKey);
        this.push("abort", handle);
        throw error;
      }
      if (!this.handles.has(input.id) || handle.generation !== this.epoch) {
        this.push("stale", handle);
        throw error;
      }
      handle.state = "failed";
      handle.error = error instanceof Error ? error.message : "font load failed";
      this.push("failed", handle);
      emitDiagnostic(this.onDiagnostic, {
        severity: "error",
        code: "FONT_LOAD_FAILED",
        message: handle.error,
        details: { id: input.id },
      });
      throw error;
    }
  }

  async preload(ids: readonly string[], signal?: AbortSignal): Promise<void> {
    await Promise.all(
      ids.map(async (id) => {
        const handle = this.handles.get(id);
        if (!handle) throw new HudError("INVALID_ARGUMENT", "Unknown font id.", { id });
        if (handle.state === "ready") return;
        const pending = this.inflight.get(handle.cacheKey);
        if (pending) await pending.promise;
        if (signal?.aborted) throw abortError();
      }),
    );
  }

  unregister(id: string): boolean {
    const handle = this.handles.get(id);
    if (!handle) return false;
    this.handles.delete(id);
    handle.state = "disposed";
    this.dropRef(handle.cacheKey);
    this.push("unregister", handle);
    return true;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.epoch += 1;
    for (const handle of [...this.handles.values()]) {
      handle.state = "disposed";
      this.push("dispose", handle);
    }
    this.handles.clear();
    this.faces.clear();
    this.refs.clear();
    this.inflight.clear();
  }

  private async shareLoad(
    input: FontRegistration,
    cacheKey: string,
    signal?: AbortSignal,
  ): Promise<ParsedFontFace> {
    const existing = this.inflight.get(cacheKey);
    const controller = new AbortController();
    const onAbort = (): void => controller.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    if (existing) {
      this.push("dedupe", {
        id: input.id,
        cacheKey,
        state: "loading",
        metadata: resolveFontMetadata(input),
        generation: this.epoch,
        registration: input,
      });
      existing.controllers.add(controller);
      try {
        return await existing.promise;
      } finally {
        signal?.removeEventListener("abort", onAbort);
      }
    }
    const promise = this.load(input, controller.signal);
    const controllers = new Set([controller]);
    this.inflight.set(cacheKey, { promise, controllers });
    try {
      return await promise;
    } finally {
      signal?.removeEventListener("abort", onAbort);
      this.inflight.delete(cacheKey);
    }
  }

  private dropRef(cacheKey: string): void {
    const next = (this.refs.get(cacheKey) ?? 1) - 1;
    if (next > 0) {
      this.refs.set(cacheKey, next);
      return;
    }
    this.refs.delete(cacheKey);
    this.faces.delete(cacheKey);
  }

  private releaseFace(face: ParsedFontFace): void {
    if (!face.owned) return;
  }

  private push(type: FontLifecycleEvent["type"], handle: MutableHandle): void {
    this.log.push(
      Object.freeze({
        type,
        id: handle.id,
        cacheKey: handle.cacheKey,
        generation: handle.generation,
      }),
    );
    if (this.log.length > 64) this.log.shift();
  }

  private assertAlive(): void {
    if (this.disposed) throw new HudError("RESOURCE_DISPOSED", "FontRegistry is disposed.");
  }
}

export async function defaultFontLoad(
  registration: FontRegistration,
  signal: AbortSignal,
): Promise<ParsedFontFace> {
  if (signal.aborted) throw abortError();
  const cacheKey = fontCacheKey(registration);
  if (isPreprocessedFontAsset(registration.source)) {
    return Object.freeze({ cacheKey, owned: false, unitsPerEm: registration.unitsPerEm ?? 1000 });
  }
  if (typeof registration.source !== "string" && !(registration.source instanceof URL)) {
    return Object.freeze({ cacheKey, owned: true, unitsPerEm: registration.unitsPerEm ?? 1000 });
  }
  throw new HudError(
    "FONT_LOAD_FAILED",
    "URL font sources require an injected loader in this milestone.",
    {
      id: registration.id,
    },
  );
}

function freezeHandle(handle: MutableHandle): FontHandle {
  return Object.freeze({
    id: handle.id,
    cacheKey: handle.cacheKey,
    state: handle.state,
    metadata: handle.metadata,
    generation: handle.generation,
    ...(handle.error ? { error: handle.error } : {}),
  });
}

function abortError(): Error {
  const error = new Error("The font load was aborted.");
  error.name = "AbortError";
  return error;
}
