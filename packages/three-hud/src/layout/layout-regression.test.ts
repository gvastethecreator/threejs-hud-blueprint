import { describe, expect, it } from "vitest";
import { effectiveClip } from "../render/clip.js";
import { HudNode } from "../core/HudNode.js";
import { hitTest } from "../input/hitTest.js";
import { collectHitOrder, collectPaintOrder } from "../core/order.js";
import { getLayoutBox, layoutNode, setLayoutProps } from "./box.js";
import { createLayoutDebugOverlays } from "./debug.js";
import { layoutStack } from "./stack.js";

describe("layout-regression", () => {
  it("keeps render clip and hit-test clip on the same interactive area", () => {
    const parent = new HudNode({ id: "panel", width: 40, height: 40 });
    const child = parent.add(new HudNode({ id: "btn", width: 80, height: 20 }));
    setLayoutProps(parent, { clip: true, width: 40, height: 40 });
    layoutNode(parent, { width: 40, height: 40 }, { x: 0, y: 0 });
    child.setClip(effectiveClip(parent));
    const clip = effectiveClip(child);
    expect(clip).toEqual({ x: 0, y: 0, width: 40, height: 40 });
    expect(hitTest(parent, 10, 10)?.id).toBe("btn");
    expect(hitTest(parent, 60, 10)).toBeNull();
  });

  it("debug overlays do not change layout or hit order", () => {
    const root = new HudNode({ id: "root", width: 20, height: 20 });
    setLayoutProps(root, { width: 20, height: 20 });
    layoutNode(root, { width: 20, height: 20 });
    const beforeBox = getLayoutBox(root);
    const beforeHit = collectHitOrder(root).map((node) => node.id);
    const beforePaint = collectPaintOrder(root).map((node) => node.id);
    createLayoutDebugOverlays(root);
    expect(getLayoutBox(root)).toEqual(beforeBox);
    expect(collectHitOrder(root).map((node) => node.id)).toEqual(beforeHit);
    expect(
      collectPaintOrder(root)
        .map((node) => node.id)
        .slice(0, beforePaint.length),
    ).toEqual(beforePaint);
  });

  it("records nested overflow, visibility, and scale-independent boxes", () => {
    const stackA = new HudNode({ id: "a", width: 10, height: 10 });
    const stackB = new HudNode({ id: "b", width: 10, height: 10, visible: false });
    const box = layoutStack([stackA, stackB], { direction: "horizontal", gap: 2, width: 16 });
    expect(box.overflow).toBe(true);
    expect(layoutNode(stackA, { width: 10, height: 10 })).toMatchObject({ width: 10, height: 10 });
  });
});
