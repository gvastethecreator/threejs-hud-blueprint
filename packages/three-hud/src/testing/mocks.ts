import { HudError } from "../contracts/errors.js";
import type { ReadonlySize } from "../contracts/geometry.js";
import type { HudFrameInfo, HudRendererAdapter } from "../render/contracts.js";
import type { HudLayer } from "../core/HudLayer.js";
import type { TextBackend } from "../text/contracts.js";
import { createGlyphRun, freezeGlyphRun } from "../text/contracts.js";

export type MockOwnership = "owned" | "borrowed";

export type MockResource = Readonly<{
  id: string;
  ownership: MockOwnership;
  disposed: boolean;
  dispose: () => void;
}>;

export function createIdFactory(prefix = "id"): () => string {
  let sequence = 0;
  return () => {
    sequence += 1;
    return `${prefix}-${sequence}`;
  };
}

export function createMockViewport(size: ReadonlySize = { width: 1280, height: 720 }): {
  readonly size: ReadonlySize;
  disposed: boolean;
  dispose: () => void;
} {
  let disposed = false;
  return {
    size: Object.freeze({ ...size }),
    get disposed() {
      return disposed;
    },
    dispose() {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Viewport mock already disposed.");
      disposed = true;
    },
  };
}

export function createMockResource(options: {
  id: string;
  ownership?: MockOwnership;
}): MockResource {
  const ownership = options.ownership ?? "owned";
  let disposed = false;
  return {
    id: options.id,
    ownership,
    get disposed() {
      return disposed;
    },
    dispose() {
      if (ownership === "borrowed") {
        throw new HudError("INVALID_STATE", "Borrowed resources must not be disposed.", {
          id: options.id,
          ownership,
        });
      }
      if (disposed) {
        throw new HudError("RESOURCE_DISPOSED", "Owned mock resource already disposed.", {
          id: options.id,
        });
      }
      disposed = true;
    },
  };
}

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

export function createMockRendererAdapter(
  kind: "webgl" | "webgpu" = "webgl",
): HudRendererAdapter & { disposed: boolean; frames: number } {
  let disposed = false;
  let frames = 0;
  return {
    id: `mock-adapter-${kind}`,
    initialize() {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Adapter mock is disposed.");
    },
    resize() {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Adapter mock is disposed.");
    },
    render(_layers: readonly HudLayer[], _frame: HudFrameInfo) {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Adapter mock is disposed.");
      frames += 1;
    },
    dispose() {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Adapter mock already disposed.");
      disposed = true;
    },
    get disposed() {
      return disposed;
    },
    get frames() {
      return frames;
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
    update() {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Mock text backend is disposed.");
    },
    disposePrepared() {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Mock text backend is disposed.");
    },
    dispose() {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Mock text backend already disposed.");
      disposed = true;
    },
  };
}

export function createEmptyGlyphRun() {
  return createGlyphRun({ text: "", fontId: "mock" });
}
