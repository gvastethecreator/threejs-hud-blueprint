import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import {
  CUBIC_APPROXIMATION_POLICY,
  preprocessWindfoilFace,
  preprocessWindfoilFont,
  serializeWindfoilPreprocess,
} from "./windfoil.js";
import type { ParsedFontFace } from "./windfoil/types.js";

describe("windfoil-preprocess", () => {
  it("produces byte-identical atlas metadata across runs for the same font bytes", () => {
    const font = buildMinimalTtf();
    const first = preprocessWindfoilFont(font);
    const second = preprocessWindfoilFont(font.slice(0));
    expect(first.hash).toBe(second.hash);
    expect(serializeWindfoilPreprocess(first)).toBe(serializeWindfoilPreprocess(second));
    expect(first.glyphs.length).toBe(3);
    const drawn = first.glyphs[2];
    expect(drawn?.empty).toBe(false);
    expect(drawn?.curveCount).toBeGreaterThan(0);
    expect(first.stats.curveCount).toBe(first.curves.length);
  });

  it("keeps blank glyphs measurable without allocating outline data", () => {
    const result = preprocessWindfoilFont(buildMinimalTtf());
    const space = result.glyphs[1];
    expect(space?.empty).toBe(true);
    expect(space?.advanceWidth).toBe(250);
    expect(space?.curveCount).toBe(0);
    expect(space?.bandCount).toBe(0);
    const before = result.curves.length;
    expect(before).toBe(result.glyphs[2]?.curveCount);
  });

  it("converts cubics with the documented midpoint-subdivision policy", () => {
    expect(CUBIC_APPROXIMATION_POLICY.method).toBe("midpoint-subdivision");
    const face = cubicFace();
    const result = preprocessWindfoilFace(face, {
      cubicTolerance: 0.5,
      cubicMaxDepth: 8,
      bandHeight: 50,
    });
    const glyph = result.glyphs[0];
    expect(glyph?.empty).toBe(false);
    expect(glyph?.curveCount).toBeGreaterThan(0);
    expect(result.cubicPolicy.tolerance).toBe(0.5);
    expect(
      result.curves.every((curve) => Number.isFinite(curve.p1.x) && Number.isFinite(curve.p2.x)),
    ).toBe(true);
    expect(result.hash).toBe(
      preprocessWindfoilFace(face, { cubicTolerance: 0.5, cubicMaxDepth: 8, bandHeight: 50 }).hash,
    );
  });

  it("fails malformed and unsupported fonts through FONT_LOAD_FAILED", () => {
    expect(() => preprocessWindfoilFont(new Uint8Array([0, 1, 2, 3]).buffer)).toThrow(HudError);
    try {
      preprocessWindfoilFont(new Uint8Array([0, 1, 2, 3]).buffer);
    } catch (error) {
      expect(error).toBeInstanceOf(HudError);
      expect((error as HudError).code).toBe("FONT_LOAD_FAILED");
    }
    const otto = new Uint8Array(12);
    otto.set([0x4f, 0x54, 0x54, 0x4f]);
    expect(() => preprocessWindfoilFont(otto.buffer)).toThrow(HudError);
  });

  it("does not require a committed font fixture", () => {
    const font = buildMinimalTtf();
    expect(font.byteLength).toBeGreaterThan(100);
    const result = preprocessWindfoilFont(font);
    expect(result.unicodeToGlyph["65"]).toBe(2);
    expect(result.kerning["2,2"]).toBe(10);
  });
});

function cubicFace(): ParsedFontFace {
  return Object.freeze({
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    lineGap: 0,
    unicodeToGlyph: Object.freeze({ "66": 0 }),
    kerning: Object.freeze({}),
    glyphs: Object.freeze([
      Object.freeze({
        glyphId: 0,
        advanceWidth: 700,
        leftSideBearing: 0,
        empty: false,
        contours: Object.freeze([
          Object.freeze([
            { type: "move" as const, p: Object.freeze({ x: 0, y: 0 }) },
            {
              type: "cubic" as const,
              c1: Object.freeze({ x: 0, y: 400 }),
              c2: Object.freeze({ x: 400, y: 400 }),
              p: Object.freeze({ x: 400, y: 0 }),
            },
            { type: "line" as const, p: Object.freeze({ x: 0, y: 0 }) },
            { type: "close" as const },
          ]),
        ]),
      }),
    ]),
  });
}

