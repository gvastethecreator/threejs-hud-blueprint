import type { HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { emitDiagnostic } from "../contracts/diagnostics.js";
import { HudError } from "../contracts/errors.js";
import type { ReadonlyInsets } from "../contracts/geometry.js";
import { zeroInsets } from "../contracts/geometry.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import type { HudNode } from "../core/HudNode.js";
import { layoutNodePath } from "./path.js";

export type LayoutDimension = number | "auto" | "fill";

export type LayoutConstraints = Readonly<{
  width: number;
  height: number;
}>;

export type LayoutBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  contentX: number;
  contentY: number;
  contentWidth: number;
  contentHeight: number;
  padding: ReadonlyInsets;
  overflow: boolean;
  overflowX: boolean;
  overflowY: boolean;
  clip: { x: number; y: number; width: number; height: number } | null;
}>;

export type LayoutProps = Readonly<{
  width?: LayoutDimension;
  height?: LayoutDimension;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  padding?: ReadonlyInsets;
  margin?: ReadonlyInsets;
  clip?: boolean;
}>;

const props = new WeakMap<HudNode, LayoutProps>();
const measured = new WeakMap<HudNode, { key: string; size: { width: number; height: number } }>();
const boxes = new WeakMap<HudNode, LayoutBox>();
const layoutCache = new WeakMap<HudNode, { key: string; box: LayoutBox }>();
const visiting = new Set<HudNode>();

export function setLayoutProps(node: HudNode, next: LayoutProps): void {
  props.set(node, next);
  measured.delete(node);
  layoutCache.delete(node);
  node.markDirty(DirtyFlag.Layout);
}

export function getLayoutProps(node: HudNode): LayoutProps {
  return props.get(node) ?? {};
}

export function getLayoutBox(node: HudNode): LayoutBox | undefined {
  return boxes.get(node);
}

export function participatesInLayout(node: HudNode): boolean {
  return node.layoutVisibility !== "collapse" && !node.debugOverlay;
}

export function measureNode(
  node: HudNode,
  constraints: LayoutConstraints,
  onDiagnostic?: HudDiagnosticHandler,
): { width: number; height: number } {
  const spec = props.get(node) ?? {};
  const key = `${constraints.width}x${constraints.height}:${spec.width ?? ""}:${spec.height ?? ""}`;
  const cached = measured.get(node);
  if (cached && cached.key === key) return cached.size;
  if (visiting.has(node)) {
    failCycle(node, constraints, spec, onDiagnostic);
  }
  visiting.add(node);
  try {
    for (const child of node.children) {
      if (!participatesInLayout(child)) continue;
      const childSpec = props.get(child) ?? {};
      if (
        (spec.width === "auto" && childSpec.width === "fill") ||
        (spec.height === "auto" && childSpec.height === "fill")
      ) {
        failCycle(child, constraints, childSpec, onDiagnostic);
      }
      if (spec.width === "auto" || spec.height === "auto")
        measureNode(child, constraints, onDiagnostic);
    }
    const pad = spec.padding ?? zeroInsets();
    const width = resolveDimension(
      spec.width ?? node.size.width,
      spec.minWidth,
      spec.maxWidth,
      constraints.width,
      node.size.width,
      spec.width === "fill",
    );
    const height = resolveDimension(
      spec.height ?? node.size.height,
      spec.minHeight,
      spec.maxHeight,
      constraints.height,
      node.size.height,
      spec.height === "fill",
    );
    const size = {
      width: width + (spec.width === "auto" ? pad.left + pad.right : 0),
      height: height + (spec.height === "auto" ? pad.top + pad.bottom : 0),
    };
    if (spec.width !== "auto") size.width = width;
    if (spec.height !== "auto") size.height = height;
    measured.set(node, { key, size });
    return size;
  } finally {
    visiting.delete(node);
  }
}

