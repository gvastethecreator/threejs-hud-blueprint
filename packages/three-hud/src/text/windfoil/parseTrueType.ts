import { HudError } from "../../contracts/errors.js";
import type { FontPoint, OutlineCommand, ParsedFontFace, ParsedGlyph } from "./types.js";

const ON_CURVE = 1;
const X_SHORT = 2;
const Y_SHORT = 4;
const REPEAT = 8;
const X_SAME_OR_POSITIVE = 16;
const Y_SAME_OR_POSITIVE = 32;

export function parseTrueTypeFont(source: ArrayBuffer | Uint8Array): ParsedFontFace {
  const bytes = source instanceof ArrayBuffer ? new Uint8Array(source) : source;
  if (bytes.byteLength < 12) throw fontError("Font bytes are too short to be a TrueType file.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const scalar = view.getUint32(0);
  if (scalar === 0x4f54544f) throw fontError("CFF/OTTO fonts are unsupported.", { format: "CFF" });
  if (scalar !== 0x00010000 && scalar !== 0x74727565) {
    throw fontError("Bytes are not a TrueType font.", { format: scalar });
  }
  const tableCount = view.getUint16(4);
  const tables = new Map<string, { offset: number; length: number }>();
  for (let i = 0; i < tableCount; i += 1) {
    const base = 12 + i * 16;
    if (base + 16 > view.byteLength) throw fontError("Table directory is truncated.");
    const tag = readTag(view, base);
    tables.set(tag, { offset: view.getUint32(base + 8), length: view.getUint32(base + 12) });
  }
  const head = required(tables, "head");
  const maxp = required(tables, "maxp");
  const hhea = required(tables, "hhea");
  const hmtx = required(tables, "hmtx");
  const loca = required(tables, "loca");
  const glyf = required(tables, "glyf");
  const cmap = required(tables, "cmap");
  if (head.offset + 54 > view.byteLength) throw fontError("head table is truncated.");
  const unitsPerEm = view.getUint16(head.offset + 18);
  const locaFormat = view.getInt16(head.offset + 50);
  const numGlyphs = view.getUint16(maxp.offset + 4);
  const ascender = view.getInt16(hhea.offset + 4);
  const descender = view.getInt16(hhea.offset + 6);
  const lineGap = view.getInt16(hhea.offset + 8);
  const numberOfHMetrics = view.getUint16(hhea.offset + 34);
  const advances: number[] = [];
  const lsbs: number[] = [];
  for (let i = 0; i < numGlyphs; i += 1) {
    if (i < numberOfHMetrics) {
      const offset = hmtx.offset + i * 4;
      advances.push(view.getUint16(offset));
      lsbs.push(view.getInt16(offset + 2));
    } else {
      const last = advances[numberOfHMetrics - 1];
      if (last === undefined) throw fontError("hmtx table is empty.");
      advances.push(last);
      lsbs.push(view.getInt16(hmtx.offset + numberOfHMetrics * 4 + (i - numberOfHMetrics) * 2));
    }
  }
  const locaOffsets: number[] = [];
  for (let i = 0; i <= numGlyphs; i += 1) {
    locaOffsets.push(
      locaFormat === 0
        ? view.getUint16(loca.offset + i * 2) * 2
        : view.getUint32(loca.offset + i * 4),
    );
  }
  const unicodeToGlyph = parseCmap(view, cmap);
  const glyphs: ParsedGlyph[] = [];
  for (let glyphId = 0; glyphId < numGlyphs; glyphId += 1) {
    const start = locaOffsets[glyphId];
    const end = locaOffsets[glyphId + 1];
    if (start === undefined || end === undefined) throw fontError("loca table is truncated.");
    const advanceWidth = advances[glyphId] ?? 0;
    const leftSideBearing = lsbs[glyphId] ?? 0;
    if (end <= start) {
      glyphs.push(
        freezeGlyph({
          glyphId,
          advanceWidth,
          leftSideBearing,
          contours: [],
          empty: true,
        }),
      );
      continue;
    }
    glyphs.push(parseGlyph(view, glyf.offset + start, glyphId, advanceWidth, leftSideBearing));
  }
  const kerning: Record<string, number> = {};
  const kern = tables.get("kern");
  if (kern) parseKern(view, kern, kerning);
  return Object.freeze({
    unitsPerEm,
    ascender,
    descender,
    lineGap,
    glyphs: Object.freeze(glyphs),
    unicodeToGlyph: Object.freeze(unicodeToGlyph),
    kerning: Object.freeze(kerning),
  });
}

function parseGlyph(
  view: DataView,
  offset: number,
  glyphId: number,
  advanceWidth: number,
  leftSideBearing: number,
): ParsedGlyph {
  const contourCount = view.getInt16(offset);
  if (contourCount < 0)
    throw fontError("Composite TrueType glyphs are unsupported.", { glyphId, kind: "composite" });
  if (contourCount === 0) {
    return freezeGlyph({ glyphId, advanceWidth, leftSideBearing, contours: [], empty: true });
  }
  const endPts: number[] = [];
  for (let i = 0; i < contourCount; i += 1) endPts.push(view.getUint16(offset + 10 + i * 2));
  const last = endPts[endPts.length - 1];
  if (last === undefined) throw fontError("Glyph contour table is empty.", { glyphId });
  const instructionLength = view.getUint16(offset + 10 + contourCount * 2);
  let cursor = offset + 12 + contourCount * 2 + instructionLength;
  const pointCount = last + 1;
  const flags: number[] = [];
  for (let i = 0; i < pointCount;) {
    const flag = view.getUint8(cursor);
    cursor += 1;
    flags.push(flag);
    i += 1;
    if (flag & REPEAT) {
      const repeats = view.getUint8(cursor);
      cursor += 1;
      for (let r = 0; r < repeats; r += 1) {
        flags.push(flag);
        i += 1;
      }
    }
  }
  const xs: number[] = [];
  let x = 0;
  for (let i = 0; i < pointCount; i += 1) {
    const flag = flags[i] ?? 0;
    if (flag & X_SHORT) {
      const value = view.getUint8(cursor);
      cursor += 1;
      x += flag & X_SAME_OR_POSITIVE ? value : -value;
    } else if (!(flag & X_SAME_OR_POSITIVE)) {
      x += view.getInt16(cursor);
      cursor += 2;
    }
    xs.push(x);
  }
  const ys: number[] = [];
  let y = 0;
  for (let i = 0; i < pointCount; i += 1) {
    const flag = flags[i] ?? 0;
    if (flag & Y_SHORT) {
      const value = view.getUint8(cursor);
      cursor += 1;
      y += flag & Y_SAME_OR_POSITIVE ? value : -value;
    } else if (!(flag & Y_SAME_OR_POSITIVE)) {
      y += view.getInt16(cursor);
      cursor += 2;
    }
    ys.push(y);
  }
  const contours: OutlineCommand[][] = [];
  let start = 0;
  for (const end of endPts) {
    const points: Array<{ x: number; y: number; on: boolean }> = [];
    for (let i = start; i <= end; i += 1) {
      points.push({ x: xs[i] ?? 0, y: ys[i] ?? 0, on: ((flags[i] ?? 0) & ON_CURVE) !== 0 });
    }
    contours.push(contourToCommands(points));
    start = end + 1;
  }
  return freezeGlyph({
    glyphId,
    advanceWidth,
    leftSideBearing,
    contours: Object.freeze(contours.map((contour) => Object.freeze(contour))),
    empty: false,
  });
}

export function contourToCommands(
  points: readonly { x: number; y: number; on: boolean }[],
): OutlineCommand[] {
  if (points.length === 0) return [];
  const pts = points.map((point) => ({ x: point.x, y: point.y, on: point.on }));
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first && !first.on) {
    if (last?.on) pts.unshift(pts.pop()!);
    else if (last) pts.unshift({ x: (last.x + first.x) / 2, y: (last.y + first.y) / 2, on: true });
  }
  const origin = pts[0];
  if (!origin) return [];
  const commands: OutlineCommand[] = [{ type: "move", p: point(origin) }];
  for (let i = 1; i < pts.length;) {
    const current = pts[i];
    if (!current) break;
    if (current.on) {
      commands.push({ type: "line", p: point(current) });
      i += 1;
      continue;
    }
    const next = pts[i + 1] ?? origin;
    if (next.on) {
      commands.push({ type: "quadratic", c: point(current), p: point(next) });
      i += 2;
    } else {
      commands.push({
        type: "quadratic",
        c: point(current),
        p: point({ x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 }),
      });
      i += 1;
    }
  }
  commands.push({ type: "close" });
  return commands;
}

