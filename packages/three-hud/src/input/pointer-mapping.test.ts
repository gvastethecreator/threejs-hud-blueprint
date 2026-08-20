import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { mapPointerToLayer, pickLayerAt } from "./pointerMap.js";

describe("pointer-mapping", () => {
  it("maps split-screen canvas offsets into logical layer space", () => {
    const hud = new HUD({ referenceSize: { width: 200, height: 100 } });
    const layer = hud.createLayer({ id: "main", scaleMode: "native" });
    const mapped = mapPointerToLayer(hud, layer, {
      clientX: 130,
      clientY: 40,
      canvasOrigin: { x: 20, y: 10 },
      viewport: { x: 10, y: 0, width: 200, height: 100 },
      dpr: 1,
    });
    expect(mapped.canvas).toMatchObject({ x: 110, y: 30 });
    expect(mapped.viewport).toMatchObject({ x: 100, y: 30 });
    expect(mapped.logical.x).toBeCloseTo(100);
    hud.dispose();
  });

  it("picks the top enabled layer whose reference height contains logicalY", () => {
    const hud = new HUD({ referenceSize: { width: 200, height: 100 } });
    hud.createLayer({ id: "bottom", referenceSize: { width: 200, height: 40 } });
    const top = hud.createLayer({ id: "top", referenceSize: { width: 200, height: 100 } });
    expect(pickLayerAt(hud, 10)?.id).toBe("top");
    top.setEnabled(false);
    expect(pickLayerAt(hud, 10)?.id).toBe("bottom");
    expect(pickLayerAt(hud, 80)?.id).toBe("bottom");
    hud.dispose();
  });
});