export function layoutNode(
  node: HudNode,
  constraints: LayoutConstraints,
  origin = { x: node.position.x, y: node.position.y },
  onDiagnostic?: HudDiagnosticHandler,
): LayoutBox {
  const spec = props.get(node) ?? {};
  const cacheKey = `${origin.x},${origin.y}:${constraints.width}x${constraints.height}`;
  const cached = layoutCache.get(node);
  if (cached && cached.key === cacheKey) return cached.box;
  if (spec.width === "fill" && !Number.isFinite(constraints.width)) {
    throw new HudError("INVALID_ARGUMENT", "Fill width requires a defined parent constraint.", {
      nodeId: node.id,
      path: layoutNodePath(node),
    });
  }
  if (spec.height === "fill" && !Number.isFinite(constraints.height)) {
    throw new HudError("INVALID_ARGUMENT", "Fill height requires a defined parent constraint.", {
      nodeId: node.id,
      path: layoutNodePath(node),
    });
  }
  const measuredSize = measureNode(node, constraints, onDiagnostic);
  const pad = spec.padding ?? zeroInsets();
  const contentWidth = Math.max(0, measuredSize.width - pad.left - pad.right);
  const contentHeight = Math.max(0, measuredSize.height - pad.top - pad.bottom);
  const overflowX = measuredSize.width > constraints.width;
  const overflowY = measuredSize.height > constraints.height;
  const box: LayoutBox = Object.freeze({
    x: origin.x,
    y: origin.y,
    width: measuredSize.width,
    height: measuredSize.height,
    contentX: origin.x + pad.left,
    contentY: origin.y + pad.top,
    contentWidth,
    contentHeight,
    padding: pad,
    overflow: overflowX || overflowY,
    overflowX,
    overflowY,
    clip:
      spec.clip === true
        ? {
            x: origin.x + pad.left,
            y: origin.y + pad.top,
            width: contentWidth,
            height: contentHeight,
          }
        : null,
  });
  boxes.set(node, box);
  layoutCache.set(node, { key: cacheKey, box });
  node.setPosition(origin.x, origin.y);
  node.setSize(box.width, box.height);
  if (box.clip) node.setClip(box.clip);
  let remainingW = contentWidth;
  let remainingH = contentHeight;
  const childOrigin = { x: pad.left, y: pad.top };
  for (const child of node.children) {
    if (!participatesInLayout(child)) continue;
    const childBox = layoutNode(
      child,
      { width: remainingW, height: remainingH },
      childOrigin,
      onDiagnostic,
    );
    remainingW = Math.max(0, remainingW - childBox.width);
    remainingH = Math.max(0, remainingH - childBox.height);
  }
  node.clearDirty(DirtyFlag.Layout);
  return box;
}

export function layoutDirty(node: HudNode): void {
  measured.delete(node);
  layoutCache.delete(node);
  node.markDirty(DirtyFlag.Layout);
}

export function snapshotLayoutBox(node: HudNode): LayoutBox | null {
  return boxes.get(node) ?? null;
}

function failCycle(
  node: HudNode,
  constraints: LayoutConstraints,
  spec: LayoutProps,
  onDiagnostic?: HudDiagnosticHandler,
): never {
  const details = {
    nodeId: node.id,
    path: layoutNodePath(node),
    parent: node.parent?.id ?? null,
    widthMode: String(spec.width ?? "fixed"),
    heightMode: String(spec.height ?? "fixed"),
    constraintWidth: constraints.width,
    constraintHeight: constraints.height,
  };
  emitDiagnostic(onDiagnostic, {
    severity: "error",
    code: "LAYOUT_CYCLE",
    message: "Layout measurement cycle detected.",
    nodeId: node.id,
    details,
  });
  throw new HudError("INVALID_STATE", "Layout measurement cycle detected.", details);
}

function resolveDimension(
  spec: LayoutDimension | number,
  min: number | undefined,
  max: number | undefined,
  available: number,
  intrinsic: number,
  fill: boolean,
): number {
  let value: number;
  if (spec === "auto") value = intrinsic;
  else if (spec === "fill" || fill) value = available;
  else value = spec;
  return clampMinMax(value, min, max);
}

export function clampMinMax(
  value: number,
  min: number | undefined,
  max: number | undefined,
): number {
  let next = value;
  if (min !== undefined && max !== undefined && min > max) {
    next = min;
  } else {
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
  }
  return Math.max(0, next);
}
