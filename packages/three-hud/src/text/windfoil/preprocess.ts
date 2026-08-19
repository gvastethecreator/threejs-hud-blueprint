import { HudError } from "../../contracts/errors.js";
import { parseTrueTypeFont } from "./parseTrueType.js";
import {
  CUBIC_APPROXIMATION_POLICY,
  type FontPoint,
  type OutlineCommand,
  type ParsedFontFace,
  type ParsedGlyph,
  type QuadraticSegment,
  type WindfoilGlyphRecord,
  type WindfoilPreprocessOptions,
  type WindfoilPreprocessPayload,
  type WindfoilPreprocessResult,
} from "./types.js";

export { CUBIC_APPROXIMATION_POLICY, parseTrueTypeFont };
export type {
  FontPoint,
  OutlineCommand,
  ParsedFontFace,
  ParsedGlyph,
  QuadraticSegment,
  WindfoilGlyphRecord,
  WindfoilPreprocessOptions,
  WindfoilPreprocessResult,
} from "./types.js";

const SCHEMA = "three-hud/windfoil-preprocess/v0" as const;

export function preprocessWindfoilFont(
  source: ArrayBuffer | Uint8Array,
  options: WindfoilPreprocessOptions = {},
): WindfoilPreprocessResult {
  return preprocessWindfoilFace(parseTrueTypeFont(source), options);
}

export function preprocessWindfoilFace(
  face: ParsedFontFace,
  options: WindfoilPreprocessOptions = {},
): WindfoilPreprocessResult {
  const tolerance = options.cubicTolerance ?? CUBIC_APPROXIMATION_POLICY.tolerance;
  const maxDepth = options.cubicMaxDepth ?? CUBIC_APPROXIMATION_POLICY.maxDepth;
  const bandHeight = options.bandHeight ?? 32;
  if (!(bandHeight > 0) || !Number.isFinite(bandHeight)) {
    throw new HudError("INVALID_ARGUMENT", "bandHeight must be a finite positive number.", {
      bandHeight,
    });
  }
  const curves: QuadraticSegment[] = [];
  const bandOffsets: number[] = [];
  const bandCurves: number[] = [];
  const glyphs: WindfoilGlyphRecord[] = [];
  let emptyGlyphCount = 0;
  for (const glyph of face.glyphs) {
    glyphs.push(
      prepareGlyph(glyph, { curves, bandOffsets, bandCurves, tolerance, maxDepth, bandHeight }),
    );
    if (glyph.empty) emptyGlyphCount += 1;
  }
  const resultWithoutHash = {
    schemaVersion: SCHEMA,
    unitsPerEm: face.unitsPerEm,
    ascender: face.ascender,
    descender: face.descender,
    lineGap: face.lineGap,
    cubicPolicy: Object.freeze({
      method: CUBIC_APPROXIMATION_POLICY.method,
      tolerance,
      maxDepth,
    }),
    bandHeight,
    glyphs: Object.freeze(glyphs),
    curves: Object.freeze(curves),
    bandOffsets: Object.freeze(bandOffsets),
    bandCurves: Object.freeze(bandCurves),
    kerning: face.kerning,
    unicodeToGlyph: face.unicodeToGlyph,
    stats: Object.freeze({
      glyphCount: glyphs.length,
      emptyGlyphCount,
      curveCount: curves.length,
      bandCount: bandOffsets.length,
      rowBytes: bandCurves.length * 4 + bandOffsets.length * 4,
    }),
  };
  const hash = fnv1a32(serializeWindfoilPreprocess(resultWithoutHash));
  return Object.freeze({ ...resultWithoutHash, hash });
}

export function serializeWindfoilPreprocess(
  result: WindfoilPreprocessPayload | WindfoilPreprocessResult,
): string {
  return JSON.stringify({
    schemaVersion: result.schemaVersion,
    unitsPerEm: result.unitsPerEm,
    ascender: result.ascender,
    descender: result.descender,
    lineGap: result.lineGap,
    cubicPolicy: result.cubicPolicy,
    bandHeight: result.bandHeight,
    glyphs: result.glyphs,
    curves: result.curves,
    bandOffsets: result.bandOffsets,
    bandCurves: result.bandCurves,
    kerning: result.kerning,
    unicodeToGlyph: result.unicodeToGlyph,
    stats: result.stats,
  });
}

function prepareGlyph(
  glyph: ParsedGlyph,
  ctx: {
    curves: QuadraticSegment[];
    bandOffsets: number[];
    bandCurves: number[];
    tolerance: number;
    maxDepth: number;
    bandHeight: number;
  },
): WindfoilGlyphRecord {
  const curveStart = ctx.curves.length;
  if (glyph.empty) {
    return Object.freeze({
      glyphId: glyph.glyphId,
      advanceWidth: glyph.advanceWidth,
      leftSideBearing: glyph.leftSideBearing,
      bounds: Object.freeze({ x: 0, y: 0, width: 0, height: 0 }),
      empty: true,
      curveStart,
      curveCount: 0,
      bandStart: ctx.bandOffsets.length,
      bandCount: 0,
    });
  }
  for (const contour of glyph.contours)
    appendQuadratics(contour, ctx.curves, ctx.tolerance, ctx.maxDepth);
  const curveCount = ctx.curves.length - curveStart;
  const bounds = boundsForCurves(ctx.curves, curveStart, curveCount);
  const bandStart = ctx.bandOffsets.length;
  const bandCount = Math.max(1, Math.ceil(bounds.height / ctx.bandHeight));
  for (let band = 0; band < bandCount; band += 1) {
    ctx.bandOffsets.push(ctx.bandCurves.length);
    const y0 = bounds.y + band * ctx.bandHeight;
    const y1 = y0 + ctx.bandHeight;
    for (let index = 0; index < curveCount; index += 1) {
      const curve = ctx.curves[curveStart + index];
      if (!curve) continue;
      const range = curveYRange(curve);
      if (range.max >= y0 && range.min <= y1) ctx.bandCurves.push(index);
    }
  }
  return Object.freeze({
    glyphId: glyph.glyphId,
    advanceWidth: glyph.advanceWidth,
    leftSideBearing: glyph.leftSideBearing,
    bounds,
    empty: false,
    curveStart,
    curveCount,
    bandStart,
    bandCount,
  });
}

