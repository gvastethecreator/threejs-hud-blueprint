import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { HudLayer } from "../core/HudLayer.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { RING_SEGMENT_CAP, RING_TICK_CAP, Ring } from "./Ring.js";

describe("ring", () => {
  it("maps zero, partial, and full progress without wrapping past a full turn", () => {
    const ring = new Ring({ outerRadius: 20, innerRadius: 12, sweep: Math.PI * 2 });
    ring.value = 0;
    expect(ring.progressSweep()).toBe(0);
    ring.value = 0.5;
    expect(ring.progressSweep()).toBeCloseTo(Math.PI);
    ring.value = 1;
    expect(Math.abs(ring.progressSweep())).toBeCloseTo(Math.PI * 2);
    expect(Math.abs(ring.progressSweep())).toBeLessThanOrEqual(Math.PI * 2);
  });

  it("mirrors clockwise and counter-clockwise sweeps around the same start", () => {
    const cw = new Ring({ startAngle: 0, sweep: Math.PI / 2, direction: "cw", value: 1 });
    const ccw = new Ring({ startAngle: 0, sweep: Math.PI / 2, direction: "ccw", value: 1 });
    expect(cw.normalizedStart()).toBe(0);
    expect(ccw.normalizedStart()).toBe(0);
    expect(ccw.progressSweep()).toBeCloseTo(-cw.progressSweep());
  });

  it("caps segment and tick counts and rejects inner radius greater than outer", () => {
    const codes: string[] = [];
    const ring = new Ring({ outerRadius: 10, innerRadius: 4, segments: 200, ticks: 100 });
    const capped = ring.capCounts((diagnostic) => codes.push(diagnostic.code));
    expect(capped.segments).toBe(RING_SEGMENT_CAP);
    expect(capped.ticks).toBe(RING_TICK_CAP);
    expect(codes).toEqual(["RING_SEGMENT_CAP", "RING_TICK_CAP"]);
    expect(() => new Ring({ outerRadius: 4, innerRadius: 8 })).toThrow(HudError);
  });

  it("batches ring instances that share material features", () => {
    const layer = new HudLayer({ id: "main", referenceSize: { width: 80, height: 80 } });
    layer.add(new Ring({ id: "a", outerRadius: 20, innerRadius: 10 }));
    layer.add(new Ring({ id: "b", outerRadius: 16, innerRadius: 8 }));
    const snapshot = encodeOverlayQueue([layer], "webgl").snapshot();
    expect(snapshot.commands).toHaveLength(2);
    expect(
      snapshot.commands[0] && snapshot.commands[0].kind === "shape"
        ? snapshot.commands[0].shape
        : null,
    ).toBe("ring");
    expect(snapshot.batches).toHaveLength(1);
    expect(snapshot.topology).toHaveLength(1);
  });
});
