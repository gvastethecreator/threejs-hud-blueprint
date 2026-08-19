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
      segments: 1,
    });
    expect(bar.fillNode.size.width).toBe(25);
    expect(bar.delayedNode.size.width).toBe(50);
    expect(bar.fillNode.position.x).toBe(75);
    const fillId = bar.fillNode.id;
    bar.setValue(40);
    expect(bar.fillNode.id).toBe(fillId);
    expect(bar.fillNode.size.width).toBe(40);
  });

  it("draws four gapped fill children when segments is 4", () => {
    const bar = new LinearBar({
      width: 100,
      height: 10,
      value: 100,
      segments: 4,
      gap: 4,
    });
    expect(bar.segmentFills).toHaveLength(4);
    expect(bar.segmentFills[0]?.size.width).toBe(22);
    expect(bar.segmentFills[1]?.position.x).toBe(26);
    expect(bar.segmentFills[2]?.position.x).toBe(52);
    expect(bar.segmentFills[3]?.position.x).toBe(78);
    const half = new LinearBar({ width: 100, height: 10, value: 50, segments: 4, gap: 4 });
    expect(half.segmentFills[0]?.size.width).toBe(22);
    expect(half.segmentFills[1]?.size.width).toBe(22);
    expect(half.segmentFills[2]?.size.width).toBe(0);
    expect(half.segmentFills[3]?.size.width).toBe(0);
  });

  it("clamps out-of-range values and keeps zero/full bounds non-negative", () => {
    const bar = new LinearBar({ width: 200, height: 16, min: 0, max: 100, value: 25, label: "HP" });
    bar.setValue(150);
    expect(bar.value).toBe(100);
    expect(bar.fillNode.size.width).toBe(200);
    bar.setValue(-20);
    expect(bar.value).toBe(0);
    expect(bar.fillNode.size.width).toBe(0);
    expect(bar.fillNode.position.x).toBe(0);
    expect(bar.fillNode.size.height).toBeGreaterThanOrEqual(0);
  });

  it("does not remeasure an unchanged label on value-only updates", () => {
    const bar = new LinearBar({ width: 200, height: 16, value: 20, label: "HP" });
    const textMarks = bar.labelNode.invalidationCounters().text;
    const width = bar.labelNode.size.width;
    bar.setValue(80);
    expect(bar.labelNode.text).toBe("HP");
    expect(bar.labelNode.size.width).toBe(width);
    expect(bar.labelNode.invalidationCounters().text).toBe(textMarks);
  });

  it("keeps delayed fill host-controlled with no widget tween", () => {
    const bar = new LinearBar({ width: 100, height: 10, value: 20, delayedValue: 80 });
    expect(bar.delayedNode.size.width).toBe(80);
    bar.setValue(40);
    expect(bar.delayedValue).toBe(80);
    expect(bar.delayedNode.size.width).toBe(80);
    bar.setDelayedValue(55);
    expect(bar.delayedValue).toBe(55);
    expect(bar.delayedNode.size.width).toBeCloseTo(55);
  });

  it("keeps segment gaps stable after value changes", () => {
    const bar = new LinearBar({ width: 100, height: 10, value: 100, segments: 4, gap: 4 });
    const first = bar.segmentFills[0];
    const second = bar.segmentFills[1];
    expect(first && second).toBeTruthy();
    if (!first || !second) return;
    const gap = second.position.x - (first.position.x + first.size.width);
    expect(gap).toBe(4);
    bar.setValue(75);
    const nextFirst = bar.segmentFills[0];
    const nextSecond = bar.segmentFills[1];
    expect(nextFirst && nextSecond).toBeTruthy();
    if (!nextFirst || !nextSecond) return;
    expect(nextSecond.position.x - (nextFirst.position.x + nextFirst.size.width)).toBe(4);
  });

  it("maps vertical fill from the bottom without negative size", () => {
    const bar = new LinearBar({
      width: 12,
      height: 100,
      value: 40,
      orientation: "vertical",
    });
    expect(bar.fillNode.size.height).toBe(40);
    expect(bar.fillNode.size.width).toBe(12);
    expect(bar.fillNode.position.y).toBe(60);
  });
});
