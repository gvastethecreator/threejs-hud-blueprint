import { HudError } from "../contracts/errors.js";
import type { ReadonlyInsets, ReadonlyRect, ReadonlySize } from "../contracts/geometry.js";
import { zeroInsets } from "../contracts/geometry.js";
import { HudNode } from "../core/HudNode.js";

export type AnchorPreset =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";
export type AnchorTarget = "reference" | "visible" | "safe";

const PRESETS: Record<AnchorPreset, { x: number; y: number }> = {
  "top-left": { x: 0, y: 0 },
  top: { x: 0.5, y: 0 },
  "top-right": { x: 1, y: 0 },
  left: { x: 0, y: 0.5 },
  center: { x: 0.5, y: 0.5 },
  right: { x: 1, y: 0.5 },
  "bottom-left": { x: 0, y: 1 },
  bottom: { x: 0.5, y: 1 },
  "bottom-right": { x: 1, y: 1 },
};

export function anchorPoint(preset: AnchorPreset | { x: number; y: number }): {
  x: number;
  y: number;
} {
  if (typeof preset === "string") return PRESETS[preset];
  if (![preset.x, preset.y].every(Number.isFinite))
    throw new HudError("INVALID_ARGUMENT", "Custom anchors must be finite.");
  return preset;
}

export function resolveFrame(
  target: AnchorTarget,
  reference: ReadonlySize,
  insets: ReadonlyInsets = zeroInsets(),
  visible?: ReadonlyRect,
): ReadonlyRect {
  if (target === "visible") {
    if (!visible) {
      throw new HudError(
        "INVALID_ARGUMENT",
        "Visible-frame anchoring requires logical visible bounds.",
      );
    }
    return visible;
  }
  if (target === "safe") {
    return {
      x: insets.left,
      y: insets.top,
      width: Math.max(0, reference.width - insets.left - insets.right),
      height: Math.max(0, reference.height - insets.top - insets.bottom),
    };
  }
  return { x: 0, y: 0, width: reference.width, height: reference.height };
}

function applyMargin(frame: ReadonlyRect, margin: ReadonlyInsets): ReadonlyRect {
  return {
    x: frame.x + margin.left,
    y: frame.y + margin.top,
    width: Math.max(0, frame.width - margin.left - margin.right),
    height: Math.max(0, frame.height - margin.top - margin.bottom),
  };
}

export function layoutAbsolute(
  node: HudNode,
  options: {
    anchor?: AnchorPreset | { x: number; y: number };
    pivot?: { x: number; y: number };
    offset?: { x: number; y: number };
    margin?: ReadonlyInsets;
    target?: AnchorTarget;
    reference: ReadonlySize;
    insets?: ReadonlyInsets;
    visible?: ReadonlyRect;
  },
): void {
  const frame = applyMargin(
    resolveFrame(options.target ?? "reference", options.reference, options.insets, options.visible),
    options.margin ?? zeroInsets(),
  );
  const anchor = anchorPoint(options.anchor ?? "top-left");
  const pivot = options.pivot ?? anchor;
  const offset = options.offset ?? { x: 0, y: 0 };
  const x = frame.x + frame.width * anchor.x - node.size.width * pivot.x + offset.x;
  const y = frame.y + frame.height * anchor.y - node.size.height * pivot.y + offset.y;
  node.setPosition(x, y);
}

export const ANCHOR_PRESETS = Object.keys(PRESETS) as AnchorPreset[];

export function anchorSheet(
  reference: ReadonlySize,
  size: ReadonlySize,
): Record<AnchorPreset, { x: number; y: number }> {
  const sheet = {} as Record<AnchorPreset, { x: number; y: number }>;
  for (const preset of ANCHOR_PRESETS) {
    const node = new HudNode({ width: size.width, height: size.height });
    layoutAbsolute(node, { anchor: preset, reference });
    sheet[preset] = { x: node.position.x, y: node.position.y };
  }
  return sheet;
}
