import { describe, expect, it } from "vitest";
import { resolveLayerViewport } from "./layerTransform.js";

describe("safe-frame", () => {
  it("exposes a logical safe rectangle from explicit insets", () => {
    const transform = resolveLayerViewport({
      referenceSize: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, width: 1920, height: 1080 },
      mode: "contain",
      safeInsets: { top: 40, right: 24, bottom: 60, left: 32 },
    });
    expect(transform.safeRect).toEqual({ x: 32, y: 40, width: 1864, height: 980 });
  });

  it("reports CSS letterbox rectangles for contain and none for cover", () => {
    const contain = resolveLayerViewport({
      referenceSize: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, width: 3440, height: 1440 },
      mode: "contain",
    });
    expect(contain.letterboxRects).toHaveLength(2);
    expect(contain.letterboxRects[0]?.width).toBeCloseTo(440);
    expect(contain.letterboxRects[1]?.width).toBeCloseTo(440);
    const cover = resolveLayerViewport({
      referenceSize: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, width: 3440, height: 1440 },
      mode: "cover",
    });
    expect(cover.letterboxRects).toEqual([]);
  });
});
