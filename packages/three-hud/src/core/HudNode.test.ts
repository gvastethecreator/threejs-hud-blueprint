import { describe, expect, it } from "vitest";
import { HudNode } from "./HudNode.js";

describe("HudNode", () => {
  it("reparents deterministically and rejects cycles", () => {
    const root = new HudNode({ id: "root" });
    const a = root.add(new HudNode({ id: "a" }));
    const b = a.add(new HudNode({ id: "b" }));
    expect(root.children).toEqual([a]);
    expect(() => b.add(root)).toThrow();
    root.add(b);
    expect(a.children).toEqual([]);
    expect(b.parent).toBe(root);
  });

  it("inserts without creating cycles and hides descendants when an ancestor is invisible", () => {
    const root = new HudNode({ id: "root" });
    const a = new HudNode({ id: "a" });
    const b = new HudNode({ id: "b" });
    root.add(a);
    root.insert(0, b);
    expect(root.children[0]).toBe(b);
    expect(() => a.add(root)).toThrow();
    a.visible = false;
    expect(a.effectiveVisible()).toBe(false);
    a.opacity = 0.5;
    root.opacity = 0.5;
    expect(a.effectiveOpacity()).toBe(0.25);
  });

  it("matches rotated axis-aligned world bounds and documents mutation-during-copy traversal", () => {
    const node = new HudNode({ width: 10, height: 6 });
    node.rotation = Math.PI / 2;
    const bounds = node.worldBounds();
    expect(bounds.width).toBeCloseTo(6);
    expect(bounds.height).toBeCloseTo(10);
    const root = new HudNode();
    root.add(new HudNode({ id: "keep" }));
    root.add(new HudNode({ id: "drop" }));
    for (const child of [...root.children]) {
      if (child.id === "drop") root.remove(child);
    }
    expect(root.children.map((child) => child.id)).toEqual(["keep"]);
  });

  it("computes world bounds from ancestor positions", () => {
    const root = new HudNode({ id: "root" });
    const child = root.add(new HudNode({ id: "child", width: 40, height: 10 }));
    root.setPosition(100, 20);
    child.setPosition(5, 7);
    expect(child.worldBounds()).toEqual({ x: 105, y: 27, width: 40, height: 10 });
  });

  it("disposes descendants idempotently", () => {
    const root = new HudNode();
    const child = root.add(new HudNode());
    root.dispose();
    root.dispose();
    expect(root.disposed).toBe(true);
    expect(child.disposed).toBe(true);
  });
});
