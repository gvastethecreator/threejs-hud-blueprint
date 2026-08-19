import type { ReadonlyInsets } from "../contracts/geometry.js";
import { zeroInsets } from "../contracts/geometry.js";
import type { HudNode } from "../core/HudNode.js";
import {
  clampMinMax,
  getLayoutProps,
  measureNode,
  participatesInLayout,
  type LayoutBox,
} from "./box.js";

export type StackAlign = "start" | "center" | "end" | "stretch";

export type StackOptions = Readonly<{
  direction?: "horizontal" | "vertical";
  gap?: number;
  x?: number;
  y?: number;
  padding?: ReadonlyInsets;
  align?: StackAlign;
  width?: number;
  height?: number;
}>;

export type StackSnapshot = Readonly<{
  direction: "horizontal" | "vertical";
  gap: number;
  padding: ReadonlyInsets;
  align: StackAlign;
  x: number;
  y: number;
  width: number;
  height: number;
  children: readonly { id: string; x: number; y: number; width: number; height: number }[];
}>;

export function layoutStack(nodes: readonly HudNode[], options: StackOptions = {}): LayoutBox {
  const gap = options.gap ?? 0;
  const direction = options.direction ?? "horizontal";
  const align = options.align ?? "start";
  const padding = options.padding ?? zeroInsets();
  const originX = options.x ?? 0;
  const originY = options.y ?? 0;
  const horizontal = direction === "horizontal";
  const participating = nodes.filter(participatesInLayout);
  const constraints = {
    width: options.width ?? Number.POSITIVE_INFINITY,
    height: options.height ?? Number.POSITIVE_INFINITY,
  };

  const measured = participating.map((node) => {
    const spec = getLayoutProps(node);
    const size = measureNode(node, {
      width: Number.isFinite(constraints.width)
        ? Math.max(0, constraints.width - padding.left - padding.right)
        : node.size.width,
      height: Number.isFinite(constraints.height)
        ? Math.max(0, constraints.height - padding.top - padding.bottom)
        : node.size.height,
    });
    const margin = spec.margin ?? zeroInsets();
    return { node, spec, size, margin };
  });

  const gaps = gap * Math.max(0, participating.length - 1);
  let fixedMain = 0;
  let fillCount = 0;
  let crossIntrinsic = 0;
  for (const item of measured) {
    const mainFill = horizontal ? item.spec.width === "fill" : item.spec.height === "fill";
    const mainSize = horizontal ? item.size.width : item.size.height;
    const crossSize = horizontal ? item.size.height : item.size.width;
    const mainMargin = horizontal
      ? item.margin.left + item.margin.right
      : item.margin.top + item.margin.bottom;
    if (mainFill) fillCount += 1;
    else fixedMain += mainSize + mainMargin;
    crossIntrinsic = Math.max(
      crossIntrinsic,
      crossSize +
        (horizontal ? item.margin.top + item.margin.bottom : item.margin.left + item.margin.right),
    );
  }

  const padMain = horizontal ? padding.left + padding.right : padding.top + padding.bottom;
  const padCross = horizontal ? padding.top + padding.bottom : padding.left + padding.right;
  const authoredMain = horizontal ? options.width : options.height;
  const authoredCross = horizontal ? options.height : options.width;
  const innerMain =
    authoredMain !== undefined ? Math.max(0, authoredMain - padMain) : fixedMain + gaps;
  const innerCross =
    authoredCross !== undefined ? Math.max(0, authoredCross - padCross) : crossIntrinsic;
  const remaining = innerMain - fixedMain - gaps;
  const fillSize = fillCount > 0 ? Math.max(0, remaining / fillCount) : 0;
  const overflow = remaining < 0;
  const outerMain = authoredMain ?? innerMain + padMain;
  const outerCross = authoredCross ?? innerCross + padCross;

  let cursor = horizontal ? originX + padding.left : originY + padding.top;
  for (const item of measured) {
    const mainFill = horizontal ? item.spec.width === "fill" : item.spec.height === "fill";
    const mainMarginStart = horizontal ? item.margin.left : item.margin.top;
    const mainMarginEnd = horizontal ? item.margin.right : item.margin.bottom;
    const crossMarginStart = horizontal ? item.margin.top : item.margin.left;
    const crossMarginEnd = horizontal ? item.margin.bottom : item.margin.right;
    let main = mainFill ? fillSize : horizontal ? item.size.width : item.size.height;
    let cross = horizontal ? item.size.height : item.size.width;
    if (align === "stretch") {
      const stretched = innerCross - crossMarginStart - crossMarginEnd;
      cross = clampMinMax(
        stretched,
        horizontal ? item.spec.minHeight : item.spec.minWidth,
        horizontal ? item.spec.maxHeight : item.spec.maxWidth,
      );
    }
    main = clampMinMax(
      main,
      horizontal ? item.spec.minWidth : item.spec.minHeight,
      horizontal ? item.spec.maxWidth : item.spec.maxHeight,
    );
    const crossRoom = innerCross - cross - crossMarginStart - crossMarginEnd;
    const crossOffset = align === "center" ? crossRoom / 2 : align === "end" ? crossRoom : 0;
    const childX = horizontal
      ? cursor + mainMarginStart
      : originX + padding.left + crossMarginStart + crossOffset;
    const childY = horizontal
      ? originY + padding.top + crossMarginStart + crossOffset
      : cursor + mainMarginStart;
    item.node.setPosition(childX, childY);
    item.node.setSize(horizontal ? main : cross, horizontal ? cross : main);
    cursor += main + mainMarginStart + mainMarginEnd + gap;
  }

  const width = horizontal ? outerMain : outerCross;
  const height = horizontal ? outerCross : outerMain;
  return Object.freeze({
    x: originX,
    y: originY,
    width,
    height,
    contentX: originX + padding.left,
    contentY: originY + padding.top,
    contentWidth: horizontal ? innerMain : innerCross,
    contentHeight: horizontal ? innerCross : innerMain,
    padding,
    overflow,
    overflowX: horizontal ? overflow : false,
    overflowY: horizontal ? false : overflow,
    clip: null,
  });
}

export function snapshotStack(
  nodes: readonly HudNode[],
  options: StackOptions = {},
): StackSnapshot {
  const box = layoutStack(nodes, options);
  return Object.freeze({
    direction: options.direction ?? "horizontal",
    gap: options.gap ?? 0,
    padding: options.padding ?? zeroInsets(),
    align: options.align ?? "start",
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    children: nodes.filter(participatesInLayout).map((node) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      width: node.size.width,
      height: node.size.height,
    })),
  });
}
