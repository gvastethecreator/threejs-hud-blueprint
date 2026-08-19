import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { logicalToDevice, resolveLayerViewport } from "./layerTransform.js";
import { convertPoint } from "./coordinateSpaces.js";

describe("coordinate-spaces", () => {
  const transform = resolveLayerViewport({
    referenceSize: { width: 1920, height: 1080 },
    viewport: { x: 40, y: 20, width: 1920, height: 1080 },
    mode: "contain",
    dpr: 2,
  });
  const context = { transform, canvasOrigin: { x: 8, y: 16 }, hudId: "hud-a", layerId: "smooth" };

  it("round-trips tagged points except when snapping is requested separately", () => {
    const logical = convertPoint(
      { space: "logical", x: 200, y: 90, hudId: "hud-a", layerId: "smooth" },
      "device",
      context,
    );
    expect(logical.space).toBe("device");
    expect(logical.x).toBeCloseTo(logicalToDevice({ x: 200, y: 90 }, transform).x);
    const back = convertPoint(logical, "logical", context);
    expect(back.x).toBeCloseTo(200, 10);
    expect(back.y).toBeCloseTo(90, 10);
    const client = convertPoint(
      { space: "logical", x: 0, y: 0, hudId: "hud-a" },
      "client",
      context,
    );
    const canvas = convertPoint(client, "canvas", context);
    expect(canvas.x).toBeCloseTo(transform.offsetX);
    expect(canvas.y).toBeCloseTo(transform.offsetY);
  });

  it("rejects mismatched HUD or layer identities in development", () => {
    expect(() =>
      convertPoint({ space: "logical", x: 0, y: 0, hudId: "hud-b" }, "canvas", context),
    ).toThrow(HudError);
    expect(() =>
      convertPoint({ space: "logical", x: 0, y: 0, layerId: "pixel" }, "canvas", context),
    ).toThrow(HudError);
  });

  it("emits device pixels rather than CSS pixels", () => {
    const device = convertPoint({ space: "canvas", x: 10, y: 4 }, "device", context);
    expect(device.x).toBe(20);
    expect(device.y).toBe(8);
  });
});
