import { describe, expect, it } from "vitest";
import {
  logicalToCss,
  resolveViewport,
  snapCssToDevicePixel,
  snapLogicalToDevicePixel,
} from "./resolveViewport.js";

describe("pixel-snap", () => {
  it("maps snapped logical points to whole physical pixels for DPR 1-3", () => {
    for (const dpr of [1, 1.5, 2, 3]) {
      for (const scale of [1, 2, 4]) {
        const snapped = snapLogicalToDevicePixel(0.3, scale, dpr);
        const device = snapped * scale * dpr;
        expect(device).toBeCloseTo(Math.round(device), 10);
        expect(snapCssToDevicePixel(snapCssToDevicePixel(12.4, dpr), dpr)).toBe(
          snapCssToDevicePixel(12.4, dpr),
        );
      }
    }
  });

  it("leaves smooth layers unsnapped unless pixelSnap is requested", () => {
    const smooth = resolveViewport({
      referenceSize: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, width: 1000, height: 500 },
      mode: "contain",
      dpr: 2,
    });
    expect(smooth.pixelSnap).toBe(false);
    expect(smooth.offsetX).not.toBe(Math.round(smooth.offsetX));
    const snapped = resolveViewport({
      referenceSize: { width: 320, height: 180 },
      viewport: { x: 0, y: 0, width: 641, height: 360 },
      mode: "integer",
      dpr: 2,
      pixelSnap: true,
    });
    expect(snapped.pixelSnap).toBe(true);
    expect(snapped.offsetX * snapped.dpr).toBeCloseTo(Math.round(snapped.offsetX * snapped.dpr));
    expect(snapped.offsetY * snapped.dpr).toBeCloseTo(Math.round(snapped.offsetY * snapped.dpr));
  });

  it("does not accumulate nested rounding drift when snapping once at CSS space", () => {
    const transform = resolveViewport({
      referenceSize: { width: 320, height: 180 },
      viewport: { x: 0, y: 0, width: 1280, height: 720 },
      mode: "integer",
      dpr: 1.5,
      pixelSnap: true,
    });
    const nested = { x: 10.2, y: 8.7 };
    const once = logicalToCss(nested, transform);
    const snappedOnce = {
      x: snapCssToDevicePixel(once.x, transform.dpr),
      y: snapCssToDevicePixel(once.y, transform.dpr),
    };
    const snappedTwice = {
      x: snapCssToDevicePixel(snappedOnce.x, transform.dpr),
      y: snapCssToDevicePixel(snappedOnce.y, transform.dpr),
    };
    expect(snappedTwice).toEqual(snappedOnce);
  });
});
