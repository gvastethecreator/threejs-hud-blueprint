import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { RoundedRect } from "../primitives/RoundedRect.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { Label } from "./Label.js";
import { Panel } from "./Panel.js";

describe("panel", () => {
  it("applies padding to the content container", () => {
    const panel = new Panel({
      width: 200,
      height: 100,
      padding: { top: 10, right: 8, bottom: 10, left: 12 },
    });
    expect(panel.content.position).toEqual({ x: 12, y: 10 });
    expect(panel.content.size).toEqual({ width: 180, height: 80 });
    panel.content.add(new Label({ text: "Hi" }));
    panel.layoutChildren();
    panel.dispose();
  });

  it("applies padding once to child world bounds", () => {
    const panel = new Panel({
      width: 200,
      height: 100,
      padding: { top: 10, right: 8, bottom: 10, left: 12 },
    });
    panel.setPosition(40, 20);
    const child = new Label({ text: "Hi", fontSize: 10 });
    panel.content.add(child);
    panel.layoutChildren();
    const bounds = child.worldBounds();
    expect(bounds.x).toBe(40 + 12);
    expect(bounds.y).toBe(20 + 10);
  });

  it("composes RoundedRect and encodes through the shared overlay queue", () => {
    expect(new Panel().background).toBeInstanceOf(RoundedRect);
    const hud = new HUD({ referenceSize: { width: 240, height: 120 } });
    const layer = hud.createLayer({ id: "panel-layer" });
    const panel = new Panel({ id: "tray", width: 120, height: 64, fill: 0x1c3a58 });
    panel.setPosition(8, 8);
    panel.content.add(new Label({ id: "tray-title", text: "TRAY", fontSize: 12, color: 0xe8f6ff }));
    panel.layoutChildren();
    layer.add(panel);
    const queue = encodeOverlayQueue([layer], "webgl").snapshot();
    expect(queue.commands.some((command) => command.kind === "shape")).toBe(true);
    expect(queue.commands.some((command) => command.kind === "text")).toBe(true);
    expect(queue.commands.every((command) => command.kind !== "debug")).toBe(true);
    hud.dispose();
  });

  it("disposes owned background, content, and nested children", () => {
    const panel = new Panel({ id: "owned" });
    const { background, content } = panel;
    const child = content.add(new Label({ text: "Hi" }));
    panel.dispose();
    expect(panel.disposed).toBe(true);
    expect(background.disposed).toBe(true);
    expect(content.disposed).toBe(true);
    expect(child.disposed).toBe(true);
  });
});
