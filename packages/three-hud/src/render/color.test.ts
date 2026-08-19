import { describe, expect, it } from "vitest";
import { HudNode } from "../core/HudNode.js";
import { OVERLAY_COLOR_POLICY } from "./overlayProfile.js";

export function premultiplyRgb(
  r: number,
  g: number,
  b: number,
  opacity: number,
): readonly [number, number, number, number] {
  const a = Math.min(1, Math.max(0, opacity));
  return Object.freeze([r * a, g * a, b * a, a]);
}

describe("color", () => {
  it("composes inherited opacity deterministically with premultiplied alpha", () => {
    const root = new HudNode({ opacity: 0.5 });
    const child = root.add(new HudNode({ opacity: 0.5 }));
    expect(child.effectiveOpacity()).toBeCloseTo(0.25);
    expect(premultiplyRgb(1, 0.4, 0.2, child.effectiveOpacity())).toEqual([0.25, 0.1, 0.05, 0.25]);
    expect(premultiplyRgb(1, 0.4, 0.2, child.effectiveOpacity())).toEqual(
      premultiplyRgb(1, 0.4, 0.2, root.opacity * child.opacity),
    );
  });

  it("documents the overlay color policy as untonemapped premultiplied sRGB", () => {
    expect(OVERLAY_COLOR_POLICY.toneMapped).toBe(false);
    expect(OVERLAY_COLOR_POLICY.blend).toBe("premultiplied");
    expect(OVERLAY_COLOR_POLICY.clearsColor).toBe(false);
    expect(OVERLAY_COLOR_POLICY.outputColorSpace).toBe("srgb");
  });
});
