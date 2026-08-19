import type { FeatureSupport, TextBackendCapabilities } from "../../contracts/capabilities.js";
import { HudError } from "../../contracts/errors.js";
import type { GlyphRun, TextBackend } from "../contracts.js";
import type { HudDiagnosticHandler } from "../../contracts/diagnostics.js";
import { emitDiagnostic } from "../../contracts/diagnostics.js";
import {
  diagnoseWindfoilScale,
  WINDFOIL_RESTORE_POLICY,
  type WindfoilRuntimeState,
} from "./limits.js";
import { encodeWindfoilInstances, type EncodedWindfoilDraw } from "./threeSpike.js";
import type { WindfoilPreprocessResult } from "./types.js";

export const WINDFOIL_PACKAGE_SUBPATH = "@scope/three-hud/text/windfoil";
export const WINDFOIL_EXPOSURE = "experimental" as const;

export type PreparedWindfoilText = Readonly<{
  id: number;
  generation: number;
  encoded: EncodedWindfoilDraw;
  fontId: string;
  fontSize: number;
  text: string;
}>;

export type WindfoilTextBackendOptions = Readonly<{
  exposure?: "experimental" | "blocked";
  capability?: FeatureSupport;
  preprocess?: WindfoilPreprocessResult;
  onDiagnostic?: HudDiagnosticHandler;
}>;

type MutablePrepared = {
  id: number;
  generation: number;
  encoded: EncodedWindfoilDraw;
  fontId: string;
  fontSize: number;
  text: string;
};

export class WindfoilTextBackend implements TextBackend {
  readonly id = "windfoil";
  readonly capabilities: TextBackendCapabilities;
  readonly exposure: "experimental" | "blocked";
  readonly restorePolicy = WINDFOIL_RESTORE_POLICY;
  runtimeState: WindfoilRuntimeState = "live";
  private preprocess: WindfoilPreprocessResult | null;
  private capability: FeatureSupport;
  private readonly onDiagnostic: HudDiagnosticHandler | undefined;
  private generation = 1;
  private nextPreparedId = 1;
  private attached = false;
  private disposed = false;
  private readonly prepared = new Map<number, MutablePrepared>();

  constructor(options: WindfoilTextBackendOptions = {}) {
    this.exposure = options.exposure ?? "experimental";
    this.preprocess = options.preprocess ?? null;
    this.capability = options.capability ?? {
      supported: false,
      status: "unsupported",
      reasons: [
        {
          code: "WINDFOIL_RENDERER_UNINITIALIZED",
          message: "No renderer capability was attached.",
        },
      ],
    };
    this.onDiagnostic = options.onDiagnostic;
    this.attached = options.preprocess !== undefined || options.capability !== undefined;
    this.capabilities = Object.freeze({
      id: "windfoil",
      rendererKinds: ["webgpu"] as const,
      scalableCoverage: true,
      pixelPerfect: false,
      dynamicGlyphs: true,
      colorGlyphs: false,
      rotation: "bounded",
      deviceLossRecovery: false,
      status: this.exposure === "blocked" ? "blocked" : "experimental",
    });
  }

  attach(
    options: { capability?: FeatureSupport; preprocess?: WindfoilPreprocessResult } = {},
  ): void {
    this.assertAlive();
    if (options.capability) this.capability = options.capability;
    if (options.preprocess) this.preprocess = options.preprocess;
    this.attached = true;
    this.generation += 1;
  }

  notifyDeviceLost(): void {
    if (this.disposed || this.runtimeState === "lost") return;
    this.runtimeState = "lost";
    this.generation += 1;
    this.prepared.clear();
    emitDiagnostic(this.onDiagnostic, {
      severity: "error",
      code: "WINDFOIL_DEVICE_LOST",
      message:
        "Windfoil GPU resources were invalidated by device loss. Restore is unsupported; create a new backend.",
      details: { restorePolicy: WINDFOIL_RESTORE_POLICY },
    });
  }

