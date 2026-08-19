import type { HudNode } from "../core/HudNode.js";

export function layoutNodePath(node: HudNode): string {
  const ids: string[] = [];
  for (let current: HudNode | null = node; current; current = current.parent)
    ids.unshift(current.id);
  return ids.join("/");
}
