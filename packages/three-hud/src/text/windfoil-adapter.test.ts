import { describe, expect, it } from "vitest";
import * as main from "../index.js";
import { HudError } from "../contracts/errors.js";
import { createGlyphRun } from "./contracts.js";
import { runTextBackendConformance } from "./textBackendConformance.js";
import {
  WINDFOIL_EXPOSURE,
  WINDFOIL_PACKAGE_SUBPATH,
  createWindfoilTextBackend,
} from "./windfoil.js";
import { defaultWindfoilMatrixFace } from "./windfoil/matrix.js";
import { WINDFOIL_THREE_PUBLIC_APIS } from "./windfoil/threeSpike.js";

describe("windfoil-adapter", () => {
  it("keeps Windfoil off the main package import graph and marks the subpath experimental", () => {
    expect("createWindfoilTextBackend" in main).toBe(false);
    expect("WINDFOIL_EXPOSURE" in main).toBe(false);
    expect("parseTrueTypeFont" in main).toBe(false);
    expect(WINDFOIL_EXPOSURE).toBe("experimental");
    expect(WINDFOIL_PACKAGE_SUBPATH).toBe("@scope/three-hud/text/windfoil");
    expect(createWindfoilTextBackend().capabilities.status).toBe("experimental");
  });

  it("passes shared conformance cases for the experimental capability record", () => {
    const backend = createWindfoilTextBackend({ preprocess: defaultWindfoilMatrixFace() });
    const results = runTextBackendConformance(backend);
    expect(results.every((result) => result.status === "pass")).toBe(true);
  });

  it("does not use private Three.js APIs", () => {
    expect(WINDFOIL_THREE_PUBLIC_APIS).toEqual([
      "three.DataTexture",
      "three.FloatType",
      "three.InstancedMesh",
      "three.PlaneGeometry",
      "three.RGBAFormat",
      "three.ShaderMaterial",
      "probeRendererCapabilities",
    ]);
    expect(WINDFOIL_THREE_PUBLIC_APIS.join()).not.toContain("three/src");
  });

  it("encodes canonical glyph runs and only reattaches before dispose", () => {
    const backend = createWindfoilTextBackend();
    const run = createGlyphRun({
      fontId: "ui",
      text: "A",
      fontSize: 16,
      glyphs: [
        {
          glyphId: 2,
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
      ],
      bounds: { x: 0, y: 0, width: 8, height: 16 },
    });
    const empty = backend.prepare(run);
    expect(empty.encoded.instanceCount).toBe(0);
    backend.attach({
      preprocess: defaultWindfoilMatrixFace(),
      capability: { supported: true, status: "ready", reasons: [] },
    });
    const prepared = backend.prepare(run);
    expect(prepared.encoded.instanceCount).toBe(1);
    const instance = prepared.encoded.instances[0];
    expect(instance?.glyphId).toBe(2);
    expect(instance?.curveCount).toBeGreaterThan(0);
    expect(instance?.width).toBeGreaterThan(0);
    expect(instance?.height).toBeGreaterThan(0);
    backend.update(prepared, run);
    backend.detach();
    backend.attach({ preprocess: defaultWindfoilMatrixFace() });
    const again = backend.prepare(run);
    expect(again.encoded.uniqueGlyphCount).toBe(1);
    backend.dispose();
    expect(() => backend.attach({ preprocess: defaultWindfoilMatrixFace() })).toThrow(HudError);
    expect(() => backend.prepare(run)).toThrow(HudError);
  });

  it("rejects WebGL by capability and blocked exposure", () => {
    const blocked = createWindfoilTextBackend({ exposure: "blocked" });
    expect(blocked.capabilities.status).toBe("blocked");
    expect(() =>
      blocked.prepare(
        createGlyphRun({ fontId: "ui", text: "", bounds: { x: 0, y: 0, width: 0, height: 0 } }),
      ),
    ).toThrow(HudError);
    const webgl = createWindfoilTextBackend({
      capability: {
        supported: false,
        status: "unsupported",
        reasons: [{ code: "WINDFOIL_WEBGL2_FALLBACK", message: "WebGL2" }],
      },
    });
    expect(webgl.nativeWebgpu).toBe(false);
    expect(webgl.capabilities.rendererKinds).toEqual(["webgpu"]);
  });
});
