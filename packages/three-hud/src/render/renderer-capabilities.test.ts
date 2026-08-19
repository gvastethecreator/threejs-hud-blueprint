import { describe, expect, it } from "vitest";
import { probeRendererCapabilities } from "../index.js";

function stringifyReport(report: unknown): string {
  return JSON.stringify(report);
}

function createWebGlRenderer() {
  return {
    isWebGLRenderer: true,
    capabilities: { isWebGL2: true, maxTextureSize: 8192 },
    extensions: { has: (name: string) => name === "EXT_color_buffer_float" },
    getPixelRatio: () => 2,
    getContext: () => ({
      MAX_TEXTURE_SIZE: 0x0d33,
      getParameter: (pname: number) => (pname === 0x0d33 ? 8192 : 0),
    }),
  };
}

function createNativeWebGpuRenderer() {
  const features = new Set(["timestamp-query"]);
  const device = {
    features: { has: (name: string) => features.has(name) },
    limits: { maxTextureDimension2D: 16384, maxStorageBufferBindingSize: 134217728 },
  };
  return {
    isWebGPURenderer: true,
    initialized: true,
    hasInitialized: () => true,
    backend: {
      isWebGPUBackend: true,
      device,
    },
    hasFeature: (name: string) => features.has(name),
    getPixelRatio: () => 1.5,
  };
}

function createWebGpuWebGl2FallbackRenderer() {
  return {
    isWebGPURenderer: true,
    initialized: true,
    hasInitialized: () => true,
    backend: {
      isWebGLBackend: true,
      device: null,
      extensions: { has: () => false },
    },
    hasFeature: () => false,
    getPixelRatio: () => 1,
    capabilities: { isWebGL2: true, maxTextureSize: 4096 },
  };
}

function createUninitializedWebGpuRenderer() {
  return {
    isWebGPURenderer: true,
    initialized: false,
    hasInitialized: () => false,
    backend: {
      isWebGPUBackend: true,
      device: null,
    },
    getPixelRatio: () => 1,
    init: async () => {
      throw new Error("init must not run in the pending-state test");
    },
  };
}

