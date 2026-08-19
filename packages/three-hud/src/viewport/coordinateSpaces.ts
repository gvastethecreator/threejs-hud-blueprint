import { HudError } from "../contracts/errors.js";
import type { ReadonlyPoint } from "../contracts/geometry.js";
import { cssToLogical, logicalToCss } from "./resolveViewport.js";
import type { LayerViewportTransform } from "./layerTransform.js";

export const COORDINATE_SPACES = ["client", "canvas", "viewport", "logical", "device"] as const;
export type CoordinateSpace = (typeof COORDINATE_SPACES)[number];

export type TaggedPoint = Readonly<{
  space: CoordinateSpace;
  x: number;
  y: number;
  hudId?: string;
  layerId?: string;
}>;

export type ConversionContext = Readonly<{
  transform: LayerViewportTransform;
  canvasOrigin?: ReadonlyPoint;
  hudId?: string;
  layerId?: string;
  development?: boolean;
}>;

export function convertPoint(
  point: TaggedPoint,
  to: CoordinateSpace,
  context: ConversionContext,
): TaggedPoint {
  assertIdentities(point, context);
  const canvas = toCanvas(point, context);
  const target = fromCanvas(canvas, to, context);
  return Object.freeze({
    space: to,
    x: target.x,
    y: target.y,
    ...(point.hudId !== undefined ? { hudId: point.hudId } : {}),
    ...(point.layerId !== undefined ? { layerId: point.layerId } : {}),
  });
}

function toCanvas(point: TaggedPoint, context: ConversionContext): ReadonlyPoint {
  const origin = context.canvasOrigin ?? { x: 0, y: 0 };
  switch (point.space) {
    case "client":
      return { x: point.x - origin.x, y: point.y - origin.y };
    case "canvas":
      return { x: point.x, y: point.y };
    case "viewport":
      return {
        x: point.x + context.transform.viewport.x,
        y: point.y + context.transform.viewport.y,
      };
    case "logical": {
      const css = logicalToCss({ x: point.x, y: point.y }, context.transform);
      return css;
    }
    case "device":
      return { x: point.x / context.transform.dpr, y: point.y / context.transform.dpr };
  }
}

function fromCanvas(
  canvas: ReadonlyPoint,
  to: CoordinateSpace,
  context: ConversionContext,
): ReadonlyPoint {
  const origin = context.canvasOrigin ?? { x: 0, y: 0 };
  switch (to) {
    case "client":
      return { x: canvas.x + origin.x, y: canvas.y + origin.y };
    case "canvas":
      return canvas;
    case "viewport":
      return {
        x: canvas.x - context.transform.viewport.x,
        y: canvas.y - context.transform.viewport.y,
      };
    case "logical":
      return cssToLogical(canvas, context.transform);
    case "device":
      return { x: canvas.x * context.transform.dpr, y: canvas.y * context.transform.dpr };
  }
}

function assertIdentities(point: TaggedPoint, context: ConversionContext): void {
  const development = context.development !== false;
  if (!development) return;
  if (point.hudId !== undefined && context.hudId !== undefined && point.hudId !== context.hudId) {
    throw new HudError(
      "INVALID_ARGUMENT",
      "Coordinate conversion hudId does not match the transform context.",
      {
        pointHudId: point.hudId,
        contextHudId: context.hudId,
      },
    );
  }
  if (
    point.layerId !== undefined &&
    context.layerId !== undefined &&
    point.layerId !== context.layerId
  ) {
    throw new HudError(
      "INVALID_ARGUMENT",
      "Coordinate conversion layerId does not match the transform context.",
      {
        pointLayerId: point.layerId,
        contextLayerId: context.layerId,
      },
    );
  }
}
