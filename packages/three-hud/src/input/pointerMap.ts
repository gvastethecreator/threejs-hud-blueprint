import type { HUD } from "../core/HUD.js";
import type { HudLayer } from "../core/HudLayer.js";
import type { ReadonlyPoint, ReadonlyRect } from "../contracts/geometry.js";
import { convertPoint, type TaggedPoint } from "../viewport/coordinateSpaces.js";
import { resolveLayerViewport, type LayerViewportTransform } from "../viewport/layerTransform.js";

export type PointerMapInput = Readonly<{
  clientX: number;
  clientY: number;
  canvasOrigin: ReadonlyPoint;
  viewport?: ReadonlyRect;
  dpr?: number;
  hudId?: string;
}>;

export type MappedPointer = Readonly<{
  client: TaggedPoint;
  canvas: TaggedPoint;
  viewport: TaggedPoint;
  logical: TaggedPoint;
  device: TaggedPoint;
  layer: HudLayer;
  transform: LayerViewportTransform;
}>;

export function mapPointerToLayer(
  hud: HUD,
  layer: HudLayer,
  input: PointerMapInput,
): MappedPointer {
  const viewport = input.viewport ?? {
    x: 0,
    y: 0,
    width: layer.referenceSize.width,
    height: layer.referenceSize.height,
  };
  const transform = resolveLayerViewport({
    referenceSize: layer.referenceSize,
    viewport,
    mode: layer.scaleMode,
    zoom: layer.zoom,
    zoomAnchor: layer.zoomAnchor,
    dpr: input.dpr ?? 1,
    safeInsets: layer.safeInsets,
    pixelSnap: layer.pixelSnap,
    integerDownscale: layer.integerDownscale,
  });
  const context = {
    transform,
    canvasOrigin: input.canvasOrigin,
    layerId: layer.id,
    ...(input.hudId !== undefined ? { hudId: input.hudId } : {}),
  };
  const client: TaggedPoint = {
    space: "client",
    x: input.clientX,
    y: input.clientY,
    layerId: layer.id,
    ...(input.hudId !== undefined ? { hudId: input.hudId } : {}),
  };
  return {
    client,
    canvas: convertPoint(client, "canvas", context),
    viewport: convertPoint(client, "viewport", context),
    logical: convertPoint(client, "logical", context),
    device: convertPoint(client, "device", context),
    layer,
    transform,
  };
}

export function pickLayerAt(hud: HUD, logicalY: number): HudLayer | null {
  for (let index = hud.layers.length - 1; index >= 0; index -= 1) {
    const layer = hud.layers[index];
    if (!layer || !layer.enabled) continue;
    void logicalY;
    return layer;
  }
  return null;
}
