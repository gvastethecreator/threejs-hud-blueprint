import { collectHitOrder } from "../core/order.js";
import type { HudNode, PointerEventsPolicy } from "../core/HudNode.js";
import { effectiveClip } from "../render/clip.js";

export function hitTest(root: HudNode, x: number, y: number): HudNode | null {
  const order = collectHitOrder(root);
  for (const node of order) {
    if (!isEligible(node, x, y, order)) continue;
    return node;
  }
  return null;
}

export function isEligible(
  node: HudNode,
  x: number,
  y: number,
  order: readonly HudNode[] = collectHitOrder(node),
): boolean {
  if (!node.effectiveVisible() || node.debugOverlay) return false;
  if (node.pointerEvents === "none") return false;
  if (node.pointerEvents === "box-none") return false;
  if (blockedByAncestor(node)) return false;
  const bounds = node.worldBounds();
  if (x < bounds.x || y < bounds.y || x >= bounds.x + bounds.width || y >= bounds.y + bounds.height)
    return false;
  const clip = effectiveClip(node);
  if (clip && (x < clip.x || y < clip.y || x >= clip.x + clip.width || y >= clip.y + clip.height))
    return false;
  void order;
  return true;
}

function blockedByAncestor(node: HudNode): boolean {
  for (let current = node.parent; current; current = current.parent) {
    const policy: PointerEventsPolicy = current.pointerEvents;
    if (policy === "none" || policy === "box-only") return true;
  }
  return false;
}
