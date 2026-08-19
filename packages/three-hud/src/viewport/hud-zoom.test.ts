import { describe, expect, it } from "vitest";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { HUD } from "../core/HUD.js";
import { HudError } from "../contracts/errors.js";
import { logicalToCss } from "./resolveViewport.js";
import { resolveLayerViewport } from "./layerTransform.js";

describe("hud-zoom", () => {
  it("scales the layer without changing host DPR", () => {
    const base = resolveLayerViewport({
      referenceSize: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, width: 1920, height: 1080 },
      mode: "contain",
      dpr: 2,
      zoom: 1,
    });
    const zoomed = resolveLayerViewport({
      referenceSize: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, width: 1920, height: 1080 },
      mode: "contain",
      dpr: 2,
      zoom: 2,
    });
    expect(zoomed.dpr).toBe(base.dpr);
    expect(zoomed.scaleX).toBeCloseTo(base.scaleX * 2);
    const center = logicalToCss({ x: 960, y: 540 }, zoomed);
    expect(center.x).toBeCloseTo(960);
    expect(center.y).toBeCloseTo(540);
  });

  it("invalidates viewport layout stages and rejects non-positive zoom", () => {
    const hud = new HUD({ referenceSize: { width: 1920, height: 1080 } });
    const layer = hud.createLayer({ id: "main", scaleMode: "contain" });
    layer.clearDirty();
    layer.setZoom(1.5);
    expect(layer.zoom).toBe(1.5);
    expect(layer.dirtyFlags & DirtyFlag.Transform).toBeTruthy();
    expect(layer.dirtyFlags & DirtyFlag.Layout).toBeTruthy();
    expect(layer.dirtyFlags & DirtyFlag.Text).toBeFalsy();
    expect(() => layer.setZoom(0)).toThrow(HudError);
    hud.dispose();
  });
});
