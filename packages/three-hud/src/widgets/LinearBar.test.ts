import { describe, expect, it } from "vitest";
import { LinearBar } from "./LinearBar.js";

describe("LinearBar", () => {
  it("sizes the fill from the clamped value", () => {
    const bar = new LinearBar({ width: 200, height: 20, min: 0, max: 100, value: 25 });
    expect(bar.fillNode.size.width).toBe(50);
    bar.setValue(150);
    expect(bar.value).toBe(100);
    expect(bar.fillNode.size.width).toBe(200);
  });
});
