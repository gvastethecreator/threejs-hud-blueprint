import { describe, expect, it } from "vitest";
import { RadialBar } from "./RadialBar.js";

describe("radial-bar", () => {
  it("shares Ring angle convention and updates without full layout", () => {
    const bar = new RadialBar({
      value: 25,
      max: 100,
      startAngle: -Math.PI / 2,
      sweep: Math.PI * 2,
    });
    expect(bar.fillRing.startAngle).toBe(bar.track.startAngle);
    expect(bar.ratio()).toBe(0.25);
    const layout = bar.invalidationCounters().layout;
    bar.setValue(50);
    expect(bar.fillRing.progressSweep()).toBeCloseTo(Math.PI);
    expect(bar.invalidationCounters().layout).toBe(layout);
  });
});
