import type { TextBackendCapabilities } from "../contracts/capabilities.js";
import type { ReadonlyRect } from "../contracts/geometry.js";

export type FontRenderMode = "auto" | "analytic" | "sdf" | "bitmap";
export type PixelFontRenderIntent = "crisp-bitmap" | "smooth-outline";
export type FontStyle = "normal" | "italic" | "oblique";

export type PreprocessedFontAsset = Readonly<{
  kind: "preprocessed";
  format: "windfoil" | "sdf" | "bitmap";
  hash?: string;
}>;

export type FontSource = string | URL | ArrayBuffer | Uint8Array | PreprocessedFontAsset;

export type FontLicenseRecord = Readonly<{
  family: string;
  sourceUrl: string;
  sourceRevision?: string;
  licenseId: string;
  licenseFile?: string;
  copyright?: string;
  author?: string;
  notice?: string;
  redistributionAllowed: boolean;
  modificationAllowed?: boolean;
  attribution?: string;
  fileSha256?: string;
}>;

export type PixelFontPolicy = Readonly<{
  nativePixelSize: number;
  allowedSizes?: readonly number[];
  allowedMultipliers?: readonly number[];
  requireIntegerScale: boolean;
  mode: PixelFontRenderIntent;
}>;

export type FontMetadata = Readonly<{
  family: string;
  style: FontStyle;
  weight: number;
  stretch: number;
  unitsPerEm: number;
  pixelPolicy?: PixelFontPolicy;
  fallbacks?: readonly string[];
  preferredBackends?: readonly FontRenderMode[];
  requiredBackend?: FontRenderMode;
}>;

export type FontRegistration = Readonly<{
  id: string;
  source: FontSource;
  cacheKey?: string;
  family?: string;
  style?: FontStyle;
  weight?: number;
  stretch?: number;
  unitsPerEm?: number;
  renderMode?: FontRenderMode;
  pixelPolicy?: PixelFontPolicy;
  fallbacks?: readonly string[];
  preferredBackends?: readonly FontRenderMode[];
  requiredBackend?: FontRenderMode;
  license?: FontLicenseRecord;
}>;

export type GlyphPlacement = Readonly<{
  glyphId: number;
  glyphKey: string;
  cluster: number;
  x: number;
  y: number;
  advance: number;
  advanceX: number;
  advanceY: number;
  offsetX: number;
  offsetY: number;
  line: number;
}>;

export type GlyphLine = Readonly<{
  startGlyph: number;
  glyphCount: number;
  baselineY: number;
  width: number;
  bounds: ReadonlyRect;
}>;

export type GlyphRun = Readonly<{
  fontId: string;
  fontSize: number;
  text: string;
  glyphs: readonly GlyphPlacement[];
  lines: readonly GlyphLine[];
  bounds: ReadonlyRect;
  direction: "ltr";
}>;

export type TextBackendDecisionStatus = "ready" | "experimental" | "unsupported" | "unavailable";

export type TextBackendDecision = Readonly<{
  status: TextBackendDecisionStatus;
  backendId: string;
  reasons: readonly string[];
}>;

export type TextBackendRequest = Readonly<{
  rendererKind: "webgl" | "webgpu";
  pixelPerfect?: boolean;
  allowExperimental?: boolean;
}>;

export interface TextBackend {
  readonly id: string;
  readonly capabilities: TextBackendCapabilities;
  prepare(run: GlyphRun): unknown | Promise<unknown>;
  update(prepared: unknown, run: GlyphRun): void | Promise<void>;
  disposePrepared(prepared: unknown): void;
  dispose(): void;
}

