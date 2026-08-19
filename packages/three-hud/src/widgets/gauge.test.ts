import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { Gauge } from "./Gauge.js";

describe("gauge", () => {
  it("clamps overrange needle values using the Ring angle convention", () => {
    const gauge = new Gauge({ min: 0, max: 10, value: 5, ticks: 5 });
    gauge.setValue(40);
    expect(gauge.value).toBe(10);
    expect(gauge.face.value).toBe(10);
    expect(gauge.tickLabels.length).toBe(5);
    expect(
      Math.hypot(gauge.needle.x2 - gauge.needle.x1, gauge.needle.y2 - gauge.needle.y1),
    ).toBeGreaterThan(8);
    const low = new Gauge({ min: 0, max: 10, value: 0, ticks: 5 });
    const high = new Gauge({ min: 0, max: 10, value: 10, ticks: 5 });
    expect(low.needle.y2).not.toBeCloseTo(high.needle.y2);
  });

  it("lets tick labels switch fontId without reconstructing the gauge", () => {
    const gauge = new Gauge({ min: 0, max: 10, value: 4, ticks: 3 });
    const labels = gauge.tickLabels;
    expect(labels.length).toBe(3);
    for (const label of labels) label.setFontId("pixel");
    expect(gauge.tickLabels).toBe(labels);
    expect(gauge.tickLabels[0]?.fontId).toBe("pixel");
  });

  it("encodes the needle in world space after the gauge is positioned", () => {
    const hud = new HUD({ referenceSize: { width: 1920, height: 1080 } });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    const gauge = new Gauge({
      id: "speed",
      width: 128,
      height: 128,
      value: 50,
      ticks: 3,
      fill: 0x4aa3ff,
    });
    gauge.setPosition(400, 200);
    layer.add(gauge);
    const queue = encodeOverlayQueue([layer], "webgl").snapshot();
    const line = queue.commands.find(
      (command) => command.kind === "shape" && command.shape === "line",
    );
    expect(line?.kind).toBe("shape");
    if (line?.kind !== "shape") return;
    const x1 = line.shapeParams?.x1 ?? 0;
    const y1 = line.shapeParams?.y1 ?? 0;
    const worldCenterX = 400 + gauge.size.width / 2;
    const worldCenterY = 200 + gauge.size.height / 2;
    expect(Math.hypot(x1 - worldCenterX, y1 - worldCenterY)).toBeLessThan(8);
    expect(x1).toBeGreaterThan(350);
    expect(gauge.face.fill).toBe(0x4aa3ff);
    hud.dispose();
  });

  it("updates the needle without replacing it", () => {
    const gauge = new Gauge({ min: 0, max: 10, value: 2, ticks: 3 });
    const needle = gauge.needle;
    const layout = gauge.invalidationCounters().layout;
    gauge.setValue(8);
    expect(gauge.needle).toBe(needle);
    expect(gauge.invalidationCounters().layout).toBe(layout);
  });
});
