import { HudError } from "../contracts/errors.js";
import type { TextBackend } from "../text/contracts.js";
import { createGlyphRun, freezeGlyphRun } from "../text/contracts.js";

export function createMockRenderer(kind: "webgl" | "webgpu" = "webgl"): {
  isWebGPURenderer: boolean;
  initialized: boolean;
  backend: { isWebGLBackend: boolean };
  getPixelRatio: () => number;
  disposed: boolean;
  dispose: () => void;
} {
  let disposed = false;
  return {
    isWebGPURenderer: kind === "webgpu",
    initialized: true,
    backend: { isWebGLBackend: kind === "webgl" },
    getPixelRatio: () => 1,
    get disposed() {
      return disposed;
    },
    dispose() {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Renderer mock already disposed.");
      disposed = true;
    },
  };
}

export function createMockTextBackend(): TextBackend {
  let disposed = false;
  return {
    id: "mock",
    capabilities: {
      id: "mock",
      rendererKinds: ["webgl", "webgpu"],
      scalableCoverage: true,
      pixelPerfect: false,
      dynamicGlyphs: true,
      colorGlyphs: false,
      rotation: "full",
      deviceLossRecovery: false,
      status: "supported",
    },
    prepare(run) {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Mock text backend is disposed.");
      return freezeGlyphRun(run);
    },
    update() {},
    disposePrepared() {},
    dispose() {
      disposed = true;
    },
  };
}

export function createEmptyGlyphRun() {
  return createGlyphRun({ text: "", fontId: "mock" });
}
