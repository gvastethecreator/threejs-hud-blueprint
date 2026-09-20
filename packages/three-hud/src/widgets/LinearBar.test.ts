import { describe, expect, it } from "vitest";
import { LinearBar } from "./LinearBar.js";

describe("LinearBar", () => {
  it("sizes the fill from the clamped value", () => {
    const bar = new LinearBar({ width: 200, height: 20, min: 0, max: 100, value: 25 });
    expect(bar.fillNode.size.width).toBe(50);
    bar.setValue(150);
    expect(bar.value).toBe(100);
    expect(bar.fillNode.size.width).toBe(200);
    bar.setSize(320, 12);
    expect(bar.fillNode.size).toEqual({ width: 320, height: 12 });
    expect(bar.delayedNode.size.height).toBe(12);
  });

  it("themes track, value, and delayed fills without host writes to fillNode", () => {
    const bar = new LinearBar({ width: 100, height: 12, value: 40 });
    bar.setFills({ track: 0x111111, value: 0xeeeeee, delayed: 0x888888, label: 0xffffff });
    expect(bar.fill).toBe(0x111111);
    expect(bar.fillNode.fill).toBe(0xeeeeee);
    expect(bar.delayedNode.fill).toBe(0x888888);
    expect(bar.labelNode.color).toBe(0xffffff);
  });
});
