import { describe, expect, it } from "vitest";
import { HudNode } from "../core/HudNode.js";
import { gridContentSize, layoutGrid } from "./grid.js";

describe("grid-layout", () => {
  it("produces stable inventory-sized cells without pixel drift", () => {
    const nodes = Array.from(
      { length: 8 },
      (_, index) => new HudNode({ id: `slot-${index}`, width: 48, height: 48 }),
    );
    const first = layoutGrid(nodes, {
      columns: 4,
      rows: 2,
      cellWidth: 48,
      cellHeight: 48,
      gapX: 4,
      gapY: 4,
    });
    const second = layoutGrid(nodes, {
      columns: 4,
      rows: 2,
      cellWidth: 48,
      cellHeight: 48,
      gapX: 4,
      gapY: 4,
    });
    expect(second).toEqual(first);
    expect(first[7]).toEqual({
      column: 3,
      row: 1,
      x: 156,
      y: 52,
      width: 48,
      height: 48,
      nodeId: "slot-7",
    });
    expect(
      gridContentSize({ columns: 4, rows: 2, cellWidth: 48, cellHeight: 48, gapX: 4, gapY: 4 }),
    ).toEqual({
      width: 204,
      height: 100,
    });
  });

  it("clips extra children and leaves missing cells empty", () => {
    const nodes = Array.from(
      { length: 5 },
      (_, index) => new HudNode({ id: `n-${index}`, width: 10, height: 10 }),
    );
    const cells = layoutGrid(nodes, {
      columns: 2,
      rows: 2,
      cellWidth: 10,
      cellHeight: 10,
      overflow: "clip",
    });
    expect(cells.filter((cell) => cell.nodeId === null)).toHaveLength(0);
    expect(cells).toHaveLength(4);
    expect(nodes[4]?.clip).toEqual({ x: 0, y: 0, width: 20, height: 20 });
  });

  it("includes padding in content size and keeps integer cell origins stable", () => {
    expect(
      gridContentSize({
        columns: 2,
        rows: 2,
        cellWidth: 16,
        cellHeight: 16,
        gapX: 2,
        gapY: 2,
        padding: { top: 4, right: 3, bottom: 5, left: 1 },
      }),
    ).toEqual({ width: 38, height: 43 });
    const nodes = Array.from(
      { length: 4 },
      (_, index) => new HudNode({ id: `i${index}`, width: 16, height: 16 }),
    );
    const first = layoutGrid(nodes, {
      columns: 2,
      rows: 2,
      cellWidth: 16,
      cellHeight: 16,
      gapX: 0,
      gapY: 0,
    });
    const second = layoutGrid(nodes, {
      columns: 2,
      rows: 2,
      cellWidth: 16,
      cellHeight: 16,
      gapX: 0,
      gapY: 0,
    });
    expect(second.map((cell) => ({ x: cell.x, y: cell.y }))).toEqual(
      first.map((cell) => ({ x: cell.x, y: cell.y })),
    );
    expect(first.map((cell) => cell.x)).toEqual([0, 16, 0, 16]);
  });
});
