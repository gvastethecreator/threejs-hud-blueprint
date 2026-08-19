import { HudError } from "../../contracts/errors.js";
import type { FontLicenseRecord } from "../contracts.js";

export const BITMAP_MANIFEST_SCHEMA = "three-hud/bitmap-font/v0" as const;
export const BITMAP_MAX_PAGES = 1;

export type BitmapGlyph = Readonly<{
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xAdvance: number;
  xOffset: number;
  yOffset: number;
}>;

export type BitmapFontManifest = Readonly<{
  schemaVersion: typeof BITMAP_MANIFEST_SCHEMA;
  nativeSize: number;
  lineHeight: number;
  baseline: number;
  pages: number;
  sourceHash: string;
  license: FontLicenseRecord;
  glyphs: readonly BitmapGlyph[];
  kerning: Readonly<Record<string, number>>;
}>;

export function validateBitmapManifest(manifest: BitmapFontManifest): BitmapFontManifest {
  if (manifest.schemaVersion !== BITMAP_MANIFEST_SCHEMA) {
    throw new HudError("INVALID_ARGUMENT", "Unknown bitmap font manifest schema.", {
      schemaVersion: manifest.schemaVersion,
    });
  }
  if (!Number.isFinite(manifest.nativeSize) || manifest.nativeSize <= 0) {
    throw new HudError("INVALID_ARGUMENT", "Bitmap nativeSize must be a finite positive number.", {
      nativeSize: manifest.nativeSize,
    });
  }
  if (manifest.pages !== 1) {
    throw new HudError(
      "INVALID_ARGUMENT",
      `v0.1 bitmap fonts support exactly ${BITMAP_MAX_PAGES} atlas page.`,
      { pages: manifest.pages },
    );
  }
  if (!manifest.license.licenseId) {
    throw new HudError("INVALID_ARGUMENT", "Bitmap manifest requires a license record.", {
      family: manifest.license.family,
    });
  }
  return manifest;
}
