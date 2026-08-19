import type { HudNode } from "./HudNode.js";

/** Visual order authority. Batch keys may group adjacent commands but must not reorder this sequence. */
export const HUD_ORDER_AUTHORITY = [
  "layerOrder",
  "zIndex",
  "ancestry",
  "insertionSeq",
  "id",
] as const;

export function compareHudOrder(a: HudNode, b: HudNode): number {
  if (a === b) return 0;
  const layerDelta = layerOrderOf(a) - layerOrderOf(b);
  if (layerDelta !== 0) return layerDelta;
  if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
  const aChain = ancestry(a);
  const bChain = ancestry(b);
  const depth = Math.min(aChain.length, bChain.length);
  for (let index = 0; index < depth; index += 1) {
    const aNode = aChain[index];
    const bNode = bChain[index];
    if (aNode === undefined || bNode === undefined || aNode === bNode) continue;
    if (aNode.insertionSeq !== bNode.insertionSeq) return aNode.insertionSeq - bNode.insertionSeq;
    return aNode.id.localeCompare(bNode.id);
  }
  return aChain.length - bChain.length;
}

export function collectPaintOrder(root: HudNode): HudNode[] {
  if (isDisabledLayer(root)) return [];
  resetRenderSeq(root);
  const nodes: HudNode[] = [];
  walkVisible(root, nodes);
  nodes.sort(compareHudOrder);
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node) node.renderSeq = index;
  }
  return nodes;
}

export function collectHitOrder(root: HudNode): HudNode[] {
  const paint = collectPaintOrder(root);
  const hittable: HudNode[] = [];
  for (let index = paint.length - 1; index >= 0; index -= 1) {
    const node = paint[index];
    if (!node) continue;
    if (node.debugOverlay) continue;
    if (node.size.width > 0 && node.size.height > 0) hittable.push(node);
  }
  return hittable;
}

function walkVisible(node: HudNode, nodes: HudNode[]): void {
  if (!node.visible) return;
  nodes.push(node);
  for (const child of node.children) walkVisible(child, nodes);
}

function resetRenderSeq(node: HudNode): void {
  node.renderSeq = -1;
  for (const child of node.children) resetRenderSeq(child);
}

function ancestry(node: HudNode): HudNode[] {
  const chain: HudNode[] = [];
  for (let current: HudNode | null = node; current; current = current.parent) chain.push(current);
  chain.reverse();
  return chain;
}

function layerOrderOf(node: HudNode): number {
  for (let current: HudNode | null = node; current; current = current.parent) {
    if (isLayerLike(current)) return current.order;
  }
  return 0;
}

function isLayerLike(node: HudNode): node is HudNode & { order: number; enabled: boolean } {
  return "order" in node && "enabled" in node && "referenceSize" in node;
}

export function isDisabledLayer(node: HudNode): boolean {
  return isLayerLike(node) && node.enabled === false;
}
