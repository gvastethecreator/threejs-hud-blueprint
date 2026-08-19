import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import {
  DEFAULT_THEME,
  PIXEL_THEME,
  THEME_PRECEDENCE,
  resolveToken,
  resolveWidgetStyle,
  serializeTheme,
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