describe("renderer-capabilities", () => {
  it("reports an initialized WebGL2 renderer without Windfoil", async () => {
    const report = await probeRendererCapabilities(createWebGlRenderer());
    expect(report.kind).toBe("webgl");
    expect(report.backend).toBe("webgl");
    expect(report.status).toBe("ready");
    expect(report.initialized).toBe(true);
    expect(report.storageBuffers).toBe(false);
    expect(report.nativeWgsl).toBe(false);
    expect(report.instancing).toBe(true);
    expect(report.derivatives).toBe(true);
    expect(report.maxTextureSize).toBe(8192);
    expect(report.dpr).toBe(2);
    expect(report.windfoil.supported).toBe(false);
    expect(report.windfoil.status).toBe("unsupported");
    expect(
      report.windfoil.reasons.some(
        (reason) => reason.code === "WINDFOIL_RENDERER_KIND_UNSUPPORTED",
      ),
    ).toBe(true);
  });

  it("reports native WebGPU with Windfoil renderer support", async () => {
    const report = await probeRendererCapabilities(createNativeWebGpuRenderer());
    expect(report.kind).toBe("webgpu");
    expect(report.backend).toBe("webgpu");
    expect(report.status).toBe("ready");
    expect(report.storageBuffers).toBe(true);
    expect(report.nativeWgsl).toBe(true);
    expect(report.instancing).toBe(true);
    expect(report.derivatives).toBe(true);
    expect(report.maxTextureSize).toBe(16384);
    expect(report.dpr).toBe(1.5);
    expect(report.timestampQueries).toBe(true);
    expect(report.windfoil.supported).toBe(true);
    expect(report.windfoil.status).toBe("ready");
    expect(report.windfoil.reasons).toEqual([]);
  });

  it("does not advertise Windfoil on a forced WebGL2 WebGPURenderer", async () => {
    const report = await probeRendererCapabilities(createWebGpuWebGl2FallbackRenderer());
    expect(report.kind).toBe("webgpu");
    expect(report.backend).toBe("webgl2-fallback");
    expect(report.status).toBe("ready");
    expect(report.storageBuffers).toBe(false);
    expect(report.nativeWgsl).toBe(false);
    expect(report.windfoil.supported).toBe(false);
    expect(report.windfoil.status).toBe("unsupported");
    expect(report.reasons.some((reason) => reason.code === "WEBGL2_FALLBACK")).toBe(true);
    expect(
      report.windfoil.reasons.some((reason) => reason.code === "WINDFOIL_WEBGL2_FALLBACK"),
    ).toBe(true);
  });

  it("treats an uninitialized WebGPURenderer as pending, not production-ready", async () => {
    const report = await probeRendererCapabilities(createUninitializedWebGpuRenderer(), {
      initialize: false,
    });
    expect(report.kind).toBe("webgpu");
    expect(report.backend).toBe("pending");
    expect(report.status).toBe("pending");
    expect(report.initialized).toBe(false);
    expect(report.storageBuffers).toBe(false);
    expect(report.nativeWgsl).toBe(false);
    expect(report.windfoil.supported).toBe(false);
    expect(report.windfoil.status).toBe("pending");
    expect(report.reasons.some((reason) => reason.code === "WEBGPU_INIT_REQUIRED")).toBe(true);
    expect(
      report.windfoil.reasons.some((reason) => reason.code === "WINDFOIL_RENDERER_UNINITIALIZED"),
    ).toBe(true);
  });

  it("reports unavailable when no renderer is supplied", async () => {
    const report = await probeRendererCapabilities(null);
    expect(report.kind).toBe("unknown");
    expect(report.backend).toBe("unavailable");
    expect(report.status).toBe("unavailable");
    expect(report.windfoil.supported).toBe(false);
    expect(report.windfoil.status).toBe("unavailable");
    expect(report.reasons.some((reason) => reason.code === "RENDERER_UNAVAILABLE")).toBe(true);
  });

  it("JSON-serializes the report without renderer objects or circular references", async () => {
    const renderer: Record<string, unknown> = createWebGpuWebGl2FallbackRenderer();
    renderer["self"] = renderer;
    const backend = renderer["backend"];
    if (backend && typeof backend === "object") {
      (backend as Record<string, unknown>)["renderer"] = renderer;
    }
    const report = await probeRendererCapabilities(renderer);
    const json = stringifyReport(report);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(json).not.toMatch(/\[object Object\]/);
    expect(parsed).not.toHaveProperty("self");
    expect(parsed).not.toHaveProperty("renderer");
    expect(parsed["kind"]).toBe("webgpu");
    expect(parsed["backend"]).toBe("webgl2-fallback");
    expect((parsed["windfoil"] as { supported: boolean }).supported).toBe(false);
  });

  it("does not advertise Windfoil when native WebGPU storage buffers are absent", async () => {
    const report = await probeRendererCapabilities({
      isWebGPURenderer: true,
      initialized: true,
      hasInitialized: () => true,
      backend: {
        isWebGPUBackend: true,
        device: {
          features: { has: () => false },
          limits: { maxTextureDimension2D: 8192, maxStorageBufferBindingSize: 0 },
        },
      },
      getPixelRatio: () => 1,
    });
    expect(report.backend).toBe("webgpu");
    expect(report.storageBuffers).toBe(false);
    expect(report.nativeWgsl).toBe(true);
    expect(report.windfoil.supported).toBe(false);
    expect(
      report.windfoil.reasons.some(
        (reason) => reason.code === "WINDFOIL_STORAGE_BUFFERS_UNAVAILABLE",
      ),
    ).toBe(true);
  });

  it("initializes a WebGPURenderer before resolving capabilities when required", async () => {
    let initCalls = 0;
    const renderer = {
      isWebGPURenderer: true,
      initialized: false,
      hasInitialized() {
        return this.initialized;
      },
      backend: {
        isWebGPUBackend: true,
        isWebGLBackend: false,
        device: null as object | null,
      },
      async init() {
        initCalls += 1;
        this.initialized = true;
        this.backend = {
          isWebGPUBackend: false,
          isWebGLBackend: true,
          device: null,
        };
      },
      getPixelRatio: () => 1,
    };
    const report = await probeRendererCapabilities(renderer);
    expect(initCalls).toBe(1);
    expect(report.backend).toBe("webgl2-fallback");
    expect(report.windfoil.supported).toBe(false);
    expect(report.nativeWgsl).toBe(false);
  });
});
