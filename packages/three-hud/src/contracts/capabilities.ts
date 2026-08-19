export type HudRendererKind = "webgl" | "webgpu";

export type ProbedRendererKind = HudRendererKind | "unknown";

export type HudActiveBackend = "webgl" | "webgpu" | "webgl2-fallback" | "pending" | "unavailable";

export type RendererCapabilityStatus = "ready" | "pending" | "unsupported" | "unavailable";

export type CapabilityReasonCode =
  | "RENDERER_UNAVAILABLE"
  | "RENDERER_KIND_UNKNOWN"
  | "RENDERER_UNINITIALIZED"
  | "WEBGPU_INIT_REQUIRED"
  | "WEBGL2_FALLBACK"
  | "WINDFOIL_WEBGL2_FALLBACK"
  | "WINDFOIL_RENDERER_UNINITIALIZED"
  | "WINDFOIL_NATIVE_WGSL_UNAVAILABLE"
  | "WINDFOIL_STORAGE_BUFFERS_UNAVAILABLE"
  | "WINDFOIL_RENDERER_UNAVAILABLE"
  | "WINDFOIL_RENDERER_KIND_UNSUPPORTED";

export type CapabilityReason = Readonly<{
  code: CapabilityReasonCode;
  message: string;
}>;

export type FeatureSupport = Readonly<{
  supported: boolean;
  status: RendererCapabilityStatus;
  reasons: readonly CapabilityReason[];
}>;

export const RENDERER_CAPABILITY_REPORT_SCHEMA = "three-hud/renderer-capability/v0" as const;

export type RendererCapabilityReport = Readonly<{
  schemaVersion: typeof RENDERER_CAPABILITY_REPORT_SCHEMA;
  kind: ProbedRendererKind;
  backend: HudActiveBackend;
  initialized: boolean;
  status: RendererCapabilityStatus;
  storageBuffers: boolean;
  nativeWgsl: boolean;
  instancing: boolean;
  derivatives: boolean;
  maxTextureSize: number | null;
  dpr: number | null;
  timestampQueries: boolean;
  windfoil: FeatureSupport;
  reasons: readonly CapabilityReason[];
}>;

export type ProbeRendererOptions = Readonly<{
  initialize?: boolean;
}>;

export type RendererCapabilities = Readonly<{
  kind: HudRendererKind;
  storageBuffers: boolean;
  timestampQueries: boolean;
  deviceLossRecovery: boolean;
  maxTextureSize?: number;
}>;

export type TextBackendCapabilities = Readonly<{
  id: string;
  rendererKinds: readonly HudRendererKind[];
  scalableCoverage: boolean;
  pixelPerfect: boolean;
  dynamicGlyphs: boolean;
  colorGlyphs: boolean;
  rotation: "none" | "bounded" | "full";
  deviceLossRecovery: boolean;
  status: "planned" | "experimental" | "supported" | "blocked";
}>;