function buildMinimalTtf(): Uint8Array {
  const glyf = buildSimpleRectGlyph();
  const loca = u32list([0, 0, 0, glyf.length]);
  const maxp = concat([u32(0x00010000), u16(3)]);
  const hhea = new Uint8Array(36);
  const hheaView = new DataView(hhea.buffer);
  hheaView.setInt16(4, 800);
  hheaView.setInt16(6, -200);
  hheaView.setUint16(34, 3);
  const hmtx = concat([u16(500), i16(0), u16(250), i16(0), u16(500), i16(0)]);
  const cmap = buildCmap();
  const kern = buildKern();
  const head = new Uint8Array(54);
  const headView = new DataView(head.buffer);
  headView.setUint32(0, 0x00010000);
  headView.setUint32(12, 0x5f0f3cf5);
  headView.setUint16(18, 1000);
  headView.setInt16(36, 0);
  headView.setInt16(38, 0);
  headView.setInt16(40, 400);
  headView.setInt16(42, 700);
  headView.setInt16(50, 1);
  const tables: Array<[string, Uint8Array]> = [
    ["cmap", cmap],
    ["glyf", glyf],
    ["head", head],
    ["hhea", hhea],
    ["hmtx", hmtx],
    ["kern", kern],
    ["loca", loca],
    ["maxp", pad4(maxp)],
  ];
  tables.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const numTables = tables.length;
  const offsetTableSize = 12 + numTables * 16;
  let cursor = offsetTableSize;
  const records: Uint8Array[] = [];
  const bodies: Uint8Array[] = [];
  for (const [tag, body] of tables) {
    const padded = pad4(body);
    records.push(concat([tagBytes(tag), u32(checksum(padded)), u32(cursor), u32(body.length)]));
    bodies.push(padded);
    cursor += padded.length;
  }
  const searchRange = 2 ** Math.floor(Math.log2(numTables)) * 16;
  const entrySelector = Math.floor(Math.log2(numTables));
  const rangeShift = numTables * 16 - searchRange;
  const font = concat([
    u32(0x00010000),
    u16(numTables),
    u16(searchRange),
    u16(entrySelector),
    u16(rangeShift),
    ...records,
    ...bodies,
  ]);
  const total = checksum(font);
  const adjustment = (0xb1b0afba - total) >>> 0;
  const headOffset = new DataView(
    concat([
      u32(0x00010000),
      u16(numTables),
      u16(searchRange),
      u16(entrySelector),
      u16(rangeShift),
      ...records,
    ]).buffer,
  ).byteLength;
  // Find head table offset from directory
  const view = new DataView(font.buffer, font.byteOffset, font.byteLength);
  for (let i = 0; i < numTables; i += 1) {
    const base = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(base),
      view.getUint8(base + 1),
      view.getUint8(base + 2),
      view.getUint8(base + 3),
    );
    if (tag === "head") {
      view.setUint32(view.getUint32(base + 8) + 8, adjustment);
      break;
    }
  }
  void headOffset;
  return font;
}

function buildSimpleRectGlyph(): Uint8Array {
  const body = new Uint8Array(10 + 2 + 2 + 4 + 8 + 8);
  const view = new DataView(body.buffer);
  view.setInt16(0, 1);
  view.setInt16(2, 0);
  view.setInt16(4, 0);
  view.setInt16(6, 400);
  view.setInt16(8, 700);
  view.setUint16(10, 3);
  view.setUint16(12, 0);
  body[14] = 1;
  body[15] = 1;
  body[16] = 1;
  body[17] = 1;
  view.setInt16(18, 0);
  view.setInt16(20, 400);
  view.setInt16(22, 0);
  view.setInt16(24, -400);
  view.setInt16(26, 0);
  view.setInt16(28, 0);
  view.setInt16(30, 700);
  view.setInt16(32, 0);
  return body;
}

function buildCmap(): Uint8Array {
  const segCount = 3;
  const format4Length = 16 + segCount * 8;
  const subtable = new Uint8Array(format4Length);
  const view = new DataView(subtable.buffer);
  view.setUint16(0, 4);
  view.setUint16(2, format4Length);
  view.setUint16(6, segCount * 2);
  const searchRange = 2 ** Math.floor(Math.log2(segCount)) * 2;
  view.setUint16(8, searchRange);
  view.setUint16(10, Math.floor(Math.log2(segCount)));
  view.setUint16(12, segCount * 2 - searchRange);
  const ends = [32, 65, 0xffff];
  const starts = [32, 65, 0xffff];
  const deltas = [1 - 32, 2 - 65, 1];
  let cursor = 14;
  for (const end of ends) {
    view.setUint16(cursor, end);
    cursor += 2;
  }
  cursor += 2;
  for (const start of starts) {
    view.setUint16(cursor, start);
    cursor += 2;
  }
  for (const delta of deltas) {
    view.setInt16(cursor, delta);
    cursor += 2;
  }
  for (let i = 0; i < segCount; i += 1) {
    view.setUint16(cursor, 0);
    cursor += 2;
  }
  const header = new Uint8Array(12);
  const headerView = new DataView(header.buffer);
  headerView.setUint16(2, 1);
  headerView.setUint16(4, 3);
  headerView.setUint16(6, 1);
  headerView.setUint32(8, 12);
  return concat([header, subtable]);
}

function buildKern(): Uint8Array {
  const body = new Uint8Array(4 + 14 + 6);
  const view = new DataView(body.buffer);
  view.setUint16(2, 1);
  view.setUint16(6, 20);
  view.setUint16(10, 1);
  view.setUint16(18, 2);
  view.setUint16(20, 2);
  view.setInt16(22, 10);
  return body;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function pad4(bytes: Uint8Array): Uint8Array {
  const extra = (4 - (bytes.length % 4)) % 4;
  if (extra === 0) return bytes;
  const out = new Uint8Array(bytes.length + extra);
  out.set(bytes);
  return out;
}

function checksum(bytes: Uint8Array): number {
  const padded = pad4(bytes);
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  let sum = 0;
  for (let i = 0; i < padded.byteLength; i += 4) sum = (sum + view.getUint32(i)) >>> 0;
  return sum;
}

function u16(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value);
  return bytes;
}

function i16(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setInt16(0, value);
  return bytes;
}

function u32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value);
  return bytes;
}

function u32list(values: number[]): Uint8Array {
  return concat(values.map(u32));
}

function tagBytes(tag: string): Uint8Array {
  return new Uint8Array([
    tag.charCodeAt(0),
    tag.charCodeAt(1),
    tag.charCodeAt(2),
    tag.charCodeAt(3),
  ]);
}