function parseCmap(
  view: DataView,
  table: { offset: number; length: number },
): Readonly<Record<string, number>> {
  const numTables = view.getUint16(table.offset + 2);
  let chosen: { offset: number } | undefined;
  for (let i = 0; i < numTables; i += 1) {
    const platform = view.getUint16(table.offset + 4 + i * 8);
    const encoding = view.getUint16(table.offset + 6 + i * 8);
    const offset = table.offset + view.getUint32(table.offset + 8 + i * 8);
    if ((platform === 3 && encoding === 1) || (platform === 0 && !chosen)) chosen = { offset };
  }
  if (!chosen) return Object.freeze({});
  const format = view.getUint16(chosen.offset);
  if (format !== 4) throw fontError("Only cmap format 4 is supported.", { format });
  const segCount = view.getUint16(chosen.offset + 6) / 2;
  const endCodes: number[] = [];
  const startCodes: number[] = [];
  const idDeltas: number[] = [];
  const idRangeOffsets: number[] = [];
  const endBase = chosen.offset + 14;
  const startBase = endBase + segCount * 2 + 2;
  const deltaBase = startBase + segCount * 2;
  const rangeBase = deltaBase + segCount * 2;
  for (let i = 0; i < segCount; i += 1) {
    endCodes.push(view.getUint16(endBase + i * 2));
    startCodes.push(view.getUint16(startBase + i * 2));
    idDeltas.push(view.getInt16(deltaBase + i * 2));
    idRangeOffsets.push(view.getUint16(rangeBase + i * 2));
  }
  const map: Record<string, number> = {};
  for (let i = 0; i < segCount; i += 1) {
    const start = startCodes[i] ?? 0;
    const end = endCodes[i] ?? 0;
    const delta = idDeltas[i] ?? 0;
    const rangeOffset = idRangeOffsets[i] ?? 0;
    for (let code = start; code <= end; code += 1) {
      if (code === 0xffff) continue;
      let glyphId = 0;
      if (rangeOffset === 0) glyphId = (code + delta) & 0xffff;
      else {
        const index = rangeBase + i * 2 + rangeOffset + (code - start) * 2;
        glyphId = view.getUint16(index);
        if (glyphId !== 0) glyphId = (glyphId + delta) & 0xffff;
      }
      map[String(code)] = glyphId;
    }
  }
  return Object.freeze(map);
}

