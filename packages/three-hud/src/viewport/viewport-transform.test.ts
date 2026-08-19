import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { logicalToCss } from "./resolveViewport.js";
import {
  applyLayerViewportToOrthographicCamera,
  deviceToLogical,
  logicalToClip,
  logicalToDevice,
  resolveLayerViewport,
  serializeLayerViewport,
  viewportToLogical,
} from "./layerTransform.js";

const containUltrawide = () =>
  resolveLayerViewport({
    referenceSize: { width: 1920, height: 1080 },
    viewport: { x: 0, y: 0, width: 3440, height: 1440 },
    mode: "contain",
    dpr: 2,
  });

describe("viewport-transform", () => {
  it("maps the logical center to the viewport center for the default contain policy", () => {
    const transform = containUltrawide();
    const css = logicalToCss({ x: 960, y: 540 }, transform);
    expect(css.x).toBeCloseTo(1720);
    expect(css.y).toBeCloseTo(720);
    expect(transform.contentRect.x).toBeCloseTo(440);
    expect(transform.contentRect.width).toBeCloseTo(2560);
  });

  it("round-trips logical, CSS, and device coordinates within tolerance", () => {
    const transform = containUltrawide();
    const logical = { x: 128, y: 960 };
    const css = logicalToCss(logical, transform);
    const device = logicalToDevice(logical, transform);
    expect(viewportToLogical(css, transform).x).toBeCloseTo(logical.x, 10);
    expect(viewportToLogical(css, transform).y).toBeCloseTo(logical.y, 10);
    expect(deviceToLogical(device, transform).x).toBeCloseTo(logical.x, 10);
    expect(deviceToLogical(device, transform).y).toBeCloseTo(logical.y, 10);
    expect(device.x).toBeCloseTo(css.x * 2);
  });

  it("throws HudError for zero or negative dimensions instead of producing NaN", () => {
    const invalid = [
      {
        referenceSize: { width: 0, height: 1080 },
        viewport: { x: 0, y: 0, width: 100, height: 100 },
        mode: "contain" as const,
      },
      {
        referenceSize: { width: 1920, height: -1 },
        viewport: { x: 0, y: 0, width: 100, height: 100 },
        mode: "contain" as const,
      },
      {
        referenceSize: { width: 1920, height: 1080 },
        viewport: { x: 0, y: 0, width: 0, height: 100 },
        mode: "cover" as const,
      },
      {
        referenceSize: { width: Number.NaN, height: 1080 },
        viewport: { x: 0, y: 0, width: 100, height: 100 },
        mode: "native" as const,
      },
    ];
    for (const input of invalid) {
      try {
        resolveLayerViewport(input);
        throw new Error("expected HudError");
      } catch (error) {
        expect(error).toBeInstanceOf(HudError);
        expect((error as HudError).code).toBe("INVALID_ARGUMENT");
      }
    }
  });

  it("serializes the transform without functions or NaN and feeds an orthographic camera", () => {
    const transform = containUltrawide();
    const json = JSON.stringify(transform);
    expect(json).not.toContain("NaN");
    expect(serializeLayerViewport(transform)).toEqual(JSON.parse(json));
    const clip = logicalToClip({ x: 960, y: 540 }, transform);
    expect(clip.x).toBeCloseTo(0);
    expect(clip.y).toBeCloseTo(0);
    const camera = { left: 0, right: 0, top: 0, bottom: 0, updateProjectionMatrix() {} };
    applyLayerViewportToOrthographicCamera(camera, transform);
    expect(camera.left).toBe(0);
    expect(camera.right).toBe(3440);
    expect(camera.top).toBe(0);
    expect(camera.bottom).toBe(1440);
  });
});
