import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { HudNode } from "../core/HudNode.js";
import {
  DEFAULT_THEME,
  MONOCHROME_INVERT_THEME,
  MONOCHROME_THEME,
  PIXEL_THEME,
  THEME_PRECEDENCE,
  applyStyle,
  createMonochromeTheme,
  isGrayscaleColor,
  resolveToken,
  resolveWidgetStyle,
  serializeTheme,
  themeColor,
} from "./theme.js";

describe("themes", () => {
  it("serializes and resolves state precedence", () => {
    expect(THEME_PRECEDENCE).toEqual([
      "base",
      "variant",
      "selected",
      "hovered",
      "pressed",
      "disabled",
      "override",
    ]);
    const parsed = JSON.parse(serializeTheme(DEFAULT_THEME)) as { id: string };
    expect(parsed.id).toBe("default");
    const style = resolveWidgetStyle(
      DEFAULT_THEME,
      "Slot",
      { selected: true, hovered: true, disabled: true },
      { fill: 0x111111 },
    );
    expect(style["fill"]).toBe(0x111111);
    expect(PIXEL_THEME.radii["panel"]).toBe(0);
  });

  it("applies a paint override without marking layout dirty", () => {
    const node = new HudNode({ id: "paint", width: 20, height: 10, fill: 0x15202c });
    node.clearDirty();
    const layout = node.invalidationCounters().layout;
    applyStyle(node, { fill: 0x334455 });
    expect(node.fill).toBe(0x334455);
    expect(node.invalidationCounters().layout).toBe(layout);
    expect((node.dirtyFlags & DirtyFlag.Layout) === 0).toBe(true);
  });
});

describe("monochrome theme", () => {
  it("keeps every starter color grayscale and inverts paper and ink", () => {
    const keys = [
      "panel",
      "track",
      "fill",
      "delayed",
      "text",
      "muted",
      "crosshair",
      "slot",
      "selected",
    ] as const;
    for (const key of keys) {
      expect(isGrayscaleColor(themeColor(MONOCHROME_THEME, key))).toBe(true);
      expect(isGrayscaleColor(themeColor(MONOCHROME_INVERT_THEME, key))).toBe(true);
    }
    expect(themeColor(MONOCHROME_THEME, "text")).toBe(0xffffff);
    expect(themeColor(MONOCHROME_THEME, "panel")).toBe(0x000000);
    expect(themeColor(MONOCHROME_INVERT_THEME, "text")).toBe(0x000000);
    expect(themeColor(MONOCHROME_INVERT_THEME, "panel")).toBe(0xffffff);
    expect(MONOCHROME_THEME.radii["panel"]).toBe(0);
    expect(MONOCHROME_THEME.typography["label"]).toEqual({
      font: "pixel",
      size: 14,
      color: 0xffffff,
    });
    const custom = createMonochromeTheme({ invert: true, font: "ui", size: 16 });
    expect(themeColor(custom, "text")).toBe(0x000000);
    expect((custom.typography["label"] as { font?: string; size?: number }).font).toBe("ui");
    expect((custom.typography["label"] as { font?: string; size?: number }).size).toBe(16);
  });
});

describe("tokens", () => {
  it("diagnoses missing and cyclic tokens", () => {
    expect(resolveToken(DEFAULT_THEME, "colors.panel")).toBe(0x15202c);
    expect(() => resolveToken(DEFAULT_THEME, "colors.missing")).toThrow(HudError);
    const cyclic = {
      ...DEFAULT_THEME,
      colors: { a: { $ref: "colors.b" }, b: { $ref: "colors.a" } },
    };
    expect(() => resolveToken(cyclic, "colors.a")).toThrow(HudError);
  });
});
