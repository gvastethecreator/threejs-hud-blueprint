import { HudError } from "../contracts/errors.js";
import type {
  HudScaleMode,
  IntegerDownscalePolicy,
  ReadonlyInsets,
  ReadonlyPoint,
  ReadonlyRect,
  ReadonlySize,
} from "../contracts/geometry.js";
import { assertFinitePositiveSize, zeroInsets } from "../contracts/geometry.js";

export type { IntegerDownscalePolicy };

export type ResolveViewportInput = Readonly<{
  referenceSize: ReadonlySize;
  viewport: ReadonlyRect;
  mode: HudScaleMode;
  zoom?: number;
  dpr?: number;
  safeInsets?: ReadonlyInsets;
  pixelSnap?: boolean;
  integerDownscale?: IntegerDownscalePolicy;
  zoomAnchor?: ReadonlyPoint;
}>;

export type ResolvedViewport = Readonly<{
  mode: HudScaleMode;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
  dpr: number;
  logicalVisibleRect: ReadonlyRect;
  deviceViewport: ReadonlyRect;
  safeInsets: ReadonlyInsets;
  crisp: boolean;
  integerDownscale: IntegerDownscalePolicy | null;
  pixelSnap: boolean;
  zoomAnchor: ReadonlyPoint;
}>;

export function resolveViewport(input: ResolveViewportInput): ResolvedViewport {
  assertFinitePositiveSize(input.referenceSize, "referenceSize");
  assertFinitePositiveSize(
    { width: input.viewport.width, height: input.viewport.height },
    "viewport",
  );
  const zoom = finitePositive(input.zoom ?? 1, "zoom");
  const dpr = finitePositive(input.dpr ?? 1, "dpr");
  const rawX = input.viewport.width / input.referenceSize.width;
  const rawY = input.viewport.height / input.referenceSize.height;
  let scaleX = rawX;
  let scaleY = rawY;

  switch (input.mode) {
    case "contain": {
      const scale = Math.min(rawX, rawY) * zoom;
      scaleX = scaleY = scale;
      break;
    }
    case "cover": {
      const scale = Math.max(rawX, rawY) * zoom;
      scaleX = scaleY = scale;
      break;
    }
    case "native":
      scaleX = scaleY = zoom;
      break;
    case "integer": {
      const integer = resolveIntegerScale(
        Math.min(rawX, rawY) * zoom,
        input.integerDownscale ?? "overflow-1x",
      );
      scaleX = scaleY = integer.scale;
      break;
    }
    case "stretch":
      scaleX = rawX * zoom;
      scaleY = rawY * zoom;
      break;
  }

  const contentWidth = input.referenceSize.width * scaleX;
  const contentHeight = input.referenceSize.height * scaleY;
  const zoomAnchor = Object.freeze({
    x: clamp01(input.zoomAnchor?.x ?? 0.5),
    y: clamp01(input.zoomAnchor?.y ?? 0.5),
  });
  let offsetX = input.viewport.x + (input.viewport.width - contentWidth) * zoomAnchor.x;
  let offsetY = input.viewport.y + (input.viewport.height - contentHeight) * zoomAnchor.y;
  const pixelSnap = input.pixelSnap === true;
  if (pixelSnap) {
    offsetX = snapCssToDevicePixel(offsetX, dpr);
    offsetY = snapCssToDevicePixel(offsetY, dpr);
  }
  const logicalVisibleRect = {
    x: (input.viewport.x - offsetX) / scaleX,
    y: (input.viewport.y - offsetY) / scaleY,
    width: input.viewport.width / scaleX,
    height: input.viewport.height / scaleY,
  };

  return Object.freeze({
    mode: input.mode,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    zoom,
    dpr,
    logicalVisibleRect,
    deviceViewport: {
      x: input.viewport.x * dpr,
      y: input.viewport.y * dpr,
      width: input.viewport.width * dpr,
      height: input.viewport.height * dpr,
    },
    safeInsets: Object.freeze({ ...(input.safeInsets ?? zeroInsets()) }),
    crisp:
      input.mode === "integer"
        ? Number.isInteger(scaleX) && Number.isInteger(scaleY)
        : input.mode !== "stretch",
    integerDownscale: input.mode === "integer" ? (input.integerDownscale ?? "overflow-1x") : null,
    pixelSnap,
    zoomAnchor,
  });
}

export function logicalToCss(point: ReadonlyPoint, viewport: ResolvedViewport): ReadonlyPoint {
  return {
    x: viewport.offsetX + point.x * viewport.scaleX,
    y: viewport.offsetY + point.y * viewport.scaleY,
  };
}

export function cssToLogical(point: ReadonlyPoint, viewport: ResolvedViewport): ReadonlyPoint {
  return {
    x: (point.x - viewport.offsetX) / viewport.scaleX,
    y: (point.y - viewport.offsetY) / viewport.scaleY,
  };
}

export function snapLogicalToDevicePixel(value: number, scale: number, dpr: number): number {
  if (![value, scale, dpr].every(Number.isFinite) || scale <= 0 || dpr <= 0) {
    throw new RangeError("value, scale, and dpr must be finite; scale and dpr must be positive.");
  }
  return Math.round(value * scale * dpr) / (scale * dpr);
}

export function snapCssToDevicePixel(value: number, dpr: number): number {
  if (![value, dpr].every(Number.isFinite) || dpr <= 0) {
    throw new RangeError("value and dpr must be finite; dpr must be positive.");
  }
  return Math.round(value * dpr) / dpr;
}

export function resolveIntegerScale(
  fit: number,
  policy: IntegerDownscalePolicy = "overflow-1x",
): Readonly<{ scale: number; crisp: boolean; policy: IntegerDownscalePolicy }> {
  if (!Number.isFinite(fit) || fit <= 0) {
    throw new HudError("INVALID_ARGUMENT", "Integer scale fit must be a finite positive number.", {
      fit: Number.isNaN(fit) ? "NaN" : String(fit),
    });
  }
  if (fit >= 1) {
    const scale = Math.max(1, Math.floor(fit));
    return Object.freeze({ scale, crisp: true, policy });
  }
  switch (policy) {
    case "overflow-1x":
      return Object.freeze({ scale: 1, crisp: true, policy });
    case "explicit-fractional":
      return Object.freeze({ scale: fit, crisp: false, policy });
    case "disable":
      throw new HudError(
        "FEATURE_UNAVAILABLE",
        "Integer scale is unavailable because the viewport is smaller than the reference.",
        {
          policy,
          fit,
        },
      );
  }
}

function finitePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0)
    throw new RangeError(`${label} must be finite and positive.`);
  return value;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}
