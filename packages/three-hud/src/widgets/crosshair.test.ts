import { describe, expect, it } from "vitest";
import { Crosshair } from "./Crosshair.js";

describe("crosshair", () => {
  it("updates spread and recoil through transforms only", () => {
    const cross = new Crosshair({ gap: 4 });
    const geometry = cross.invalidationCounters().geometry;
    cross.setSpread(6);
    cross.setRecoil(3);
    expect(cross.recoil).toBe(3);
    expect(cross.dot.position.y).toBe(13.5);
    expect(cross.invalidationCounters().geometry).toBe(geometry);
  });
});
