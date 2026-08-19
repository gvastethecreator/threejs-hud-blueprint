import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { HudNode } from "../core/HudNode.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { applyStyle, DEFAULT_THEME, resolveWidgetStyle } from "../theme/theme.js";

describe("interaction-state", () => {
  it("feeds hovered/pressed/disabled into style without layout", async () => {
    const hud = new HUD({ referenceSize: { width: 80, height: 40 } });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    const node = layer.add(new HudNode({ id: "btn", width: 40, height: 20, fill: 0x1c2c3c }));
    await hud.initialize();
    hud.update(0);
    node.clearDirty(DirtyFlag.All);
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "move",
        clientX: 10,
        clientY: 10,
        button: 0,
        buttons: 0,
        pointerType: "mouse",
        time: 0,
      },
      { viewport: { x: 0, y: 0, width: 80, height: 40 } },
    );
    expect(hud.pointer.hovered?.id).toBe("btn");
    const before = node.invalidationCounters().layout;
    applyStyle(node, resolveWidgetStyle(DEFAULT_THEME, "Slot", { hovered: true, disabled: false }));
    expect(node.invalidationCounters().layout).toBe(before);
    expect((node.dirtyFlags & DirtyFlag.Layout) === 0).toBe(true);
    node.setDisabled(true);
    expect(node.disabled).toBe(true);
    hud.dispose();
  });
});
