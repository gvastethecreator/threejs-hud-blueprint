import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
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
    expect(bar.fillRing.direction).toBe(bar.track.direction);
    expect(bar.ratio()).toBe(0.25);
    const layout = bar.invalidationCounters().layout;
    bar.setValue(50);
    expect(bar.fillRing.progressSweep()).toBeCloseTo(Math.PI);
    expect(bar.label.text).toBe("50");
    expect(bar.label.layout.width).toBeGreaterThan(0);
    expect(bar.invalidationCounters().layout).toBe(layout);
  });

  it("clamps overrange values and encodes a full-circle fill", () => {
    const bar = new RadialBar({ value: 10, max: 20, startAngle: 0, sweep: Math.PI * 2 });
    bar.setValue(80);
    expect(bar.value).toBe(20);
    expect(bar.fillRing.progressSweep()).toBeCloseTo(Math.PI * 2);
    const hud = new HUD({ referenceSize: { width: 128, height: 128 } });
    const layer = hud.createLayer({ id: "radial" });
    bar.setPosition(8, 8);
    layer.add(bar);
    const queue = encodeOverlayQueue([layer], "webgl").snapshot();
    expect(queue.commands.some((command) => command.kind === "shape")).toBe(true);
    hud.dispose();
  });
});
