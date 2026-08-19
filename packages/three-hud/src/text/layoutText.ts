import type { HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { emitDiagnostic } from "../contracts/diagnostics.js";
import { createGlyphRun, type GlyphPlacement, type GlyphRun } from "./contracts.js";
import { normalizeTextStyle, type NormalizedTextStyle, type TextStyle } from "./textStyle.js";

export type LayoutFontFace = Readonly<{
  id: string;
  unitsPerEm: number;
  ascender: number;
  descender: number;
  lineGap: number;
  glyphId: (codePoint: number) => number;
  advance: (glyphId: number) => number;
  kerning: (left: number, right: number) => number;
}>;

export type LayoutTextResult = Readonly<{
  run: GlyphRun;
  width: number;
  height: number;
}>;

const COMPLEX_SCRIPT = /[\u0590-\u08FF\uFB1D-\uFEFC]/;

export function layoutText(
  text: string,
  style: TextStyle | NormalizedTextStyle,
  face: LayoutFontFace,
  onDiagnostic?: HudDiagnosticHandler,
): LayoutTextResult {
  const normalized =
    "letterSpacing" in style && "backend" in style
      ? (style as NormalizedTextStyle)
      : normalizeTextStyle(style as TextStyle);
  if (COMPLEX_SCRIPT.test(text)) {
    emitDiagnostic(onDiagnostic, {
      severity: "warning",
      code: "COMPLEX_SCRIPT_UNSUPPORTED",
      message: "v0.1 LTR layout does not claim complex-script correctness.",
      details: { fontId: face.id },
    });
  }
  const scale = normalized.size / face.unitsPerEm;
  const lineHeight =
    normalized.lineHeight === "normal"
      ? (face.ascender - face.descender + face.lineGap) * scale
      : normalized.lineHeight;
  const paragraphs = text.split("\n");
  const glyphs: GlyphPlacement[] = [];
  const lines: Array<{
    startGlyph: number;
    glyphCount: number;
    baselineY: number;
    width: number;
    bounds: { x: number; y: number; width: number; height: number };
  }> = [];
  let maxWidth = 0;
  let baseline = face.ascender * scale;

  const emitLine = (lineGlyphs: GlyphPlacement[], width: number): void => {
    const start = glyphs.length;
    const aligned = alignLine(lineGlyphs, width, normalized.align, normalized.maxWidth);
    glyphs.push(...aligned);
    lines.push({
      startGlyph: start,
      glyphCount: aligned.length,
      baselineY: baseline,
      width,
      bounds: {
        x: aligned[0]?.x ?? 0,
        y: baseline - face.ascender * scale,
        width,
        height: lineHeight,
      },
    });
    maxWidth = Math.max(maxWidth, width);
    baseline += lineHeight;
  };

  for (const paragraph of paragraphs.length ? paragraphs : [""]) {
    const wrapped = wrapParagraph(paragraph, normalized, face, scale);
    if (wrapped.length === 0) emitLine([], 0);
    for (const line of wrapped) emitLine(line.glyphs, line.width);
  }

  if (normalized.maxLines !== null && lines.length > normalized.maxLines) {
    const keep = lines.slice(0, normalized.maxLines);
    const last = keep[keep.length - 1];
    const end = last ? last.startGlyph + last.glyphCount : 0;
    glyphs.length = end;
    lines.length = 0;
    lines.push(...keep);
    baseline = (keep[keep.length - 1]?.baselineY ?? face.ascender * scale) + lineHeight;
  }

  const height = Math.max(lineHeight, lines.length * lineHeight);
  const run = createGlyphRun({
    fontId: face.id,
    fontSize: normalized.size,
    text,
    glyphs,
    lines,
    bounds: { x: 0, y: 0, width: maxWidth, height },
  });
  return Object.freeze({ run, width: maxWidth, height });
}

function wrapParagraph(
  paragraph: string,
  style: NormalizedTextStyle,
  face: LayoutFontFace,
  scale: number,
): Array<{ glyphs: GlyphPlacement[]; width: number }> {
  const tokens =
    style.wrap === "none"
      ? [paragraph]
      : style.wrap === "character"
        ? [...paragraph]
        : splitWords(paragraph);
  const lines: Array<{ glyphs: GlyphPlacement[]; width: number }> = [];
  let current: GlyphPlacement[] = [];
  let width = 0;
  const maxWidth = style.maxWidth;

  const flush = (): void => {
    lines.push({ glyphs: current, width });
    current = [];
    width = 0;
  };

  for (const token of tokens) {
    const shaped = shapeRun(token, face, scale, style.letterSpacing);
    if (maxWidth !== null && shaped.width > maxWidth && current.length === 0) {
      if (style.wrap === "word" && token.length > 1) {
        const inner = wrapParagraph(token, { ...style, wrap: "character" }, face, scale);
        for (const piece of inner) {
          if (current.length && maxWidth !== null && width + piece.width > maxWidth) flush();
          current.push(...offsetGlyphs(piece.glyphs, width));
          width += piece.width;
        }
        continue;
      }
      current = shaped.glyphs;
      width = shaped.width;
      flush();
      continue;
    }
    if (maxWidth !== null && current.length && width + shaped.width > maxWidth) flush();
    current.push(...offsetGlyphs(shaped.glyphs, width));
    width += shaped.width;
  }
  if (current.length || lines.length === 0) flush();
  return lines;
}

function splitWords(text: string): string[] {
  if (text.length === 0) return [""];
  const parts = text.split(/(\s+)/);
  return parts.length ? parts : [""];
}

function shapeRun(
  text: string,
  face: LayoutFontFace,
  scale: number,
  letterSpacing: number,
): { glyphs: GlyphPlacement[]; width: number } {
  const glyphs: GlyphPlacement[] = [];
  let x = 0;
  let previous: number | null = null;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const glyphId = face.glyphId(code);
    if (previous !== null) x += face.kerning(previous, glyphId) * scale;
    const advance = face.advance(glyphId) * scale;
    glyphs.push({
      glyphId,
      glyphKey: String(code),
      cluster: glyphs.length,
      x,
      y: 0,
      advance,
      advanceX: advance,
      advanceY: 0,
      offsetX: 0,
      offsetY: 0,
      line: 0,
    });
    x += advance + letterSpacing;
    previous = glyphId;
  }
  return { glyphs, width: x };
}

function offsetGlyphs(glyphs: GlyphPlacement[], dx: number): GlyphPlacement[] {
  return glyphs.map((glyph) => ({ ...glyph, x: glyph.x + dx }));
}

function alignLine(
  glyphs: GlyphPlacement[],
  width: number,
  align: NormalizedTextStyle["align"],
  maxWidth: number | null,
): GlyphPlacement[] {
  if (align === "left" || maxWidth === null) return glyphs;
  const extra = Math.max(0, maxWidth - width);
  const dx = align === "center" ? extra / 2 : extra;
  return offsetGlyphs(glyphs, dx);
}

export function createMonospaceFace(id: string, unitsPerEm = 1000, advance = 500): LayoutFontFace {
  return {
    id,
    unitsPerEm,
    ascender: 800,
    descender: -200,
    lineGap: 0,
    glyphId: (codePoint) => (codePoint === 32 ? 0 : codePoint),
    advance: () => advance,
    kerning: () => 0,
  };
}
