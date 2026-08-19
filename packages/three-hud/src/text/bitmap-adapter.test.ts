import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { createGlyphRun } from "./contracts.js";
import {
  createBitmapTextBackend,
  rasterizeBitmapManifest,
  validateBitmapManifest,
  type BitmapFontManifest,
} from "./bitmap.js";
import { runTextBackendConformance } from "./textBackendConformance.js";

const license = {
  family: "example-pixel-ui",
  sourceUrl: "https://example.invalid/pixel",
  licenseId: "OFL-1.1",
  redistributionAllowed: false,
};

function manifest(overrides: Partial<BitmapFontManifest> = {}): BitmapFontManifest {
  return {
    schemaVersion: "three-hud/bitmap-font/v0",
    nativeSize: 11,
    lineHeight: 12,
    baseline: 9,
    pages: 1,
    sourceHash: "abc",
    license,
    glyphs: [
      { id: 0, x: 0, y: 0, width: 0, height: 0, xAdvance: 5, xOffset: 0, yOffset: 0 },
      { id: 65, x: 0, y: 0, width: 8, height: 11, xAdvance: 8, xOffset: 0, yOffset: 0 },
    ],
    kerning: {},
    ...overrides,
  };
}

describe("bitmap-adapter", () => {
  it("validates a manifest before any GPU work and keeps prebuilt/runtime metrics compatible", () => {
    expect(() => validateBitmapManifest(manifest({ pages: 2 }))).toThrow(HudError);
    const prebuilt = validateBitmapManifest(manifest());
    const runtime = rasterizeBitmapManifest(manifest());
    expect(runtime.nativeSize).toBe(prebuilt.nativeSize);
    expect(runtime.glyphs.map((glyph) => glyph.xAdvance)).toEqual(
      prebuilt.glyphs.map((glyph) => glyph.xAdvance),
    );
  });

  it("treats blank and missing glyphs consistently and does not ship a font binary", () => {
    const backend = createBitmapTextBackend({ manifest: manifest() });
    const run = createGlyphRun({
      fontId: "pixel",
      text: "A?",
      glyphs: [
        {
          glyphId: 65,
          glyphKey: "65",
          cluster: 0,
          x: 0,
          y: 0,
          advance: 8,
          advanceX: 8,
          advanceY: 0,
          offsetX: 0,
          offsetY: 0,
          line: 0,
        },
        {
          glyphId: 63,
          glyphKey: "63",
          cluster: 1,
          x: 8,
          y: 0,
          advance: 8,
          advanceX: 8,
          advanceY: 0,
          offsetX: 0,
          offsetY: 0,
          line: 0,
        },
        {
          glyphId: 0,
          glyphKey: "32",
          cluster: 2,
          x: 16,
          y: 0,
          advance: 5,
          advanceX: 5,
          advanceY: 0,
          offsetX: 0,
          offsetY: 0,
          line: 0,
        },
      ],
      bounds: { x: 0, y: 0, width: 21, height: 11 },
    });
    const prepared = backend.prepare(run);
    expect(prepared.missing).toBe(1);
    expect(prepared.atlasWidth).toBeGreaterThan(0);
    expect(prepared.atlasHeight).toBeGreaterThan(0);
    expect(prepared.glyphs).toHaveLength(3);
    expect(prepared.glyphs[0]?.u1).toBeGreaterThan(prepared.glyphs[0]?.u0 ?? 1);
    backend.disposePrepared(prepared);
    backend.dispose();
  });

  it("passes shared disposal cases when a manifest is present", () => {
    const backend = createBitmapTextBackend({ manifest: manifest() });
    const results = runTextBackendConformance(backend);
    expect(results.every((result) => result.status === "pass")).toBe(true);
  });
});
