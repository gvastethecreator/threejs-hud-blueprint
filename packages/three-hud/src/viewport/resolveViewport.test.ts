import { describe, expect, it } from "vitest";
import {
  cssToLogical,
  logicalToCss,
  resolveViewport,
  snapLogicalToDevicePixel,
} from "./resolveViewport.js";

describe("resolveViewport", () => {
  it("centers a contained 16:9 reference in an ultrawide viewport", () => {
    const resolved = resolveViewport({
      referenceSize: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, width: 3440, height: 1440 },
      mode: "contain",
      dpr: 1,
    });
    expect(resolved.scaleX).toBeCloseTo(4 / 3);
    expect(resolved.offsetX).toBeCloseTo(440);
  });

  it("round-trips logical and CSS coordinates", () => {
    const resolved = resolveViewport({
      referenceSize: { width: 100, height: 100 },
      viewport: { x: 20, y: 10, width: 400, height: 200 },
      mode: "contain",
    });
    const logical = { x: 25, y: 75 };
    expect(cssToLogical(logicalToCss(logical, resolved), resolved)).toEqual(logical);
  });

  it("snaps a logical coordinate through scale and DPR", () => {
    expect(snapLogicalToDevicePixel(0.3, 2, 2)).toBe(0.25);
  });
});
