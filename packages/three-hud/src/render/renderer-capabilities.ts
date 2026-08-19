import {
  RENDERER_CAPABILITY_REPORT_SCHEMA,
  type CapabilityReason,
  type CapabilityReasonCode,
  type FeatureSupport,
  type HudActiveBackend,
  type ProbeRendererOptions,
  type ProbedRendererKind,
  type RendererCapabilityReport,
  type RendererCapabilityStatus,
} from "../contracts/capabilities.js";

export type { ProbeRendererOptions, RendererCapabilityReport };

export async function probeRendererCapabilities(
  renderer: unknown,
  options: ProbeRendererOptions = {},
): Promise<RendererCapabilityReport> {
  if (!isObject(renderer)) {
    return createReport({
      kind: "unknown",
      backend: "unavailable",
      initialized: false,
      status: "unavailable",
      storageBuffers: false,
      nativeWgsl: false,
      instancing: false,
      derivatives: false,
      maxTextureSize: null,
      dpr: null,
      timestampQueries: false,
      windfoil: featureSupport(false, "unavailable", [
        capabilityReason("WINDFOIL_RENDERER_UNAVAILABLE", "No host renderer was supplied."),
      ]),
      reasons: [capabilityReason("RENDERER_UNAVAILABLE", "No host renderer was supplied.")],
    });
  }

  const initialize = options.initialize !== false;
  if (initialize) await initializeIfNeeded(renderer);

  const kind = readKind(renderer);
  if (kind === "unknown") {
    return createReport({
      kind: "unknown",
      backend: "unavailable",
      initialized: false,
      status: "unavailable",
      storageBuffers: false,
      nativeWgsl: false,
      instancing: false,
      derivatives: false,
      maxTextureSize: null,
      dpr: null,
      timestampQueries: false,
      windfoil: featureSupport(false, "unavailable", [
        capabilityReason(
          "WINDFOIL_RENDERER_UNAVAILABLE",
          "The supplied object is not a WebGLRenderer or WebGPURenderer.",
        ),
      ]),
      reasons: [
        capabilityReason(
          "RENDERER_KIND_UNKNOWN",
          "The supplied object is not a WebGLRenderer or WebGPURenderer.",
        ),
      ],
    });
  }

  const initialized = readInitialized(renderer, kind);
  const backend = readBackend(renderer, kind, initialized);
  const nativeWebgpu = backend === "webgpu" && initialized;
  const webgl2 = kind === "webgl" || backend === "webgl2-fallback";
  const storageBuffers = nativeWebgpu && hasStorageBuffers(renderer);
  const nativeWgsl = nativeWebgpu;
  const instancing = nativeWebgpu || webgl2 || hasExtension(renderer, "ANGLE_instanced_arrays");
  const derivatives = nativeWebgpu || webgl2 || hasExtension(renderer, "OES_standard_derivatives");
  const maxTextureSize = initialized ? readMaxTextureSize(renderer) : null;
  const dpr = readDpr(renderer);
  const timestampQueries =
    initialized && nativeWebgpu && hasNamedFeature(renderer, "timestamp-query");
  const reasons = listRendererReasons(kind, backend, initialized);
  const windfoil = resolveWindfoil({ kind, backend, initialized, storageBuffers, nativeWgsl });
  const status = resolveStatus(backend, initialized);

  return createReport({
    kind,
    backend,
    initialized,
    status,
    storageBuffers,
    nativeWgsl,
    instancing: initialized && instancing,
    derivatives: initialized && derivatives,
    maxTextureSize,
    dpr,
    timestampQueries,
    windfoil,
    reasons,
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readFlag(value: Record<string, unknown>, key: string): boolean {
  return value[key] === true;
}

function readKind(renderer: Record<string, unknown>): ProbedRendererKind {
  if (readFlag(renderer, "isWebGLRenderer")) return "webgl";
  if (readFlag(renderer, "isWebGPURenderer")) return "webgpu";
  return "unknown";
}

function readBackendRecord(renderer: Record<string, unknown>): Record<string, unknown> | null {
  const backend = renderer["backend"];
  return isObject(backend) ? backend : null;
}

function readInitialized(renderer: Record<string, unknown>, kind: ProbedRendererKind): boolean {
  const hasInitialized = renderer["hasInitialized"];
  if (typeof hasInitialized === "function") return hasInitialized.call(renderer) === true;
  if (renderer["initialized"] === true) return true;
  if (kind === "webgl") return true;
  const backend = readBackendRecord(renderer);
  return isObject(backend?.["device"] ?? null);
}

async function initializeIfNeeded(renderer: Record<string, unknown>): Promise<void> {
  if (!readFlag(renderer, "isWebGPURenderer")) return;
  if (readInitialized(renderer, "webgpu")) return;
  const init = renderer["init"];
  if (typeof init !== "function") return;
  await init.call(renderer);
}

function readBackend(
  renderer: Record<string, unknown>,
  kind: ProbedRendererKind,
  initialized: boolean,
): HudActiveBackend {
  const backend = readBackendRecord(renderer);
  if (kind === "webgl") return "webgl";
  if (kind !== "webgpu") return "unavailable";
  if (backend && readFlag(backend, "isWebGLBackend")) return "webgl2-fallback";
  if (backend && readFlag(backend, "isWebGPUBackend")) return initialized ? "webgpu" : "pending";
  return initialized ? "unavailable" : "pending";
}

function hasStorageBuffers(renderer: Record<string, unknown>): boolean {
  const backend = readBackendRecord(renderer);
  const device = backend ? backend["device"] : null;
  if (!isObject(device)) return false;
  const limits = device["limits"];
  if (!isObject(limits)) return true;
  const maxStorage = limits["maxStorageBufferBindingSize"];
  if (typeof maxStorage !== "number" || !Number.isFinite(maxStorage)) return true;
  return maxStorage > 0;
}

function hasExtension(renderer: Record<string, unknown>, name: string): boolean {
  const collections = [renderer["extensions"], readBackendRecord(renderer)?.["extensions"]];
  for (const collection of collections) {
    if (!isObject(collection)) continue;
    const has = collection["has"];
    if (typeof has === "function" && has.call(collection, name) === true) return true;
  }
  return false;
}

function hasNamedFeature(renderer: Record<string, unknown>, name: string): boolean {
  const hasFeature = renderer["hasFeature"];
  if (typeof hasFeature === "function") {
    try {
      if (hasFeature.call(renderer, name) === true) return true;
    } catch {
      return false;
    }
  }
  const backend = readBackendRecord(renderer);
  const device = backend ? backend["device"] : null;
  if (!isObject(device)) return false;
  const features = device["features"];
  if (!isObject(features)) return false;
  const has = features["has"];
  return typeof has === "function" && has.call(features, name) === true;
}

function readMaxTextureSize(renderer: Record<string, unknown>): number | null {
  const capabilities = renderer["capabilities"];
  if (isObject(capabilities)) {
    const fromCapabilities = finitePositive(capabilities["maxTextureSize"]);
    if (fromCapabilities !== null) return fromCapabilities;
  }
  const backend = readBackendRecord(renderer);
  const device = backend ? backend["device"] : null;
  if (isObject(device)) {
    const limits = device["limits"];
    if (isObject(limits)) {
      const fromLimits = finitePositive(limits["maxTextureDimension2D"]);
      if (fromLimits !== null) return fromLimits;
    }
  }
  const getContext = renderer["getContext"];
  if (typeof getContext !== "function") return null;
  const context = getContext.call(renderer);
  if (!isObject(context) || typeof context["getParameter"] !== "function") return null;
  const pname = finitePositive(context["MAX_TEXTURE_SIZE"]);
  if (pname === null) return null;
  return finitePositive(context["getParameter"](pname));
}

function readDpr(renderer: Record<string, unknown>): number | null {
  const getPixelRatio = renderer["getPixelRatio"];
  if (typeof getPixelRatio === "function") return finitePositive(getPixelRatio.call(renderer));
  return finitePositive(renderer["pixelRatio"]);
}

function finitePositive(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function listRendererReasons(
  kind: ProbedRendererKind,
  backend: HudActiveBackend,
  initialized: boolean,
): readonly CapabilityReason[] {
  const reasons: CapabilityReason[] = [];
  if (backend === "webgl2-fallback") {
    reasons.push(
      capabilityReason(
        "WEBGL2_FALLBACK",
        "This WebGPURenderer is using its WebGL 2 fallback. isWebGPURenderer is not proof of a native WebGPU backend.",
      ),
    );
  }
  if (!initialized) {
    reasons.push(
      capabilityReason("RENDERER_UNINITIALIZED", "The renderer has not finished initialization."),
    );
    if (kind === "webgpu") {
      reasons.push(
        capabilityReason(
          "WEBGPU_INIT_REQUIRED",
          "Call await renderer.init() before resolving WebGPU capabilities.",
        ),
      );
    }
  }
  return reasons;
}

function resolveWindfoil(input: {
  kind: ProbedRendererKind;
  backend: HudActiveBackend;
  initialized: boolean;
  storageBuffers: boolean;
  nativeWgsl: boolean;
}): FeatureSupport {
  if (input.kind === "webgl") {
    return featureSupport(false, "unsupported", [
      capabilityReason(
        "WINDFOIL_RENDERER_KIND_UNSUPPORTED",
        "Windfoil requires a native WebGPU backend, not WebGLRenderer.",
      ),
    ]);
  }
  if (input.backend === "webgl2-fallback") {
    return featureSupport(false, "unsupported", [
      capabilityReason(
        "WINDFOIL_WEBGL2_FALLBACK",
        "Windfoil is not available on a WebGPURenderer that is running its WebGL 2 fallback.",
      ),
    ]);
  }
  if (!input.initialized || input.backend === "pending") {
    return featureSupport(false, "pending", [
      capabilityReason(
        "WINDFOIL_RENDERER_UNINITIALIZED",
        "Windfoil cannot be claimed until the WebGPURenderer is initialized and the active backend is known.",
      ),
    ]);
  }
  const reasons: CapabilityReason[] = [];
  if (!input.nativeWgsl) {
    reasons.push(
      capabilityReason(
        "WINDFOIL_NATIVE_WGSL_UNAVAILABLE",
        "Windfoil requires native WGSL on the active backend.",
      ),
    );
  }
  if (!input.storageBuffers) {
    reasons.push(
      capabilityReason(
        "WINDFOIL_STORAGE_BUFFERS_UNAVAILABLE",
        "Windfoil requires storage buffers on the active GPU device.",
      ),
    );
  }
  if (reasons.length > 0) return featureSupport(false, "unsupported", reasons);
  return featureSupport(true, "ready", []);
}

function resolveStatus(backend: HudActiveBackend, initialized: boolean): RendererCapabilityStatus {
  if (backend === "unavailable") return "unavailable";
  if (!initialized || backend === "pending") return "pending";
  return "ready";
}

function capabilityReason(code: CapabilityReasonCode, message: string): CapabilityReason {
  return Object.freeze({ code, message });
}

function featureSupport(
  supported: boolean,
  status: RendererCapabilityStatus,
  reasons: readonly CapabilityReason[],
): FeatureSupport {
  return Object.freeze({
    supported,
    status,
    reasons: Object.freeze([...reasons]),
  });
}

function createReport(
  report: Omit<RendererCapabilityReport, "schemaVersion">,
): RendererCapabilityReport {
  return Object.freeze({
    schemaVersion: RENDERER_CAPABILITY_REPORT_SCHEMA,
    kind: report.kind,
    backend: report.backend,
    initialized: report.initialized,
    status: report.status,
    storageBuffers: report.storageBuffers,
    nativeWgsl: report.nativeWgsl,
    instancing: report.instancing,
    derivatives: report.derivatives,
    maxTextureSize: report.maxTextureSize,
    dpr: report.dpr,
    timestampQueries: report.timestampQueries,
    windfoil: report.windfoil,
    reasons: Object.freeze([...report.reasons]),
  });
}
