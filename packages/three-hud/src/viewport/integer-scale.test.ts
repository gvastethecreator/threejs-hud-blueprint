import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { resolveIntegerScale, resolveViewport } from "./resolveViewport.js";

describe("integer-scale", () => {
  it("never silently uses a fractional scale in the default overflow-1x policy", () => {
    const large = resolveViewport({
      referenceSize: { width: 320, height: 180 },
      viewport: { x: 0, y: 0, width: 1280, height: 720 },
      mode: "integer",
    });
    expect(large.scaleX).toBe(4);
    expect(Number.isInteger(large.scaleX)).toBe(true);
    expect(large.crisp).toBe(true);
    const small = resolveViewport({
      referenceSize: { width: 320, height: 180 },
      viewport: { x: 0, y: 0, width: 200, height: 100 },
      mode: "integer",
    });
    expect(small.scaleX).toBe(1);
    expect(Number.isInteger(small.scaleX)).toBe(true);
    expect(small.integerDownscale).toBe("overflow-1x");
  });

  it("uses the explicit downscale fallback when the viewport is smaller than the reference", () => {
    expect(resolveIntegerScale(0.4, "overflow-1x")).toEqual({
      scale: 1,
      crisp: true,
      policy: "overflow-1x",
    });
    expect(resolveIntegerScale(0.4, "explicit-fractional")).toEqual({
      scale: 0.4,
      crisp: false,
      policy: "explicit-fractional",
    });
    try {
      resolveIntegerScale(0.4, "disable");
      throw new Error("expected HudError");
    } catch (error) {
      expect(error).toBeInstanceOf(HudError);
      expect((error as HudError).code).toBe("FEATURE_UNAVAILABLE");
    }
    const fractional = resolveViewport({
      referenceSize: { width: 320, height: 180 },
      viewport: { x: 0, y: 0, width: 200, height: 100 },
      mode: "integer",
      integerDownscale: "explicit-fractional",
    });
    expect(fractional.crisp).toBe(false);
    expect(fractional.scaleX).toBeCloseTo(100 / 180);
  });
});
