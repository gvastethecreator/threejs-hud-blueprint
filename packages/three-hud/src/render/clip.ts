import type { ReadonlyRect } from "../contracts/geometry.js";
import type { HudNode } from "../core/HudNode.js";

export function intersectRects(a: ReadonlyRect, b: ReadonlyRect): ReadonlyRect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  const width = right - x;
  const height = bottom - y;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

export function effectiveClip(node: HudNode): ReadonlyRect | null {
  let clip: ReadonlyRect | null = null;
  for (let current: HudNode | null = node; current; current = current.parent) {
    if (!current.clip) continue;
    clip = clip ? intersectRects(clip, current.clip) : current.clip;
    if (!clip) return null;
  }
  return clip;
}
