import { describe, expect, it } from "vitest";
import { HudNode } from "../core/HudNode.js";
import { layoutStack } from "./stack.js";

describe("layoutStack", () => {
  it("places children in a horizontal stack with gap", () => {
    const a = new HudNode({ width: 10, height: 8 });
    const b = new HudNode({ width: 20, height: 8 });
    layoutStack([a, b], { direction: "horizontal", gap: 4, x: 2, y: 3 });
    expect(a.position).toEqual({ x: 2, y: 3 });
    expect(b.position).toEqual({ x: 16, y: 3 });
  });
});
