import type { HudDiagnosticHandler } from "../../contracts/diagnostics.js";
import { emitDiagnostic } from "../../contracts/diagnostics.js";
import type { ParsedFontFace, ParsedGlyph, WindfoilPreprocessResult } from "./types.js";
import { preprocessWindfoilFace } from "./preprocess.js";

export type AtlasEnsureResult = Readonly<{
  fontId: string;
  requested: number;
  preparedNew: number;
  reused: number;
  curveCount: number;
}>;

export type AtlasDiagnostics = Readonly<{
  fontCount: number;
  glyphCount: number;
  curveCount: number;
  cpuBytes: number;
  gpuBytes: number;
  highWaterBytes: number;
  uploads: number;
  evictions: number;
}>;

export type WindfoilGlyphAtlasOptions = Readonly<{
  maxCurves?: number;
  onDiagnostic?: HudDiagnosticHandler;
}>;

type FontSlot = {
  face: ParsedFontFace;
  prepared: Set<number>;
  preprocess: WindfoilPreprocessResult | null;
};

export class WindfoilGlyphAtlas {
  private readonly fonts = new Map<string, FontSlot>();
  private readonly maxCurves: number;
  private readonly onDiagnostic: HudDiagnosticHandler | undefined;
  private highWaterBytes = 0;
  private uploads = 0;
  private evictions = 0;
  private disposed = false;

  constructor(options: WindfoilGlyphAtlasOptions = {}) {
    this.maxCurves = options.maxCurves ?? 1_000_000;
    this.onDiagnostic = options.onDiagnostic;
  }

  ensureGlyphs(
    fontId: string,
    glyphIds: readonly number[],
    face: ParsedFontFace,
  ): AtlasEnsureResult {
    this.assertAlive();
    let slot = this.fonts.get(fontId);
    if (!slot) {
      slot = { face, prepared: new Set(), preprocess: null };
      this.fonts.set(fontId, slot);
    }
    const requested = glyphIds.length;
    const missing: number[] = [];
    let reused = 0;
    for (const id of glyphIds) {
      if (slot.prepared.has(id)) reused += 1;
      else if (!missing.includes(id)) missing.push(id);
    }
    if (missing.length === 0) {
      return Object.freeze({
        fontId,
        requested,
        preparedNew: 0,
        reused,
        curveCount: slot.preprocess?.curves.length ?? 0,
      });
    }
    const subset = subsetFace(face, missing);
    const extra = preprocessWindfoilFace(subset);
    const currentCurves = slot.preprocess?.curves.length ?? 0;
    if (currentCurves + extra.curves.length > this.maxCurves) {
      emitDiagnostic(this.onDiagnostic, {
        severity: "error",
        code: "ATLAS_ALLOCATION_FAILED",
        message: "Windfoil atlas exceeded the curve budget.",
        details: { fontId, needed: extra.curves.length, maxCurves: this.maxCurves },
      });
      return Object.freeze({
        fontId,
        requested,
        preparedNew: 0,
        reused,
        curveCount: currentCurves,
      });
    }
    slot.preprocess = mergePreprocess(slot.preprocess, extra);
    for (const id of missing) slot.prepared.add(id);
    this.uploads += 1;
    const bytes = this.cpuBytes();
    this.highWaterBytes = Math.max(this.highWaterBytes, bytes);
    return Object.freeze({
      fontId,
      requested,
      preparedNew: missing.length,
      reused,
      curveCount: slot.preprocess.curves.length,
    });
  }

  preprocessFor(fontId: string): WindfoilPreprocessResult | null {
    return this.fonts.get(fontId)?.preprocess ?? null;
  }

  diagnostics(): AtlasDiagnostics {
    let glyphCount = 0;
    let curveCount = 0;
    for (const slot of this.fonts.values()) {
      glyphCount += slot.prepared.size;
      curveCount += slot.preprocess?.curves.length ?? 0;
    }
    const cpuBytes = this.cpuBytes();
    return Object.freeze({
      fontCount: this.fonts.size,
      glyphCount,
      curveCount,
      cpuBytes,
      gpuBytes: cpuBytes,
      highWaterBytes: this.highWaterBytes,
      uploads: this.uploads,
      evictions: this.evictions,
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.evictions += this.fonts.size;
    this.fonts.clear();
    this.highWaterBytes = 0;
    this.uploads = 0;
  }

  private cpuBytes(): number {
    let bytes = 0;
    for (const slot of this.fonts.values()) {
      const prep = slot.preprocess;
      if (!prep) continue;
      bytes += prep.curves.length * 24;
      bytes += prep.bandCurves.length * 4;
      bytes += prep.glyphs.length * 32;
    }
    return bytes;
  }

  private assertAlive(): void {
    if (this.disposed) throw new Error("Windfoil glyph atlas is disposed.");
  }
}

function subsetFace(face: ParsedFontFace, glyphIds: readonly number[]): ParsedFontFace {
  const wanted = new Set(glyphIds);
  const glyphs: ParsedGlyph[] = [];
  for (const glyph of face.glyphs) {
    if (wanted.has(glyph.glyphId)) glyphs.push(glyph);
  }
  return {
    ...face,
    glyphs,
  };
}

function mergePreprocess(
  current: WindfoilPreprocessResult | null,
  extra: WindfoilPreprocessResult,
): WindfoilPreprocessResult {
  if (!current) return extra;
  const curveOffset = current.curves.length;
  const bandOffset = current.bandOffsets.length;
  const glyphs = [
    ...current.glyphs,
    ...extra.glyphs.map((glyph) =>
      Object.freeze({
        ...glyph,
        curveStart: glyph.curveStart + curveOffset,
        bandStart: glyph.bandStart + bandOffset,
      }),
    ),
  ];
  const bandOffsets = [
    ...current.bandOffsets,
    ...extra.bandOffsets.map((value) => value + current.bandCurves.length),
  ];
  return {
    ...current,
    glyphs,
    curves: [...current.curves, ...extra.curves],
    bandOffsets,
    bandCurves: [...current.bandCurves, ...extra.bandCurves],
    stats: {
      glyphCount: glyphs.length,
      emptyGlyphCount: glyphs.filter((glyph) => glyph.empty).length,
      curveCount: current.curves.length + extra.curves.length,
      bandCount: bandOffsets.length,
      rowBytes: (current.curves.length + extra.curves.length) * 24,
    },
    hash: `${current.hash}+${extra.hash}`,
  };
}