export function createGlyphRun(
  partial: Partial<GlyphRun> & Pick<GlyphRun, "fontId" | "text">,
): GlyphRun {
  const glyphs = partial.glyphs ?? [];
  return freezeGlyphRun({
    fontId: partial.fontId,
    fontSize: partial.fontSize ?? 16,
    text: partial.text,
    glyphs,
    lines:
      partial.lines ??
      Object.freeze([
        {
          startGlyph: 0,
          glyphCount: glyphs.length,
          baselineY: 0,
          width: partial.bounds?.width ?? 0,
          bounds: partial.bounds ?? { x: 0, y: 0, width: 0, height: 0 },
        },
      ]),
    bounds: partial.bounds ?? { x: 0, y: 0, width: 0, height: 0 },
    direction: "ltr",
  });
}

export function freezeGlyphRun(run: GlyphRun): GlyphRun {
  return Object.freeze({
    ...run,
    glyphs: Object.freeze(run.glyphs.map((glyph) => Object.freeze({ ...glyph }))),
    lines: Object.freeze(
      run.lines.map((line) =>
        Object.freeze({ ...line, bounds: Object.freeze({ ...line.bounds }) }),
      ),
    ),
    bounds: Object.freeze({ ...run.bounds }),
  });
}

export function selectTextBackend(
  capabilities: TextBackendCapabilities,
  request: TextBackendRequest,
): TextBackendDecision {
  const reasons: string[] = [];
  if (!capabilities.rendererKinds.includes(request.rendererKind)) {
    reasons.push(`renderer ${request.rendererKind} is not supported`);
  }
  if (request.pixelPerfect === true && !capabilities.pixelPerfect) {
    reasons.push("pixel-perfect output is not supported");
  }
  if (capabilities.status === "blocked" || capabilities.status === "planned") {
    return Object.freeze({
      status: "unavailable",
      backendId: capabilities.id,
      reasons: Object.freeze(reasons.concat([`backend status is ${capabilities.status}`])),
    });
  }
  if (reasons.length) {
    return Object.freeze({
      status: "unsupported",
      backendId: capabilities.id,
      reasons: Object.freeze(reasons),
    });
  }
  if (capabilities.status === "experimental") {
    if (request.allowExperimental === true) {
      return Object.freeze({
        status: "experimental",
        backendId: capabilities.id,
        reasons: Object.freeze([]),
      });
    }
    return Object.freeze({
      status: "unsupported",
      backendId: capabilities.id,
      reasons: Object.freeze(["experimental backend is not permitted"]),
    });
  }
  return Object.freeze({ status: "ready", backendId: capabilities.id, reasons: Object.freeze([]) });
}

export function isPreprocessedFontAsset(source: FontSource): source is PreprocessedFontAsset {
  return (
    typeof source === "object" &&
    source !== null &&
    "kind" in source &&
    source.kind === "preprocessed"
  );
}

export function fontCacheKey(
  registration: Pick<FontRegistration, "id" | "cacheKey" | "source">,
): string {
  if (registration.cacheKey !== undefined && registration.cacheKey.length > 0)
    return registration.cacheKey;
  const { source } = registration;
  if (typeof source === "string") return `url:${source}`;
  if (source instanceof URL) return `url:${source.href}`;
  if (isPreprocessedFontAsset(source))
    return `preprocessed:${source.format}:${source.hash ?? registration.id}`;
  return `id:${registration.id}`;
}

export function resolveFontMetadata(registration: FontRegistration): FontMetadata {
  const preferredBackends =
    registration.preferredBackends ??
    (registration.renderMode ? [registration.renderMode] : undefined);
  return Object.freeze({
    family: registration.family ?? registration.id,
    style: registration.style ?? "normal",
    weight: registration.weight ?? 400,
    stretch: registration.stretch ?? 100,
    unitsPerEm: registration.unitsPerEm ?? 1000,
    ...(registration.pixelPolicy ? { pixelPolicy: registration.pixelPolicy } : {}),
    ...(registration.fallbacks ? { fallbacks: registration.fallbacks } : {}),
    ...(preferredBackends ? { preferredBackends } : {}),
    ...(registration.requiredBackend ? { requiredBackend: registration.requiredBackend } : {}),
  });
}
