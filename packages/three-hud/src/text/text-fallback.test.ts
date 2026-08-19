import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { createMonospaceFace } from "./layoutText.js";
import { detectFallbackCycle, layoutWithFallbacks, NOTDEF_GLYPH_ID } from "./textFallback.js";

function latinFace() {
  return {
    ...createMonospaceFace("latin"),
    glyphId: (code: number) => (code === 32 ? 0 : code === 65 ? 1 : NOTDEF_GLYPH_ID),
  };
}

function extraFace() {
  return {
    ...createMonospaceFace("extra"),
    glyphId: (code: number) => (code === 66 ? 2 : NOTDEF_GLYPH_ID),
  };
}

describe("text-fallback", () => {
  it("splits runs when the fallback face changes and never uses a negative glyph id", () => {
    const result = layoutWithFallbacks("AB", { font: "ui", size: 10 }, [latinFace(), extraFace()]);
    expect(result.runs).toHaveLength(2);
    expect(result.runs[0]?.fontId).toBe("latin");
    expect(result.runs[1]?.fontId).toBe("extra");
    expect(
      result.runs.flatMap((run) => run.glyphs.map((glyph) => glyph.glyphId)).every((id) => id >= 0),
    ).toBe(true);
  });

  it("detects fallback cycles", () => {
    expect(detectFallbackCycle(["a", "b", "a"])).toEqual(["a", "b", "a"]);
    expect(() =>
      layoutWithFallbacks("A", { font: "ui", size: 10 }, [
        latinFace(),
        { ...latinFace(), id: "latin" },
      ]),
    ).toThrow(HudError);
  });
});
