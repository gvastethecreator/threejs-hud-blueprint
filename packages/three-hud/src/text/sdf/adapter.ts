import { HudError } from "../../contracts/errors.js";
import type { HudRendererKind, TextBackendCapabilities } from "../../contracts/capabilities.js";
import type { GlyphRun, TextBackend } from "../contracts.js";
import { ASCII_ATLAS_HEIGHT, ASCII_ATLAS_WIDTH, atlasUv, rasterAsciiAtlas } from "../asciiAtlas.js";

export const SDF_PACKAGE_SUBPATH = "@scope/three-hud/text/sdf";

export type PreparedSdfGlyph = Readonly<{
  glyphId: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}>;

export type PreparedSdfText = Readonly<{
  id: number;
  fontId: string;
  fontSize: number;
  text: string;
  glyphCount: number;
  opacity: number;
  clip: boolean;
  atlasWidth: number;
  atlasHeight: number;
  sdf: true;
  glyphs: readonly PreparedSdfGlyph[];
}>;

export type SdfTextBackendOptions = Readonly<{
  adapterId?: string;
  webgpuMode?: "encode-only" | "unsupported";
}>;

type MutablePrepared = {
  id: number;
  fontId: string;
  fontSize: number;
  text: string;
  glyphCount: number;
  opacity: number;
  clip: boolean;
  atlasWidth: number;
  atlasHeight: number;
  sdf: true;
  glyphs: PreparedSdfGlyph[];
  atlas: Uint8Array;
};

export class SdfTextBackend implements TextBackend {
  readonly id: string;
  readonly capabilities: TextBackendCapabilities;
  readonly webgpuMode: "encode-only" | "unsupported";
  private disposed = false;
  private nextId = 1;
  private readonly prepared = new Map<number, MutablePrepared>();

  constructor(options: SdfTextBackendOptions = {}) {
    this.id = options.adapterId ?? "sdf";
    this.webgpuMode = options.webgpuMode ?? "encode-only";
    const rendererKinds: readonly HudRendererKind[] =
      this.webgpuMode === "unsupported" ? ["webgl"] : ["webgl", "webgpu"];
    this.capabilities = Object.freeze({
      id: this.id,
      rendererKinds,
      scalableCoverage: true,
      pixelPerfect: false,
      dynamicGlyphs: true,
      colorGlyphs: false,
      rotation: "full",
      deviceLossRecovery: false,
      status: "supported",
    });
  }

  prepare(run: GlyphRun): PreparedSdfText {
    this.assertAlive();
    const glyphs = run.glyphs.map((glyph) => {
      const code = Number.parseInt(glyph.glyphKey, 10);
      const uv = atlasUv(Number.isFinite(code) ? code : glyph.glyphId);
      return { glyphId: glyph.glyphId, u0: uv.u0, v0: uv.v0, u1: uv.u1, v1: uv.v1 };
    });
    const record: MutablePrepared = {
      id: this.nextId,
      fontId: run.fontId,
      fontSize: run.fontSize,
      text: run.text,
      glyphCount: run.glyphs.length,
      opacity: 1,
      clip: false,
      atlasWidth: ASCII_ATLAS_WIDTH,
      atlasHeight: ASCII_ATLAS_HEIGHT,
      sdf: true,
      glyphs,
      atlas: rasterAsciiAtlas(true),
    };
    this.nextId += 1;
    this.prepared.set(record.id, record);
    const { atlas: _atlas, ...publicRecord } = record;
    return Object.freeze({ ...publicRecord, glyphs: Object.freeze(glyphs.slice()) });
  }

  update(prepared: unknown, run: GlyphRun): void {
    this.assertAlive();
    const record = this.asPrepared(prepared);
    record.fontId = run.fontId;
    record.fontSize = run.fontSize;
    record.text = run.text;
    record.glyphCount = run.glyphs.length;
    record.glyphs = run.glyphs.map((glyph) => {
      const code = Number.parseInt(glyph.glyphKey, 10);
      const uv = atlasUv(Number.isFinite(code) ? code : glyph.glyphId);
      return { glyphId: glyph.glyphId, u0: uv.u0, v0: uv.v0, u1: uv.u1, v1: uv.v1 };
    });
  }

  disposePrepared(prepared: unknown): void {
    const record = this.asPrepared(prepared);
    this.prepared.delete(record.id);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.prepared.clear();
  }

  private asPrepared(prepared: unknown): MutablePrepared {
    if (!prepared || typeof prepared !== "object" || !("id" in prepared)) {
      throw new HudError("INVALID_ARGUMENT", "Prepared SDF resource is invalid.");
    }
    const record = this.prepared.get((prepared as PreparedSdfText).id);
    if (!record) throw new HudError("RESOURCE_DISPOSED", "Prepared SDF resource is disposed.");
    return record;
  }

  private assertAlive(): void {
    if (this.disposed) throw new HudError("RESOURCE_DISPOSED", "SDF text backend is disposed.");
  }
}

export function createSdfTextBackend(options: SdfTextBackendOptions = {}): SdfTextBackend {
  return new SdfTextBackend(options);
}
