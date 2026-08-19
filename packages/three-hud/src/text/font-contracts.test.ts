import { describe, expect, it } from "vitest";
import {
  fontCacheKey,
  isPreprocessedFontAsset,
  resolveFontMetadata,
  type FontRegistration,
} from "./contracts.js";
import {
  BUNDLED_FONT_LICENSES,
  EXAMPLE_FONT_LICENSE_RECORDS,
  EXAMPLE_PIXEL_FONT_POLICY,
  enumerateBundledFontLicenses,
} from "./fontLicenses.js";

describe("font-contracts", () => {
  it("lets equivalent byte sources share a caller-provided cache key", () => {
    const first = new Uint8Array([0, 1, 2, 79]);
    const second = new Uint8Array([9, 9, 9]);
    const a: FontRegistration = { id: "a", source: first, cacheKey: "face-shared" };
    const b: FontRegistration = { id: "b", source: second, cacheKey: "face-shared" };
    expect(fontCacheKey(a)).toBe(fontCacheKey(b));
    expect(fontCacheKey({ id: "c", source: first })).toBe("id:c");
  });

  it("represents a pixel font 11px recommendation without hardcoding a family", () => {
    const registration: FontRegistration = {
      id: "pixel-ui",
      source: "https://example.invalid/pixel.ttf",
      family: "host-supplied-pixel",
      pixelPolicy: EXAMPLE_PIXEL_FONT_POLICY,
      renderMode: "bitmap",
    };
    const metadata = resolveFontMetadata(registration);
    expect(metadata.pixelPolicy?.nativePixelSize).toBe(11);
    expect(metadata.pixelPolicy?.allowedSizes).toEqual([11, 22, 33]);
    expect(metadata.pixelPolicy?.mode).toBe("crisp-bitmap");
    expect(metadata.family).not.toMatch(/departure/i);
    const smooth: FontRegistration = {
      id: "pixel-smooth",
      source: new URL("https://example.invalid/pixel.otf"),
      pixelPolicy: {
        ...EXAMPLE_PIXEL_FONT_POLICY,
        mode: "smooth-outline",
        requireIntegerScale: false,
      },
    };
    expect(resolveFontMetadata(smooth).pixelPolicy?.mode).toBe("smooth-outline");
  });

  it("enumerates bundled licenses and includes no default font binary", () => {
    expect(enumerateBundledFontLicenses()).toEqual([]);
    expect(BUNDLED_FONT_LICENSES).toHaveLength(0);
    expect(
      EXAMPLE_FONT_LICENSE_RECORDS.every((record) => record.redistributionAllowed === false),
    ).toBe(true);
    expect(EXAMPLE_FONT_LICENSE_RECORDS.map((record) => record.family)).toEqual([
      "example-pixel-ui",
      "example-smooth-sans",
    ]);
  });

  it("accepts URL, bytes, and preprocessed assets without a Google Fonts CSS runtime", () => {
    const preprocessed = {
      kind: "preprocessed" as const,
      format: "windfoil" as const,
      hash: "abc",
    };
    expect(isPreprocessedFontAsset(preprocessed)).toBe(true);
    expect(fontCacheKey({ id: "wf", source: preprocessed })).toBe("preprocessed:windfoil:abc");
    expect(fontCacheKey({ id: "remote", source: "https://cdn.example/ui.ttf" })).toBe(
      "url:https://cdn.example/ui.ttf",
    );
    const keys = Object.keys({ id: "x", source: new Uint8Array() } satisfies FontRegistration);
    expect(keys).not.toContain("googleFontsCss");
  });
});
