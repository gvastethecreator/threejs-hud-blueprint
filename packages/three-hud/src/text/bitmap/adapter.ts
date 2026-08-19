import { HudError } from "../../contracts/errors.js";
import type { TextBackendCapabilities } from "../../contracts/capabilities.js";
import type { GlyphRun, TextBackend } from "../contracts.js";
import { type BitmapFontManifest, validateBitmapManifest } from "./manifest.js";

export type PreparedBitmapGlyph = Readonly<{
  glyphId: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}>;

export type PreparedBitmapText = Readonly<{
  id: number;
  fontId: string;
  text: string;
  glyphCount: number;
  missing: number;
  atlasWidth: number;
  atlasHeight: number;
  glyphs: readonly PreparedBitmapGlyph[];
}>;

export type BitmapTextBackendOptions = Readonly<{
  manifest?: BitmapFontManifest;
  runtimeRasterization?: boolean;
}>;

type MutablePrepared = {
  id: number;
  fontId: string;
  text: string;
  glyphCount: number;
  missing: number;
  atlasWidth: number;
  atlasHeight: number;
  glyphs: PreparedBitmapGlyph[];
};

export class BitmapTextBackend implements TextBackend {
  readonly id = "bitmap";
  readonly capabilities: TextBackendCapabilities;
  private readonly manifest: BitmapFontManifest | null;
  private disposed = false;
  private nextId = 1;
  private readonly prepared = new Map<number, MutablePrepared>();

  constructor(options: BitmapTextBackendOptions = {}) {
    this.manifest = options.manifest ? validateBitmapManifest(options.manifest) : null;
    this.capabilities = Object.freeze({
      id: "bitmap",
      rendererKinds: ["webgl", "webgpu"] as const,
      scalableCoverage: false,
      pixelPerfect: true,
      dynamicGlyphs: options.runtimeRasterization === true,
      colorGlyphs: true,
      rotation: "bounded",
      deviceLossRecovery: false,
      status: this.manifest ? "supported" : "planned",
    });
  }

  prepare(run: GlyphRun): PreparedBitmapText {
    this.assertAlive();
    if (!this.manifest)
      throw new HudError("FEATURE_UNAVAILABLE", "Bitmap backend has no validated manifest.", {
        ticket: "HUD-044",
      });
    const known = new Set(this.manifest.glyphs.map((glyph) => glyph.id));
    const missing = run.glyphs.filter(
      (glyph) => glyph.glyphId !== 0 && !known.has(glyph.glyphId),
    ).length;
    const atlasWidth = Math.max(1, ...this.manifest.glyphs.map((glyph) => glyph.x + glyph.width));
    const atlasHeight = Math.max(1, ...this.manifest.glyphs.map((glyph) => glyph.y + glyph.height));
    const byId = new Map(this.manifest.glyphs.map((glyph) => [glyph.id, glyph]));
    const glyphs = run.glyphs.map((glyph) => {
      const cell = byId.get(glyph.glyphId);
      if (!cell) return { glyphId: glyph.glyphId, u0: 0, v0: 0, u1: 0, v1: 0 };
      return {
        glyphId: glyph.glyphId,
        u0: cell.x / atlasWidth,
        v0: 1 - (cell.y + cell.height) / atlasHeight,
        u1: (cell.x + cell.width) / atlasWidth,
        v1: 1 - cell.y / atlasHeight,
      };
    });
    const record: MutablePrepared = {
      id: this.nextId,
      fontId: run.fontId,
      text: run.text,
      glyphCount: run.glyphs.length,
      missing,
      atlasWidth,
      atlasHeight,
      glyphs,
    };
    this.nextId += 1;
    this.prepared.set(record.id, record);
    return Object.freeze({ ...record, glyphs: Object.freeze(glyphs.slice()) });
  }

  update(prepared: unknown, run: GlyphRun): void {
    const record = this.asPrepared(prepared);
    record.fontId = run.fontId;
    record.text = run.text;
    record.glyphCount = run.glyphs.length;
    if (this.manifest) {
      const atlasWidth = record.atlasWidth;
      const atlasHeight = record.atlasHeight;
      const byId = new Map(this.manifest.glyphs.map((glyph) => [glyph.id, glyph]));
      record.glyphs = run.glyphs.map((glyph) => {
        const cell = byId.get(glyph.glyphId);
        if (!cell) return { glyphId: glyph.glyphId, u0: 0, v0: 0, u1: 0, v1: 0 };
        return {
          glyphId: glyph.glyphId,
          u0: cell.x / atlasWidth,
          v0: 1 - (cell.y + cell.height) / atlasHeight,
          u1: (cell.x + cell.width) / atlasWidth,
          v1: 1 - cell.y / atlasHeight,
        };
      });
    }
  }

  disposePrepared(prepared: unknown): void {
    this.prepared.delete(this.asPrepared(prepared).id);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.prepared.clear();
  }

  private asPrepared(prepared: unknown): MutablePrepared {
    this.assertAlive();
    if (!prepared || typeof prepared !== "object" || !("id" in prepared)) {
      throw new HudError("INVALID_ARGUMENT", "Prepared bitmap resource is invalid.");
    }
    const record = this.prepared.get((prepared as PreparedBitmapText).id);
    if (!record) throw new HudError("RESOURCE_DISPOSED", "Prepared bitmap resource is disposed.");
    return record;
  }

  private assertAlive(): void {
    if (this.disposed) throw new HudError("RESOURCE_DISPOSED", "Bitmap text backend is disposed.");
  }
}

export function createBitmapTextBackend(options: BitmapTextBackendOptions = {}): BitmapTextBackend {
  return new BitmapTextBackend(options);
}

export function rasterizeBitmapManifest(input: BitmapFontManifest): BitmapFontManifest {
  return validateBitmapManifest(input);
}
