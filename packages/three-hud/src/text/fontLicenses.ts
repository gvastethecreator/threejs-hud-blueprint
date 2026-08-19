import type { FontLicenseRecord, PixelFontPolicy } from "./contracts.js";

/** Bundled-with-the-npm-package licenses. Empty until a font is intentionally approved. */
export const BUNDLED_FONT_LICENSES: readonly FontLicenseRecord[] = Object.freeze([]);

export const EXAMPLE_PIXEL_FONT_POLICY: PixelFontPolicy = Object.freeze({
  nativePixelSize: 11,
  allowedSizes: Object.freeze([11, 22, 33]),
  allowedMultipliers: Object.freeze([1, 2, 3]),
  requireIntegerScale: true,
  mode: "crisp-bitmap",
});

export const EXAMPLE_FONT_LICENSE_RECORDS: readonly FontLicenseRecord[] = Object.freeze([
  Object.freeze({
    family: "example-pixel-ui",
    sourceUrl: "https://example.invalid/fonts/example-pixel-ui",
    sourceRevision: "fixture-0",
    licenseId: "OFL-1.1",
    licenseFile: "licenses/example-pixel-ui-OFL.txt",
    copyright: "Copyright (c) fixture author",
    author: "Fixture Author",
    notice: "Placeholder license record. No font binary is bundled.",
    redistributionAllowed: false,
    modificationAllowed: true,
    attribution: "example-pixel-ui",
  }),
  Object.freeze({
    family: "example-smooth-sans",
    sourceUrl: "https://example.invalid/fonts/example-smooth-sans",
    sourceRevision: "fixture-0",
    licenseId: "OFL-1.1",
    notice: "Placeholder license record. No font binary is bundled.",
    author: "Fixture Author",
    redistributionAllowed: false,
  }),
]);

export function enumerateBundledFontLicenses(): readonly FontLicenseRecord[] {
  return BUNDLED_FONT_LICENSES;
}

export const FONT_BINARY_EXTENSIONS = Object.freeze([
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
  ".eot",
  ".ttc",
]);
