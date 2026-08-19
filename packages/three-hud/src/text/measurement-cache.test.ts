import { describe, expect, it } from "vitest";
import { MeasurementCache } from "./measurementCache.js";
import { layoutCacheKey, normalizeTextStyle } from "./textStyle.js";

describe("measurement-cache", () => {
  const style = normalizeTextStyle({ font: "ui", size: 16 });

  it("does not invalidate measurement when only color changes", () => {
    const cache = new MeasurementCache();
    cache.set(style, "Score", { width: 40, height: 16 });
    const painted = normalizeTextStyle({ font: "ui", size: 16, color: 0x33ffaa });
    expect(cache.get(painted, "Score")).toEqual({ width: 40, height: 16 });
    expect(cache.stats().hits).toBe(1);
  });

  it("invalidates when size, tracking, text, font, wrap width, or line height change", () => {
    const cache = new MeasurementCache();
    cache.set(style, "Score", { width: 40, height: 16 });
    expect(cache.get(normalizeTextStyle({ font: "ui", size: 18 }), "Score")).toBeUndefined();
    expect(
      cache.get(normalizeTextStyle({ font: "ui", size: 16, letterSpacing: 1 }), "Score"),
    ).toBeUndefined();
    expect(cache.get(style, "HP")).toBeUndefined();
    expect(cache.get(normalizeTextStyle({ font: "other", size: 16 }), "Score")).toBeUndefined();
    expect(
      cache.get(normalizeTextStyle({ font: "ui", size: 16, maxWidth: 80 }), "Score"),
    ).toBeUndefined();
    expect(
      cache.get(normalizeTextStyle({ font: "ui", size: 16, lineHeight: 20 }), "Score"),
    ).toBeUndefined();
  });

  it("shares entries for equivalent normalized styles without using object identity", () => {
    const cache = new MeasurementCache(2);
    const a = normalizeTextStyle({ font: "ui", size: 16, align: "left" });
    const b = normalizeTextStyle({ font: "ui", size: 16 });
    expect(layoutCacheKey(a, "Hi")).toBe(layoutCacheKey(b, "Hi"));
    cache.set(a, "Hi", { width: 10, height: 16 });
    expect(cache.get(b, "Hi")).toEqual({ width: 10, height: 16 });
    cache.set(normalizeTextStyle({ font: "ui", size: 12 }), "A", { width: 4, height: 12 });
    cache.set(normalizeTextStyle({ font: "ui", size: 14 }), "B", { width: 5, height: 14 });
    expect(cache.stats().evictions).toBe(1);
    expect(cache.stats().size).toBe(2);
  });
});
