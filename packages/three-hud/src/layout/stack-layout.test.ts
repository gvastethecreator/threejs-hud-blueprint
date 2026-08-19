import { describe, expect, it } from "vitest";
import { HudNode } from "../core/HudNode.js";
import { setLayoutProps } from "./box.js";
import { layoutStack, snapshotStack } from "./stack.js";

describe("stack-layout", () => {
  it("skips collapsed children and applies gap only between participants", () => {
    const a = new HudNode({ id: "a", width: 10, height: 8 });
    const hidden = new HudNode({
      id: "hidden",
      width: 40,
      height: 8,
      layoutVisibility: "collapse",
    });
    const b = new HudNode({ id: "b", width: 20, height: 8 });
    layoutStack([a, hidden, b], { direction: "horizontal", gap: 4, x: 0, y: 0 });
    expect(a.position).toEqual({ x: 0, y: 0 });
    expect(b.position).toEqual({ x: 14, y: 0 });
    expect(hidden.position).toEqual({ x: 0, y: 0 });
  });

  it("divides remaining space equally among fill children", () => {
    const a = new HudNode({ id: "fixed", width: 20, height: 10 });
    const b = new HudNode({ id: "fill-a", width: 1, height: 10 });
    const c = new HudNode({ id: "fill-b", width: 1, height: 10 });
    setLayoutProps(b, { width: "fill" });
    setLayoutProps(c, { width: "fill" });
    layoutStack([a, b, c], { direction: "horizontal", gap: 4, width: 100, height: 10 });
    expect(a.size.width).toBe(20);
    expect(b.size.width).toBe(36);
    expect(c.size.width).toBe(36);
  });

  it("stretches on the cross axis while respecting min/max", () => {
    const child = new HudNode({ id: "child", width: 10, height: 4 });
    setLayoutProps(child, { minHeight: 8, maxHeight: 12 });
    layoutStack([child], { direction: "horizontal", align: "stretch", height: 40, width: 10 });
    expect(child.size.height).toBe(12);
  });

  it("emits deterministic stack snapshots", () => {
    const a = new HudNode({ id: "a", width: 8, height: 8 });
    const b = new HudNode({ id: "b", width: 8, height: 8 });
    const first = snapshotStack([a, b], { direction: "vertical", gap: 2, x: 1, y: 2 });
    const second = snapshotStack([a, b], { direction: "vertical", gap: 2, x: 1, y: 2 });
    expect(second).toEqual(first);
    expect(first.children.map((child) => child.id)).toEqual(["a", "b"]);
  });
});
