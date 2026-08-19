import type { ReadonlyInsets } from "../contracts/geometry.js";
import { zeroInsets } from "../contracts/geometry.js";
import { HudError } from "../contracts/errors.js";
import type { HudNode } from "../core/HudNode.js";
import { clampMinMax, getLayoutProps, participatesInLayout } from "./box.js";

export type GridOverflowPolicy = "clip" | "ignore";
export type GridTraversal = "row-major" | "column-major";

export type GridOptions = Readonly<{
  columns: number;
  rows?: number;
  cellWidth?: number;
  cellHeight?: number;
  gapX?: number;
  gapY?: number;
  padding?: ReadonlyInsets;
  x?: number;
  y?: number;
  overflow?: GridOverflowPolicy;
  traversal?: GridTraversal;
}>;

export type GridCell = Readonly<{
  column: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeId: string | null;
}>;

export function layoutGrid(nodes: readonly HudNode[], options: GridOptions): GridCell[] {
  if (!Number.isInteger(options.columns) || options.columns <= 0) {
    throw new HudError("INVALID_ARGUMENT", "Grid columns must be a positive integer.", {
      columns: options.columns,
    });
  }
  const columns = options.columns;
  const participating = nodes.filter(participatesInLayout);
  const derivedRows = options.rows ?? Math.max(1, Math.ceil(participating.length / columns));
  const rows = options.rows ?? derivedRows;
  const gapX = options.gapX ?? 0;
  const gapY = options.gapY ?? 0;
  const padding = options.padding ?? zeroInsets();
  const originX = options.x ?? 0;
  const originY = options.y ?? 0;
  const overflow = options.overflow ?? "clip";
  const traversal = options.traversal ?? "row-major";
  const capacity = columns * rows;
  const extra = participating.slice(capacity);
  const placed = participating.slice(0, capacity);

  let cellWidth = options.cellWidth;
  let cellHeight = options.cellHeight;
  if (cellWidth === undefined) {
    cellWidth = placed.reduce((max, node) => Math.max(max, node.size.width), 0);
  }
  if (cellHeight === undefined) {
    cellHeight = placed.reduce((max, node) => Math.max(max, node.size.height), 0);
  }

  const cells: GridCell[] = [];
  for (let index = 0; index < capacity; index += 1) {
    const column = traversal === "row-major" ? index % columns : Math.floor(index / rows);
    const row = traversal === "row-major" ? Math.floor(index / columns) : index % rows;
    const x = originX + padding.left + column * (cellWidth + gapX);
    const y = originY + padding.top + row * (cellHeight + gapY);
    const node = placed[index];
    if (node) {
      const spec = getLayoutProps(node);
      const width = clampMinMax(
        Math.min(cellWidth, node.size.width || cellWidth),
        spec.minWidth,
        spec.maxWidth,
      );
      const height = clampMinMax(
        Math.min(cellHeight, node.size.height || cellHeight),
        spec.minHeight,
        spec.maxHeight,
      );
      node.setPosition(x, y);
      node.setSize(width, height);
      cells.push({ column, row, x, y, width: cellWidth, height: cellHeight, nodeId: node.id });
    } else {
      cells.push({ column, row, x, y, width: cellWidth, height: cellHeight, nodeId: null });
    }
  }

  if (overflow === "ignore") {
    for (const node of extra) node.setPosition(originX, originY);
  } else {
    for (const node of extra) {
      node.setPosition(originX + padding.left, originY + padding.top);
      node.setClip({
        x: originX + padding.left,
        y: originY + padding.top,
        width: contentWidth(columns, cellWidth, gapX),
        height: contentHeight(rows, cellHeight, gapY),
      });
    }
  }
  return cells;
}

export function gridContentSize(options: GridOptions): { width: number; height: number } {
  const columns = options.columns;
  const rows = options.rows ?? 1;
  const cellWidth = options.cellWidth ?? 0;
  const cellHeight = options.cellHeight ?? 0;
  const gapX = options.gapX ?? 0;
  const gapY = options.gapY ?? 0;
  const padding = options.padding ?? zeroInsets();
  return {
    width: padding.left + padding.right + contentWidth(columns, cellWidth, gapX),
    height: padding.top + padding.bottom + contentHeight(rows, cellHeight, gapY),
  };
}

function contentWidth(columns: number, cellWidth: number, gapX: number): number {
  return columns * cellWidth + Math.max(0, columns - 1) * gapX;
}

function contentHeight(rows: number, cellHeight: number, gapY: number): number {
  return rows * cellHeight + Math.max(0, rows - 1) * gapY;
}
