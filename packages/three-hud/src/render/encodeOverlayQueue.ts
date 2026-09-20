import { collectPaintOrder } from "../core/order.js";
import type { HudLayer } from "../core/HudLayer.js";
import type { HudNode } from "../core/HudNode.js";
import { composeBatchKey, type GlyphQuad, type ShapeParams } from "./commands.js";
import { effectiveClip, intersectRects } from "./clip.js";
import { RenderQueue } from "./renderQueue.js";
import type { OverlayRendererProfile } from "./overlayProfile.js";
import { atlasUv } from "../text/asciiAtlas.js";
import type { LayoutTextResult } from "../text/layoutText.js";

export function encodeOverlayQueue(
  layers: readonly HudLayer[],
  profile: OverlayRendererProfile,
): RenderQueue {
  const queue = new RenderQueue();
  for (const layer of layers) {
    if (!layer.enabled) continue;
    for (const node of collectPaintOrder(layer)) {
      if (node.size.width <= 0 || node.size.height <= 0) continue;
      if (node.effectiveOpacity() <= 0) continue;
      const record = node as { primitive?: string };
      if (record.primitive === undefined && node.fill === 0x000000 && node.children.length > 0) {
        continue;
      }
      const clip = effectiveClip(node);
      const visible = intersectRects(node.worldBounds(), clip ?? node.worldBounds());
      if (!visible) continue;
      const text = asText(node);
      if (text) {
        const glyphs = glyphQuads(text, node.worldBounds());
        if (glyphs.length === 0) continue;
        const draft = {
          kind: "text" as const,
          layerOrder: layer.order,
          zIndex: node.zIndex,
          sequence: node.renderSeq >= 0 ? node.renderSeq : node.insertionSeq,
          opacity: node.effectiveOpacity(),
          clip,
          blend: node.blend,
          sourceNodeId: node.id,
          rendererProfile: profile,
          bounds: node.worldBounds(),
          resource: { kind: "atlas" as const, id: "ascii-5x7" },
          glyphCount: glyphs.length,
          fill: text.color,
          text: text.text,
          fontId: text.layout.run.fontId,
          glyphs,
        };
        queue.push({ ...draft, batchKey: composeBatchKey(draft) });
        continue;
      }
      const image = asImage(node);
      if (image) {
        if (!image.texture?.ready) continue;
        const slices = image.sliceRects?.() ?? [node.worldBounds()];
        for (const bounds of slices) {
          if (bounds.width <= 0 || bounds.height <= 0) continue;
          const draft = {
            kind: "image" as const,
            layerOrder: layer.order,
            zIndex: node.zIndex,
            sequence: node.renderSeq >= 0 ? node.renderSeq : node.insertionSeq,
            opacity: node.effectiveOpacity(),
            clip,
            blend: node.blend,
            sourceNodeId: node.id,
            rendererProfile: profile,
            bounds,
            resource: {
              kind: "texture" as const,
              id: `${image.texture.id}:${image.texture.filter}`,
            },
            tint: image.tint,
            uv: image.uv,
          };
          queue.push({ ...draft, batchKey: composeBatchKey(draft) });
        }
        continue;
      }
      const bounds = node.worldBounds();
      const shape = shapeOf(node as { primitive?: string });
      const params = shapeParams(node);
      const draft = {
        kind: "shape" as const,
        shape,
        layerOrder: layer.order,
        zIndex: node.zIndex,
        sequence: node.renderSeq >= 0 ? node.renderSeq : node.insertionSeq,
        opacity: node.effectiveOpacity(),
        clip,
        blend: node.blend,
        sourceNodeId: node.id,
        rendererProfile: profile,
        bounds,
        fill: node.fill,
        ...(params !== undefined ? { shapeParams: params } : {}),
      };
      queue.push({ ...draft, batchKey: composeBatchKey(draft) });
    }
  }
  return queue;
}

function shapeOf(node: { primitive?: string }): "rect" | "rounded-rect" | "line" | "ring" {
  if (node.primitive === "rounded-rect" || node.primitive === "line" || node.primitive === "ring")
    return node.primitive;
  return "rect";
}

function shapeParams(node: unknown): ShapeParams | undefined {
  if (typeof node !== "object" || node === null) return undefined;
  const record = node as {
    primitive?: string;
    radius?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    strokeWidth?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    sweep?: number;
    progressSweep?: () => number;
    parent?: HudNode | null;
    position?: { x: number; y: number };
  };
  if (record.primitive === "rounded-rect" && typeof record.radius === "number") {
    return { radius: record.radius };
  }
  if (record.primitive === "line") {
    const line = record as HudNode;
    const parent = line.parent;
    const x1 = numberOr(record.x1, 0);
    const y1 = numberOr(record.y1, 0);
    const x2 = numberOr(record.x2, 0);
    const y2 = numberOr(record.y2, 0);
    const start = parent ? parent.localToWorld(x1, y1) : { x: x1, y: y1 };
    const end = parent ? parent.localToWorld(x2, y2) : { x: x2, y: y2 };
    return {
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      strokeWidth: numberOr(record.strokeWidth, 1),
    };
  }
  if (record.primitive === "ring") {
    return {
      innerRadius: numberOr(record.innerRadius, 0),
      outerRadius: numberOr(record.outerRadius, 1),
      startAngle: numberOr(record.startAngle, 0),
      sweep:
        typeof record.progressSweep === "function"
          ? record.progressSweep()
          : numberOr(record.sweep, Math.PI * 2),
    };
  }
  return undefined;
}

function asImage(node: unknown): {
  uv: import("../contracts/geometry.js").ReadonlyRect;
  texture: { id: string; ready: boolean; filter: string } | null;
  tint: number;
  sliceRects?: () => readonly { x: number; y: number; width: number; height: number }[];
} | null {
  if (typeof node !== "object" || node === null || !("texture" in node) || !("tint" in node))
    return null;
  return node as {
    uv: import("../contracts/geometry.js").ReadonlyRect;
    texture: { id: string; ready: boolean; filter: string } | null;
    tint: number;
    sliceRects?: () => readonly { x: number; y: number; width: number; height: number }[];
  };
}

function asText(node: unknown): { color: number; layout: LayoutTextResult; text: string } | null {
  if (typeof node !== "object" || node === null) return null;
  const record = node as {
    primitive?: string;
    color?: number;
    layout?: LayoutTextResult;
    text?: string;
  };
  if (record.primitive !== "text" || !record.layout) return null;
  return {
    color: record.color ?? 0xffffff,
    layout: record.layout,
    text: typeof record.text === "string" ? record.text : "",
  };
}

function glyphQuads(
  text: { layout: LayoutTextResult },
  origin: { x: number; y: number },
): GlyphQuad[] {
  const em = Math.max(1, text.layout.run.fontSize);
  const glyphHeight = em;
  const glyphWidth = em * (5 / 7);
  const quads: GlyphQuad[] = [];
  for (const line of text.layout.run.lines) {
    const end = line.startGlyph + line.glyphCount;
    const lineTop = origin.y + line.bounds.y;
    for (let index = line.startGlyph; index < end; index += 1) {
      const glyph = text.layout.run.glyphs[index];
      if (!glyph) continue;
      const code = Number.parseInt(glyph.glyphKey, 10);
      const uv = atlasUv(Number.isFinite(code) ? code : 63);
      quads.push({
        x: origin.x + glyph.x,
        y: lineTop,
        width: glyphWidth,
        height: glyphHeight,
        u0: uv.u0,
        v0: uv.v0,
        u1: uv.u1,
        v1: uv.v1,
      });
    }
  }
  return quads;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
