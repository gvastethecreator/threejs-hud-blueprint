import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { layoutCacheKey, normalizeTextStyle, paintCacheKey } from "./textStyle.js";

describe("text-style", () => {
  it("normalizes defaults and keeps layout keys independent of color", () => {
    const base = normalizeTextStyle({ font: "ui", size: 16, color: 0xff0000 });
    const painted = normalizeTextStyle({ font: "ui", size: 16, color: 0x00ff00 });
    expect(layoutCacheKey(base, "Hi")).toBe(layoutCacheKey(painted, "Hi"));
    expect(paintCacheKey(base)).not.toBe(paintCacheKey(painted));
  });

  it("diagnoses non-finite style values before layout", () => {
    expect(() => normalizeTextStyle({ font: "ui", size: Number.NaN })).toThrow(HudError);
    expect(() =>
      normalizeTextStyle({ font: "ui", size: 12, letterSpacing: Number.POSITIVE_INFINITY }),
    ).toThrow(HudError);
    expect(() => normalizeTextStyle({ font: "ui", size: 12, maxWidth: 0 })).toThrow(HudError);
  });
});
