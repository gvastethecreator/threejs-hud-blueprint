import type { ReadonlyRect } from "../../contracts/geometry.js";

export type FontPoint = Readonly<{ x: number; y: number }>;

export type OutlineCommand =
  | { readonly type: "move"; readonly p: FontPoint }
  | { readonly type: "line"; readonly p: FontPoint }
  | { readonly type: "quadratic"; readonly c: FontPoint; readonly p: FontPoint }
  | {
      readonly type: "cubic";
      readonly c1: FontPoint;
      readonly c2: FontPoint;
      readonly p: FontPoint;
    }
  | { readonly type: "close" };

export type ParsedGlyph = Readonly<{
  glyphId: number;
  advanceWidth: number;
  leftSideBearing: number;
  contours: readonly (readonly OutlineCommand[])[];
  empty: boolean;
}>;

export type ParsedFontFace = Readonly<{
  unitsPerEm: number;
  ascender: number;
  descender: number;
  lineGap: number;
  glyphs: readonly ParsedGlyph[];
  unicodeToGlyph: Readonly<Record<string, number>>;
  kerning: Readonly<Record<string, number>>;
}>;

export type QuadraticSegment = Readonly<{
  p0: FontPoint;
  p1: FontPoint;
  p2: FontPoint;
}>;

export const CUBIC_APPROXIMATION_POLICY = Object.freeze({
  method: "midpoint-subdivision",
  tolerance: 0.5,
  maxDepth: 8,
  description:
    "A cubic becomes a quadratic whose control is (3*c1 - p0 + 3*c2 - p3)/4. If t=0.5 samples differ by more than 0.5 font units, the cubic splits at t=0.5 and each half converts recursively, at most 8 deep.",
});

export type WindfoilGlyphRecord = Readonly<{
  glyphId: number;
  advanceWidth: number;
  leftSideBearing: number;
  bounds: ReadonlyRect;
  empty: boolean;
  curveStart: number;
  curveCount: number;
  bandStart: number;
  bandCount: number;
}>;

export type WindfoilPreprocessOptions = Readonly<{
  bandHeight?: number;
  cubicTolerance?: number;
  cubicMaxDepth?: number;
}>;

export type WindfoilCubicPolicy = Readonly<{
  method: "midpoint-subdivision";
  tolerance: number;
  maxDepth: number;
}>;

export type WindfoilPreprocessPayload = Readonly<{
  schemaVersion: "three-hud/windfoil-preprocess/v0";
  unitsPerEm: number;
  ascender: number;
  descender: number;
  lineGap: number;
  cubicPolicy: WindfoilCubicPolicy;
  bandHeight: number;
  glyphs: readonly WindfoilGlyphRecord[];
  curves: readonly QuadraticSegment[];
  bandOffsets: readonly number[];
  bandCurves: readonly number[];
  kerning: Readonly<Record<string, number>>;
  unicodeToGlyph: Readonly<Record<string, number>>;
  stats: Readonly<{
    glyphCount: number;
    emptyGlyphCount: number;
    curveCount: number;
    bandCount: number;
    rowBytes: number;
  }>;
}>;

export type WindfoilPreprocessResult = WindfoilPreprocessPayload &
  Readonly<{
    hash: string;
  }>;
