import { describe, expect, it } from "vitest";
import { LinearBar } from "./LinearBar.js";

describe("linear-bar", () => {
  it("supports delayed value, reverse, and segments without rebuilding the track", () => {
    const bar = new LinearBar({
      width: 100,
      height: 10,
      value: 25,
      delayedValue: 50,
      reverse: true,
      segments: 4,
    });
    expect(bar.fillNode.size.width).toBe(25);
    expect(bar.delayedNode.size.width).toBe(50);
    expect(bar.fillNode.position.x).toBe(75);
    const fillId = bar.fillNode.id;
    bar.setValue(40);
    expect(bar.fillNode.id).toBe(fillId);
    expect(bar.fillNode.size.width).toBe(40);
  });
});
