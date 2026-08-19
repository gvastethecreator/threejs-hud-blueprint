import { describe, expect, it } from "vitest";
import { HudNode } from "../core/HudNode.js";
import { clampMinMax, setLayoutProps } from "./box.js";
import { layoutAbsolute } from "./absolute.js";
import { layoutGrid } from "./grid.js";

describe("constraints", () => {
  it("clamps min/max before pivot/anchor placement", () => {
    expect(clampMinMax(50, 60, 40)).toBe(60);
    const node = new HudNode({ id: "clamped", width: 10, height: 10 });
    setLayoutProps(node, { minWidth: 30, maxWidth: 30, minHeight: 20, maxHeight: 20 });
    layoutGrid([node], { columns: 1, rows: 1, cellWidth: 80, cellHeight: 80 });
    layoutAbsolute(node, {
      anchor: "top-right",
      pivot: { x: 1, y: 0 },
      reference: { width: 100, height: 80 },
    });
    expect(node.size).toEqual({ width: 30, height: 20 });
    expect(node.position).toEqual({ x: 70, y: 0 });
  });
});
