import { describe, expect, it } from "vitest";
import { HudImage } from "../primitives/Image.js";
import { IconLabel } from "./IconLabel.js";

describe("icon-label", () => {
  it("includes icon, gap, and text in intrinsic size", () => {
    const widget = new IconLabel({ text: "Ammo", value: "18", iconSize: 20, gap: 6 });
    expect(widget.icon).toBeInstanceOf(HudImage);
    const expected =
      widget.icon.size.width +
      widget.gap +
      widget.label.size.width +
      widget.gap +
      widget.valueLabel.size.width;
    expect(widget.size.width).toBe(expected);
    expect(widget.size.height).toBeGreaterThanOrEqual(20);
    widget.dispose();
  });

  it("lays out from the local origin so padding is not double-counted", () => {
    const widget = new IconLabel({ text: "Ammo", iconSize: 20, gap: 6 });
    widget.setPosition(100, 50);
    widget.relayout();
    expect(widget.icon.position.x).toBe(0);
    expect(widget.icon.worldBounds().x).toBe(100);
    expect(widget.label.worldBounds().x).toBe(100 + widget.icon.size.width + widget.gap);
  });

  it("omits an empty value label from intrinsic width", () => {
    const widget = new IconLabel({ text: "Ammo", iconSize: 20, gap: 6 });
    expect(widget.size.width).toBe(widget.icon.size.width + widget.gap + widget.label.size.width);
  });

  it("disposes icon and labels with the widget", () => {
    const widget = new IconLabel({ text: "Ammo", value: "18" });
    const { icon, label, valueLabel } = widget;
    widget.dispose();
    expect(widget.disposed).toBe(true);
    expect(icon.disposed).toBe(true);
    expect(label.disposed).toBe(true);
    expect(valueLabel.disposed).toBe(true);
  });
});
