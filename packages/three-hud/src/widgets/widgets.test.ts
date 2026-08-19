import { describe, expect, it } from "vitest";
import { Crosshair } from "./Crosshair.js";
import { Panel } from "./Panel.js";
import { RadialBar } from "./RadialBar.js";

describe("widgets", () => {
  it("composes panel, radial bar, and crosshair from HudNode", () => {
    const panel = new Panel({ id: "panel" });
    const radial = new RadialBar({ value: 40, max: 80 });
    const crosshair = new Crosshair();
    expect(panel.size.width).toBe(320);
    expect(radial.ratio()).toBe(0.5);
    expect(crosshair.children.length).toBeGreaterThanOrEqual(2);
  });
});
