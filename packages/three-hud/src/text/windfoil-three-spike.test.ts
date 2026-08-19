import { describe, expect, it } from "vitest";
import { probeRendererCapabilities } from "../index.js";
import { preprocessWindfoilFace } from "./windfoil.js";
import {
  WINDFOIL_THREE_PUBLIC_APIS,
  createWindfoilThreeSpike,
  encodeWindfoilInstances,
} from "./windfoil/threeSpike.js";

const face = preprocessWindfoilFace({
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  lineGap: 0,
  unicodeToGlyph: { "65": 2 },
  kerning: {},
  glyphs: [
    { glyphId: 0, advanceWidth: 0, leftSideBearing: 0, contours: [], empty: true },
    { glyphId: 1, advanceWidth: 250, leftSideBearing: 0, contours: [], empty: true },
    {
      glyphId: 2,
      advanceWidth: 500,
      leftSideBearing: 0,
      empty: false,
      contours: [
        [
          { type: "move", p: { x: 0, y: 0 } },
          { type: "line", p: { x: 400, y: 0 } },
          { type: "line", p: { x: 400, y: 700 } },
          { type: "line", p: { x: 0, y: 700 } },
          { type: "close" },
        ],
      ],
    },
  ],
});

describe("windfoil-three-spike", () => {
  it("defaults to experimental exposure and never auto-selects on WebGL2", async () => {
    const { createWindfoilTextBackend } = await import("./windfoil.js");
    expect(createWindfoilTextBackend().capabilities.status).toBe("experimental");
    expect(createWindfoilTextBackend({ exposure: "blocked" }).capabilities.status).toBe("blocked");
  });

  it("rejects Windfoil on a WebGL2 fallback without allocating a mesh", async () => {
    const report = await probeRendererCapabilities({
      isWebGPURenderer: true,
      initialized: true,
      hasInitialized: () => true,
      backend: { isWebGLBackend: true, device: null },
      getPixelRatio: () => 1,
      capabilities: { isWebGL2: true, maxTextureSize: 2048 },
    });
    const spike = createWindfoilThreeSpike({ capability: report.windfoil, preprocess: face });
    const drawn = spike.draw([{ glyphId: 2, x: 0, y: 0, scale: 1, color: [1, 1, 1, 1] }]);
    expect(report.windfoil.supported).toBe(false);
    expect(drawn.status).toBe("unsupported");
    expect(drawn.drawCalls).toBe(0);
    expect(spike.mesh).toBeNull();
    spike.dispose();
  });

  it("reuses atlas curve ranges for repeated glyphs", () => {
    const encoded = encodeWindfoilInstances(face, [
      { glyphId: 2, x: 0, y: 0, scale: 1, color: [1, 1, 1, 1] },
      { glyphId: 2, x: 12, y: 0, scale: 2, color: [1, 0.2, 0.2, 1] },
    ]);
    expect(encoded.instanceCount).toBe(2);
    expect(encoded.uniqueGlyphCount).toBe(1);
    expect(encoded.reusedInstanceCount).toBe(1);
    expect(encoded.instances[0]?.curveStart).toBe(encoded.instances[1]?.curveStart);
    expect(encoded.instances[0]?.curveCount).toBe(encoded.instances[1]?.curveCount);
    expect(encoded.instances[1]?.scale).toBe(2);
  });

  it("draws one instanced batch with premultiplied-alpha material when native WebGPU is available", () => {
    const spike = createWindfoilThreeSpike({
      capability: { supported: true, status: "ready", reasons: [] },
      preprocess: face,
    });
    const drawn = spike.draw([
      { glyphId: 2, x: 0, y: 0, scale: 1, color: [1, 1, 1, 1] },
      { glyphId: 2, x: 8, y: 0, scale: 1, color: [0.2, 1, 0.8, 1] },
    ]);
    expect(drawn.status).toBe("drawn");
    expect(drawn.drawCalls).toBe(1);
    expect(drawn.reusedInstanceCount).toBe(1);
    expect(spike.mesh).not.toBeNull();
    const material = spike.mesh?.material;
    expect(Array.isArray(material) ? false : material?.premultipliedAlpha).toBe(true);
    spike.dispose();
    expect(spike.mesh).toBeNull();
  });

  it("uses only listed public Three.js and HUD APIs", () => {
    expect(WINDFOIL_THREE_PUBLIC_APIS).toContain("three.InstancedMesh");
    expect(WINDFOIL_THREE_PUBLIC_APIS).toContain("three.ShaderMaterial");
    expect(WINDFOIL_THREE_PUBLIC_APIS).toContain("probeRendererCapabilities");
  });
});
