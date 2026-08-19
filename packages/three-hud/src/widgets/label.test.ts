import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { Label } from "./Label.js";

describe("label", () => {
  it("remeasures when text changes and keeps backend-agnostic props", () => {
    const label = new Label({ text: "HP", fontSize: 10, fontId: "ui" });
    const width = label.size.width;
    expect(width).toBeGreaterThan(0);
    expect(label.primitive).toBe("text");
    expect(label.fontId).toBe("ui");
    label.setText("HEALTH");
    expect(label.size.width).toBeGreaterThan(width);
    label.setFontId("pixel");
    expect(label.fontId).toBe("pixel");
    expect(label.text).toBe("HEALTH");
    expect("backend" in label).toBe(false);
  });

  it("encodes glyphs through the shared overlay queue without a widget renderer", () => {
    const hud = new HUD({ referenceSize: { width: 160, height: 64 } });
    const layer = hud.createLayer({ id: "label-layer" });
    const label = new Label({ id: "title", text: "HP", fontSize: 16, color: 0xe8f6ff });
    label.setPosition(8, 8);
    layer.add(label);
    const queue = encodeOverlayQueue([layer], "webgl").snapshot();
    expect(queue.commands.some((command) => command.kind === "text")).toBe(true);
    hud.dispose();
  });

  it("disposes with the node tree", () => {
    const label = new Label({ text: "HP" });
    label.dispose();
    expect(label.disposed).toBe(true);
  });
});