  detach(): void {
    this.assertAlive();
    this.attached = false;
    this.preprocess = null;
    this.generation += 1;
    this.prepared.clear();
  }

  prepare(run: GlyphRun): PreparedWindfoilText {
    this.assertAlive();
    if (this.capabilities.status === "blocked") {
      throw new HudError("FEATURE_UNAVAILABLE", "Windfoil backend is blocked.", {
        backendId: this.id,
      });
    }
    if (this.runtimeState === "lost") {
      throw new HudError("BACKEND_FAILED", "Windfoil backend is invalid after device loss.", {
        restorePolicy: WINDFOIL_RESTORE_POLICY,
      });
    }
    const record: MutablePrepared = {
      id: this.nextPreparedId,
      generation: this.generation,
      encoded: encodeGlyphRun(this.preprocess, run, this.onDiagnostic),
      fontId: run.fontId,
      fontSize: run.fontSize,
      text: run.text,
    };
    this.nextPreparedId += 1;
    this.prepared.set(record.id, record);
    return freezePrepared(record);
  }

  update(prepared: unknown, run: GlyphRun): void {
    this.assertAlive();
    const record = this.asPrepared(prepared);
    record.encoded = encodeGlyphRun(this.preprocess, run, this.onDiagnostic);
    record.fontId = run.fontId;
    record.fontSize = run.fontSize;
    record.text = run.text;
  }

  disposePrepared(prepared: unknown): void {
    const record = this.asPrepared(prepared);
    this.prepared.delete(record.id);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.runtimeState = "disposed";
    this.generation += 1;
    this.prepared.clear();
    this.preprocess = null;
    this.attached = false;
  }

  get isAttached(): boolean {
    return this.attached && !this.disposed;
  }

  get nativeWebgpu(): boolean {
    return this.capability.supported;
  }

  private asPrepared(prepared: unknown): MutablePrepared {
    if (!prepared || typeof prepared !== "object" || !("id" in prepared)) {
      throw new HudError("INVALID_ARGUMENT", "Prepared Windfoil resource is invalid.");
    }
    const id = (prepared as PreparedWindfoilText).id;
    const record = this.prepared.get(id);
    if (!record || record.generation !== this.generation) {
      throw new HudError("RESOURCE_DISPOSED", "Prepared Windfoil resource is disposed.");
    }
    return record;
  }

  private assertAlive(): void {
    if (this.disposed)
      throw new HudError("RESOURCE_DISPOSED", "Windfoil text backend is disposed.");
  }
}

export function createWindfoilTextBackend(
  options: WindfoilTextBackendOptions = {},
): WindfoilTextBackend {
  return new WindfoilTextBackend(options);
}

function encodeGlyphRun(
  preprocess: WindfoilPreprocessResult | null,
  run: GlyphRun,
  onDiagnostic?: HudDiagnosticHandler,
): EncodedWindfoilDraw {
  if (!preprocess) {
    return Object.freeze({
      instances: Object.freeze([]),
      instanceCount: 0,
      uniqueGlyphCount: 0,
      reusedInstanceCount: 0,
    });
  }
  const scale = run.fontSize / Math.max(1, preprocess.unitsPerEm);
  diagnoseWindfoilScale(scale, onDiagnostic);
  const known = new Set(preprocess.glyphs.map((glyph) => glyph.glyphId));
  const instances = run.glyphs
    .filter((glyph) => known.has(glyph.glyphId))
    .map((glyph) =>
      Object.freeze({
        glyphId: glyph.glyphId,
        x: glyph.x,
        y: glyph.y,
        scale,
        color: [1, 1, 1, 1] as const,
      }),
    );
  return encodeWindfoilInstances(preprocess, instances);
}

function freezePrepared(prepared: MutablePrepared): PreparedWindfoilText {
  return Object.freeze({
    id: prepared.id,
    generation: prepared.generation,
    encoded: prepared.encoded,
    fontId: prepared.fontId,
    fontSize: prepared.fontSize,
    text: prepared.text,
  });
}