function parseKern(
  view: DataView,
  table: { offset: number },
  kerning: Record<string, number>,
): void {
  const subtables = view.getUint16(table.offset + 2);
  let cursor = table.offset + 4;
  for (let i = 0; i < subtables; i += 1) {
    const length = view.getUint16(cursor + 2);
    const coverage = view.getUint16(cursor + 4);
    if ((coverage & 0xff) === 0) {
      const pairCount = view.getUint16(cursor + 6);
      let pairCursor = cursor + 14;
      for (let p = 0; p < pairCount; p += 1) {
        const left = view.getUint16(pairCursor);
        const right = view.getUint16(pairCursor + 2);
        const value = view.getInt16(pairCursor + 4);
        kerning[`${left},${right}`] = value;
        pairCursor += 6;
      }
    }
    cursor += length;
  }
}

function required(tables: Map<string, { offset: number; length: number }>, tag: string) {
  const table = tables.get(tag);
  if (!table) throw fontError(`TrueType table ${tag} is missing.`);
  return table;
}

function readTag(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

function point(value: { x: number; y: number }): FontPoint {
  return Object.freeze({ x: value.x, y: value.y });
}

function freezeGlyph(glyph: ParsedGlyph): ParsedGlyph {
  return Object.freeze(glyph);
}

function fontError(
  message: string,
  details: Record<string, string | number | boolean | null> = {},
): HudError {
  return new HudError("FONT_LOAD_FAILED", message, details);
}
