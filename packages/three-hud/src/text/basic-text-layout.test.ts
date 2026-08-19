import { describe, expect, it } from "vitest";
import { createMonospaceFace, layoutText } from "./layoutText.js";

const face = createMonospaceFace("ui", 1000, 500);

describe("basic-text-layout", () => {
  it("agrees on measure and layout bounds and advances spaces without outlines", () => {
    const laid = layoutText("A B", { font: "ui", size: 10 }, face);
    expect(laid.width).toBe(laid.run.bounds.width);
    expect(laid.height).toBe(laid.run.bounds.height);
    expect(laid.run.glyphs).toHaveLength(3);
    expect(laid.run.glyphs[1]?.glyphId).toBe(0);
    expect(laid.run.glyphs[1]?.advanceX).toBeCloseTo(5);
  });

  it("wraps a word wider than the constraint without looping", () => {
    const laid = layoutText("ABCDEF", { font: "ui", size: 10, wrap: "word", maxWidth: 12 }, face);
    expect(laid.run.lines.length).toBeGreaterThan(1);
    expect(laid.run.glyphs.length).toBe(6);
  });

  it("documents empty strings and trailing newlines", () => {
    const empty = layoutText("", { font: "ui", size: 10 }, face);
    expect(empty.run.lines).toHaveLength(1);
    expect(empty.run.glyphs).toHaveLength(0);
    expect(empty.height).toBeGreaterThan(0);
    const trailing = layoutText("A\n", { font: "ui", size: 10 }, face);
    expect(trailing.run.lines).toHaveLength(2);
  });

  it("diagnoses unsupported complex shaping instead of claiming correctness", () => {
    const codes: string[] = [];
    layoutText("سلام", { font: "ui", size: 10 }, face, (diagnostic) => codes.push(diagnostic.code));
    expect(codes).toEqual(["COMPLEX_SCRIPT_UNSUPPORTED"]);
  });
});
