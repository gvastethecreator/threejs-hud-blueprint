import { describe, expect, it } from "vitest";
import { Arc } from "./Ring.js";

describe("arc", () => {
  it("defaults to a half-turn filled arc from the ring primitive", () => {
    const arc = new Arc({ outerRadius: 12 });
    expect(arc.primitive).toBe("ring");
    expect(arc.innerRadius).toBe(0);
    expect(arc.sweep).toBeCloseTo(Math.PI);
  });
});
