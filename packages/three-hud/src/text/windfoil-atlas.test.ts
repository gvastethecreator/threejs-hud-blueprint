import { describe, expect, it } from "vitest";
import type { ParsedFontFace, ParsedGlyph } from "./windfoil/types.js";
import { WindfoilGlyphAtlas } from "./windfoil/atlas.js";

function box(glyphId: number): ParsedGlyph {
  return {
    glyphId,
    advanceWidth: 500,
    leftSideBearing: 0,
    empty: false,
    contours: [
      [
        { type: "move", p: { x: 0, y: 0 } },
        { type: "line", p: { x: 400, y: 0 } },
        { type: "line", p: { x: 400, y: 700 } },
        { type: "line", p: { x: 0, y: 700 } },
        { type: "close" },
      ],
    ],
  };
}

function face(ids: readonly number[]): ParsedFontFace {
  return {
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    lineGap: 0,
    unicodeToGlyph: Object.fromEntries(ids.map((id) => [String(id), id])),
    kerning: {},
    glyphs: ids.map(box),
  };
}

describe("windfoil-atlas", () => {
  it("prepares only missing glyphs when text changes from 99 to 100", () => {
    const atlas = new WindfoilGlyphAtlas();
    const source = face([0, 1, 9]);
    const first = atlas.ensureGlyphs("counter", [9, 9], source);
    expect(first.preparedNew).toBe(1);
    expect(first.reused).toBe(0);
    const second = atlas.ensureGlyphs("counter", [1, 0, 0], source);
    expect(second.preparedNew).toBe(2);
    expect(second.reused).toBe(0);
    const third = atlas.ensureGlyphs("counter", [1, 0, 0], source);
    expect(third.preparedNew).toBe(0);
    expect(third.reused).toBe(3);
    atlas.dispose();
  });

  it("reuses shared curve ranges for repeated glyph ids", () => {
    const atlas = new WindfoilGlyphAtlas();
    atlas.ensureGlyphs("ui", [2, 2, 2], face([2]));
    const prep = atlas.preprocessFor("ui");
    expect(prep?.glyphs).toHaveLength(1);
    expect(atlas.diagnostics().glyphCount).toBe(1);
    atlas.dispose();
  });

  it("grows one font atlas without invalidating another", () => {
    const atlas = new WindfoilGlyphAtlas();
    atlas.ensureGlyphs("a", [1], face([1]));
    const before = atlas.preprocessFor("a");
    atlas.ensureGlyphs("b", [2, 3], face([2, 3]));
    expect(atlas.preprocessFor("a")).toBe(before);
    expect(atlas.preprocessFor("b")?.glyphs).toHaveLength(2);
    atlas.dispose();
  });

  it("diagnoses allocation failure without dropping existing glyphs", () => {
    const codes: string[] = [];
    const atlas = new WindfoilGlyphAtlas({
      maxCurves: 8,
      onDiagnostic: (diagnostic) => codes.push(diagnostic.code),
    });
    const first = atlas.ensureGlyphs("ui", [1], face([1]));
    expect(first.preparedNew).toBe(1);
    const failed = atlas.ensureGlyphs("ui", [2, 3, 4, 5], face([2, 3, 4, 5]));
    expect(failed.preparedNew).toBe(0);
    expect(codes).toContain("ATLAS_ALLOCATION_FAILED");
    expect(atlas.ensureGlyphs("ui", [1], face([1])).reused).toBe(1);
    atlas.dispose();
    expect(atlas.diagnostics().cpuBytes).toBe(0);
    expect(atlas.diagnostics().glyphCount).toBe(0);
  });
});
