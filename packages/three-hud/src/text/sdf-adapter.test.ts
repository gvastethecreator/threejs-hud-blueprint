import { describe, expect, it } from "vitest";
import * as main from "../index.js";
import { createGlyphRun } from "./contracts.js";
import { runTextBackendConformance } from "./textBackendConformance.js";
import { SDF_PACKAGE_SUBPATH, createSdfTextBackend } from "./sdf.js";

describe("sdf-adapter", () => {
  it("keeps the SDF adapter off the main entry and widgets", () => {
    expect("createSdfTextBackend" in main).toBe(false);
    expect("LinearBar" in main).toBe(true);
    expect(SDF_PACKAGE_SUBPATH).toBe("@scope/three-hud/text/sdf");
  });

  it("passes shared conformance and encodes multiline glyph runs", () => {
    const backend = createSdfTextBackend();
    const results = runTextBackendConformance(backend);
    expect(results.every((result) => result.status === "pass")).toBe(true);
    const again = createSdfTextBackend();
    const run = createGlyphRun({
      fontId: "ui",
      text: "Hi\nOK",
      fontSize: 16,
      glyphs: [glyph(0, 0), glyph(8, 0), glyph(0, 16), glyph(8, 16)],
      bounds: { x: 0, y: 0, width: 16, height: 32 },
    });
    const prepared = again.prepare(run);
    expect(prepared.glyphCount).toBe(4);
    expect(prepared.atlasWidth).toBeGreaterThan(0);
    expect(prepared.atlasHeight).toBeGreaterThan(0);
    expect(prepared.sdf).toBe(true);
    expect(prepared.glyphs).toHaveLength(4);
    expect(prepared.glyphs[0]?.u1).toBeGreaterThan(prepared.glyphs[0]?.u0 ?? 1);
    expect(prepared.glyphs[0]?.v1).toBeGreaterThan(prepared.glyphs[0]?.v0 ?? 1);
    again.disposePrepared(prepared);
    again.dispose();
  });

  it("declares WebGPU encode-only versus unsupported modes precisely", () => {
    expect(createSdfTextBackend().capabilities.rendererKinds).toEqual(["webgl", "webgpu"]);
    expect(createSdfTextBackend({ webgpuMode: "unsupported" }).capabilities.rendererKinds).toEqual([
      "webgl",
    ]);
  });
});

function glyph(x: number, y: number) {
  return {
    glyphId: 1,
    glyphKey: "65",
    cluster: 0,
    x,
    y,
    advance: 8,
    advanceX: 8,
    advanceY: 0,
    offsetX: 0,
    offsetY: 0,
    line: y === 0 ? 0 : 1,
  };
}
