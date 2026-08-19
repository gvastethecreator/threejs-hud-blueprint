import { describe, expect, it } from "vitest";
import { Gauge } from "./Gauge.js";

describe("gauge", () => {
  it("clamps overrange needle values using the Ring angle convention", () => {
    const gauge = new Gauge({ min: 0, max: 10, value: 5, ticks: 5 });
    gauge.setValue(40);
    expect(gauge.value).toBe(10);
    expect(gauge.face.value).toBe(10);
    expect(gauge.needle.rotation).toBe(gauge.face.startAngle + gauge.face.progressSweep());
  });
});
