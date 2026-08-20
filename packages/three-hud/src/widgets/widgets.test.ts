import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, PIXEL_THEME } from "../theme/theme.js";
import { Compass } from "./Compass.js";
import { Crosshair } from "./Crosshair.js";
import { Gauge } from "./Gauge.js";
import { Hotbar } from "./Hotbar.js";
import { IconLabel } from "./IconLabel.js";
import { InventoryGrid } from "./InventoryGrid.js";
import { Label } from "./Label.js";
import { LinearBar } from "./LinearBar.js";
import { Panel } from "./Panel.js";
import { RadialBar } from "./RadialBar.js";
import { Slot } from "./Slot.js";

describe("widgets", () => {
  it("composes panel, radial bar, and crosshair from HudNode", () => {
    const panel = new Panel({ id: "panel" });
    const radial = new RadialBar({ value: 40, max: 80 });
    const crosshair = new Crosshair();
    expect(panel.size.width).toBe(320);
    expect(radial.ratio()).toBe(0.5);
    expect(crosshair.children.length).toBeGreaterThanOrEqual(2);
  });

  it("exposes a consistent value/dispose surface across the canvas widget set", () => {
    const widgets = [
      new Panel({ id: "p" }),
      new Label({ id: "l", text: "HP" }),
      new IconLabel({ id: "il", text: "AMMO" }),
      new LinearBar({ id: "hp", value: 10 }),
      new RadialBar({ id: "ammo", value: 4, max: 10 }),
      new Gauge({ id: "g", value: 3 }),
      new Compass({ id: "cmp" }),
      new Crosshair({ id: "c" }),
      new Slot({ id: "s", key: "gun" }),
      new InventoryGrid({ id: "inv", columns: 2, rows: 1 }),
      new Hotbar({ id: "hot", slots: [{ key: "a" }, { key: "b" }] }),
    ];
    for (const widget of widgets) {
      expect(widget.id.length).toBeGreaterThan(0);
      widget.dispose();
      expect(widget.disposed).toBe(true);
    }
  });

  it("constructs the same widgets under default and pixel theme radii", () => {
    const smooth = new Panel({ radius: Number(DEFAULT_THEME.radii["panel"]) });
    const pixel = new Panel({ radius: Number(PIXEL_THEME.radii["panel"]) });
    expect(smooth.background.radius).toBe(8);
    expect(pixel.background.radius).toBe(0);
    new Label({ fontId: "ui", text: "HP" }).dispose();
    new Label({ fontId: "pixel", text: "HP" }).dispose();
    smooth.dispose();
    pixel.dispose();
  });
});