function appendQuadratics(
  contour: readonly OutlineCommand[],
  curves: QuadraticSegment[],
  tolerance: number,
  maxDepth: number,
): void {
  let start: FontPoint | undefined;
  let current: FontPoint | undefined;
  for (const command of contour) {
    if (command.type === "move") {
      start = command.p;
      current = command.p;
      continue;
    }
    if (!current) continue;
    if (command.type === "line") {
      curves.push(lineToQuadratic(current, command.p));
      current = command.p;
    } else if (command.type === "quadratic") {
      curves.push(Object.freeze({ p0: current, p1: command.c, p2: command.p }));
      current = command.p;
    } else if (command.type === "cubic") {
      for (const segment of cubicToQuadratics(
        current,
        command.c1,
        command.c2,
        command.p,
        tolerance,
        maxDepth,
        0,
      )) {
        curves.push(segment);
      }
      current = command.p;
    } else if (
      command.type === "close" &&
      start &&
      (current.x !== start.x || current.y !== start.y)
    ) {
      curves.push(lineToQuadratic(current, start));
      current = start;
    }
  }
}

function lineToQuadratic(from: FontPoint, to: FontPoint): QuadraticSegment {
  return Object.freeze({
    p0: from,
    p1: Object.freeze({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }),
    p2: to,
  });
}

function cubicToQuadratics(
  p0: FontPoint,
  c1: FontPoint,
  c2: FontPoint,
  p3: FontPoint,
  tolerance: number,
  maxDepth: number,
  depth: number,
): QuadraticSegment[] {
  const control = Object.freeze({
    x: (3 * c1.x - p0.x + 3 * c2.x - p3.x) / 4,
    y: (3 * c1.y - p0.y + 3 * c2.y - p3.y) / 4,
  });
  const cubicMid = bezierCubic(p0, c1, c2, p3, 0.5);
  const quadMid = bezierQuadratic(p0, control, p3, 0.5);
  const error = Math.hypot(cubicMid.x - quadMid.x, cubicMid.y - quadMid.y);
  if (error <= tolerance || depth >= maxDepth) {
    return [Object.freeze({ p0, p1: control, p2: p3 })];
  }
  const split = splitCubic(p0, c1, c2, p3);
  return [
    ...cubicToQuadratics(
      split.left[0],
      split.left[1],
      split.left[2],
      split.left[3],
      tolerance,
      maxDepth,
      depth + 1,
    ),
    ...cubicToQuadratics(
      split.right[0],
      split.right[1],
      split.right[2],
      split.right[3],
      tolerance,
      maxDepth,
      depth + 1,
    ),
  ];
}

function splitCubic(p0: FontPoint, c1: FontPoint, c2: FontPoint, p3: FontPoint) {
  const a = mid(p0, c1);
  const b = mid(c1, c2);
  const c = mid(c2, p3);
  const d = mid(a, b);
  const e = mid(b, c);
  const f = mid(d, e);
  return { left: [p0, a, d, f] as const, right: [f, e, c, p3] as const };
}

function bezierCubic(
  p0: FontPoint,
  c1: FontPoint,
  c2: FontPoint,
  p3: FontPoint,
  t: number,
): FontPoint {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
  };
}

function bezierQuadratic(p0: FontPoint, p1: FontPoint, p2: FontPoint, t: number): FontPoint {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function mid(a: FontPoint, b: FontPoint): FontPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function boundsForCurves(curves: readonly QuadraticSegment[], start: number, count: number) {
  if (count === 0) return Object.freeze({ x: 0, y: 0, width: 0, height: 0 });
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const curve = curves[start + i];
    if (!curve) continue;
    for (const point of sampleCurveBounds(curve)) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }
  return Object.freeze({ x: minX, y: minY, width: maxX - minX, height: maxY - minY });
}

function sampleCurveBounds(curve: QuadraticSegment): FontPoint[] {
  const points: FontPoint[] = [curve.p0, curve.p1, curve.p2];
  for (const axis of ["x", "y"] as const) {
    const a = curve.p0[axis];
    const b = curve.p1[axis];
    const c = curve.p2[axis];
    const denom = a - 2 * b + c;
    if (denom === 0) continue;
    const t = (a - b) / denom;
    if (t > 0 && t < 1) points.push(bezierQuadratic(curve.p0, curve.p1, curve.p2, t));
  }
  return points;
}

function curveYRange(curve: QuadraticSegment): { min: number; max: number } {
  const samples = sampleCurveBounds(curve);
  let min = Infinity;
  let max = -Infinity;
  for (const point of samples) {
    min = Math.min(min, point.y);
    max = Math.max(max, point.y);
  }
  return { min, max };
}

function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
