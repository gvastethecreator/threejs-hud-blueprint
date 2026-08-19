import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { DirtyFlag } from "./DirtyFlags.js";
import { HUD } from "./HUD.js";
import { HudNode } from "./HudNode.js";
import { hitTest } from "../input/hitTest.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { resolveLayerViewport } from "../viewport/layerTransform.js";

describe("hud-layer", () => {
  it("lets contain, integer, and native layers coexist and sorts equal order by insertion", async () => {
    const hud = new HUD({ referenceSize: { width: 1920, height: 1080 } });
    const smooth = hud.createLayer({ id: "smooth", scaleMode: "contain", order: 0 });
    const pixel = hud.createLayer({ id: "pixel", scaleMode: "integer", pixelSnap: true, order: 0 });
    const native = hud.createLayer({ id: "native", scaleMode: "native", order: 1 });
    expect(hud.layers.map((layer) => layer.id)).toEqual(["smooth", "pixel", "native"]);
    expect(smooth.scaleMode).toBe("contain");
    expect(pixel.pixelSnap).toBe(true);
    expect(native.scaleMode).toBe("native");
    const view = { x: 0, y: 0, width: 1280, height: 720 };
    const contain = resolveLayerViewport({
      referenceSize: hud.referenceSize,
      viewport: view,
      mode: "contain",
    });
    const integer = resolveLayerViewport({
      referenceSize: hud.referenceSize,
      viewport: view,
      mode: "integer",
    });
    const nativeXf = resolveLayerViewport({
      referenceSize: hud.referenceSize,
      viewport: view,
      mode: "native",
    });
    expect(contain.scaleX).not.toBe(nativeXf.scaleX);
    expect(contain.scaleX).not.toBe(integer.scaleX);
    expect(Number.isInteger(integer.scaleX)).toBe(true);
    hud.setLayerOrder("native", 0);
    expect(hud.layers.map((layer) => layer.id)).toEqual(["smooth", "pixel", "native"]);
    await hud.initialize();
    hud.dispose();
  });

  it("removes a layer with detach or dispose and rejects duplicate IDs", () => {
    const hud = new HUD({ referenceSize: { width: 100, height: 100 } });
    const layer = hud.createLayer({ id: "main" });
    const child = layer.add(new HudNode({ id: "child", width: 10, height: 10 }));
    expect(() => hud.createLayer({ id: "main" })).toThrow(HudError);
    const detached = hud.removeLayer("main");
    expect(detached).toBe(layer);
    expect(layer.owner).toBeNull();
    expect(child.disposed).toBe(false);
    hud.createLayer({ id: "other" });
    hud.removeLayer("other", { disposeContent: true });
    expect(hud.layers).toHaveLength(0);
    hud.dispose();
  });

  it("skips layout, input, and draw work for disabled layers", async () => {
    const hud = new HUD({ referenceSize: { width: 100, height: 100 } });
    const layer = hud.createLayer({ id: "off", enabled: false });
    const node = layer.add(new HudNode({ id: "n", width: 20, height: 20 }));
    node.setOpacity(0.3);
    await hud.initialize();
    hud.update(0);
    expect(node.dirtyFlags & DirtyFlag.Style).toBeTruthy();
    expect(hitTest(layer, 10, 10)).toBeNull();
    layer.setEnabled(true);
    hud.update(0);
    expect(node.dirtyFlags).toBe(DirtyFlag.None);
    expect(hitTest(layer, 10, 10)?.id).toBe("n");
    layer.setEnabled(false);
    expect(encodeOverlayQueue([layer], "webgl").size).toBe(0);
    hud.dispose();
  });
});
