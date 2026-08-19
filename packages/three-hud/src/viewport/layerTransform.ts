import type { HudDiagnostic } from "../contracts/diagnostics.js";
import { HudError } from "../contracts/errors.js";
import type { ReadonlyPoint, ReadonlyRect, ReadonlySize } from "../contracts/geometry.js";
import {
  cssToLogical,
  logicalToCss,
  resolveViewport,
  type ResolvedViewport,
  type ResolveViewportInput,
} from "./resolveViewport.js";

export type LayerViewportTransform = ResolvedViewport &
  Readonly<{
    referenceSize: ReadonlySize;
    viewport: ReadonlyRect;
    contentRect: ReadonlyRect;
    safeRect: ReadonlyRect;
    letterboxRects: readonly ReadonlyRect[];
  }>;

export type OrthographicCameraLike = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  updateProjectionMatrix?: () => void;
};

export function resolveLayerViewport(input: ResolveViewportInput): LayerViewportTransform {
  assertViewportInput(input);
  const resolved = resolveViewport(input);
  const contentRect = Object.freeze({
    x: resolved.offsetX,
    y: resolved.offsetY,
    width: input.referenceSize.width * resolved.scaleX,
    height: input.referenceSize.height * resolved.scaleY,
  });
  return Object.freeze({
    ...resolved,
    referenceSize: Object.freeze({ ...input.referenceSize }),
    viewport: Object.freeze({ ...input.viewport }),
    contentRect,
    safeRect: logicalSafeRect(input.referenceSize, resolved.safeInsets),
    letterboxRects: Object.freeze(letterboxRects(input.viewport, contentRect)),
  });
}

export function logicalSafeRect(
  reference: ReadonlySize,
  insets: ResolvedViewport["safeInsets"],
): ReadonlyRect {
  return Object.freeze({
    x: insets.left,
    y: insets.top,
    width: Math.max(0, reference.width - insets.left - insets.right),
    height: Math.max(0, reference.height - insets.top - insets.bottom),
  });
}

export function letterboxRects(viewport: ReadonlyRect, contentRect: ReadonlyRect): ReadonlyRect[] {
  const rects: ReadonlyRect[] = [];
  const epsilon = 1e-6;
  if (contentRect.x > viewport.x + epsilon) {
    rects.push(
      Object.freeze({
        x: viewport.x,
        y: viewport.y,
        width: contentRect.x - viewport.x,
        height: viewport.height,
      }),
    );
  }
  const right = contentRect.x + contentRect.width;
  const viewportRight = viewport.x + viewport.width;
  if (right < viewportRight - epsilon) {
    rects.push(
      Object.freeze({
        x: right,
        y: viewport.y,
        width: viewportRight - right,
        height: viewport.height,
      }),
    );
  }
  if (contentRect.y > viewport.y + epsilon) {
    rects.push(
      Object.freeze({
        x: viewport.x,
        y: viewport.y,
        width: viewport.width,
        height: contentRect.y - viewport.y,
      }),
    );
  }
  const bottom = contentRect.y + contentRect.height;
  const viewportBottom = viewport.y + viewport.height;
  if (bottom < viewportBottom - epsilon) {
    rects.push(
      Object.freeze({
        x: viewport.x,
        y: bottom,
        width: viewport.width,
        height: viewportBottom - bottom,
      }),
    );
  }
  return rects;
}

export function serializeLayerViewport(transform: LayerViewportTransform): LayerViewportTransform {
  return JSON.parse(JSON.stringify(transform)) as LayerViewportTransform;
}

export function viewportToLogical(
  point: ReadonlyPoint,
  transform: LayerViewportTransform,
): ReadonlyPoint {
  return cssToLogical(point, transform);
}

export function logicalToDevice(
  point: ReadonlyPoint,
  transform: LayerViewportTransform,
): ReadonlyPoint {
  const css = logicalToCss(point, transform);
  return {
    x: css.x * transform.dpr,
    y: css.y * transform.dpr,
  };
}

export function deviceToLogical(
  point: ReadonlyPoint,
  transform: LayerViewportTransform,
): ReadonlyPoint {
  return cssToLogical({ x: point.x / transform.dpr, y: point.y / transform.dpr }, transform);
}

export function logicalToClip(
  point: ReadonlyPoint,
  transform: LayerViewportTransform,
): ReadonlyPoint {
  const css = logicalToCss(point, transform);
  return {
    x: ((css.x - transform.viewport.x) / transform.viewport.width) * 2 - 1,
    y: 1 - ((css.y - transform.viewport.y) / transform.viewport.height) * 2,
  };
}

export function logicalSizeToClip(
  size: ReadonlySize,
  transform: LayerViewportTransform,
): ReadonlySize {
  return {
    width: ((size.width * transform.scaleX) / transform.viewport.width) * 2,
    height: ((size.height * transform.scaleY) / transform.viewport.height) * 2,
  };
}

export function stretchTextDiagnostic(transform: LayerViewportTransform): HudDiagnostic | null {
  if (transform.mode !== "stretch") return null;
  return {
    severity: "warning",
    code: "STRETCH_TEXT_RISK",
    message: "Stretch scale uses independent X/Y factors; text will not preserve aspect.",
    details: { scaleX: transform.scaleX, scaleY: transform.scaleY, mode: "stretch" },
  };
}

/** Top-left origin, +Y down, matching authored logical space. */
export function applyLayerViewportToOrthographicCamera(
  camera: OrthographicCameraLike,
  transform: LayerViewportTransform,
): void {
  camera.left = transform.viewport.x;
  camera.right = transform.viewport.x + transform.viewport.width;
  camera.top = transform.viewport.y;
  camera.bottom = transform.viewport.y + transform.viewport.height;
  camera.updateProjectionMatrix?.();
}

function assertViewportInput(input: ResolveViewportInput): void {
  assertPositiveRect(input.referenceSize.width, input.referenceSize.height, "referenceSize");
  assertPositiveRect(input.viewport.width, input.viewport.height, "viewport");
  if (input.zoom !== undefined && (!Number.isFinite(input.zoom) || input.zoom <= 0)) {
    throw new HudError("INVALID_ARGUMENT", "HUD zoom must be a finite positive number.", {
      zoom: stringifyNumber(input.zoom),
    });
  }
  if (input.dpr !== undefined && (!Number.isFinite(input.dpr) || input.dpr <= 0)) {
    throw new HudError("INVALID_ARGUMENT", "dpr must be a finite positive number.", {
      dpr: stringifyNumber(input.dpr),
    });
  }
}

function assertPositiveRect(width: number, height: number, label: string): void {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new HudError(
      "INVALID_ARGUMENT",
      `${label} must contain finite positive width and height.`,
      {
        width: stringifyNumber(width),
        height: stringifyNumber(height),
      },
    );
  }
}

function stringifyNumber(value: number): string {
  return Number.isNaN(value) ? "NaN" : String(value);
}
