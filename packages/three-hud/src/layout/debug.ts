import { HudNode } from "../core/HudNode.js";
import { getLayoutBox } from "./box.js";

export type LayoutDebugKind = "measured" | "resolved" | "content" | "clip";

export function createLayoutDebugOverlays(node: HudNode): HudNode[] {
  const box = getLayoutBox(node);
  if (!box) return [];
  const overlays: HudNode[] = [];
  const kinds: {
    kind: LayoutDebugKind;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: number;
  }[] = [
    {
      kind: "resolved",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      fill: 0x44ff8800,
    },
    {
      kind: "content",
      x: box.contentX,
      y: box.contentY,
      width: box.contentWidth,
      height: box.contentHeight,
      fill: 0x4488ff00,
    },
  ];
  if (box.clip) {
    kinds.push({
      kind: "clip",
      x: box.clip.x,
      y: box.clip.y,
      width: box.clip.width,
      height: box.clip.height,
      fill: 0x44ff0044,
    });
  }
  for (const spec of kinds) {
    const overlay = node.add(
      new HudNode({
        id: `${node.id}-debug-${spec.kind}`,
        width: spec.width,
        height: spec.height,
        fill: spec.fill,
        debugOverlay: true,
        pointerEvents: "none",
      }),
    );
    overlay.setPosition(spec.x - box.x, spec.y - box.y);
    overlays.push(overlay);
  }
  return overlays;
}
