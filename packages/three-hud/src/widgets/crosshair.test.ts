import { describe, expect, it } from "vitest";
import { Crosshair, Reticle } from "./Crosshair.js";

describe("crosshair", () => {
  it("updates spread and recoil through transforms only", () => {
    const cross = new Crosshair({ gap: 4 });
    const geometry = cross.invalidationCounters().geometry;
    cross.setSpread(6);
    cross.setRecoil(3);
    expect(cross.recoil).toBe(3);
    const rest = new Crosshair({ gap: 4, length: 10 });
    const rightAtRest = rest.right.position.x;
    rest.setSpread(6);
    expect(rest.right.position.x).toBeGreaterThan(rightAtRest);
    expect(rest.left.position.x).toBeLessThan(
      new Crosshair({ gap: 4, length: 10 }).left.position.x,
    );
    expect(cross.invalidationCounters().geometry).toBe(geometry);
  });

  it("keeps its local center at the widget midpoint across spread", () => {
    const cross = new Crosshair({ gap: 4, length: 10, thickness: 1 });
    cross.setPosition(400, 200);
    const before = cross.worldBounds();
    expect(before.x + before.width / 2).toBeCloseTo(400 + cross.size.width / 2);
    expect(cross.right.size.height).toBe(1);
    cross.setSpread(12);
    const after = cross.worldBounds();
    expect(after.x + after.width / 2).toBeCloseTo(400 + cross.size.width / 2);
  });

  it("changes hit color without allocating new arm nodes", () => {
    const cross = new Crosshair({ dot: true });
    const left = cross.left;
    cross.setHit(true);
    expect(cross.left).toBe(left);
    expect(cross.left.fill).toBe(0xff6688);
    cross.setHit(false);
    expect(cross.left.fill).toBe(0xe8f6ff);
  });

  it("builds a reticle with ring and brackets from the same primitives", () => {
    const reticle = new Reticle();
    expect(reticle.ring.visible).toBe(true);
    expect(reticle.children.length).toBeGreaterThan(crosshairChildFloor());
  });
});

function crosshairChildFloor(): number {
  return new Crosshair({ ring: false, brackets: false }).children.length;
}
