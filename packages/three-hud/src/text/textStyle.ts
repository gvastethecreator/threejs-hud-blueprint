import { HudError } from "../contracts/errors.js";
import type { FontRenderMode } from "./contracts.js";

export type TextAlign = "left" | "center" | "right";
export type TextWrap = "none" | "word" | "character";
export type TextOverflow = "clip" | "ellipsis" | "visible";

export type TextStyle = Readonly<{
  font: string;
  size: number;
  letterSpacing?: number;
  lineHeight?: number | "normal";
  align?: TextAlign;
  direction?: "ltr";
  wrap?: TextWrap;
  maxWidth?: number;
  maxLines?: number;
  overflow?: TextOverflow;
  color?: number;
  outlineWidth?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backend?: FontRenderMode;
}>;

export type NormalizedTextStyle = Readonly<{
  font: string;
  size: number;
  letterSpacing: number;
  lineHeight: number | "normal";
  align: TextAlign;
  direction: "ltr";
  wrap: TextWrap;
  maxWidth: number | null;
  maxLines: number | null;
  overflow: TextOverflow;
  color: number;
  outlineWidth: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  backend: FontRenderMode;
}>;

export function normalizeTextStyle(style: TextStyle): NormalizedTextStyle {
  assertFinitePositive(style.size, "size");
  if (style.letterSpacing !== undefined) assertFinite(style.letterSpacing, "letterSpacing");
  if (style.lineHeight !== undefined && style.lineHeight !== "normal")
    assertFinitePositive(style.lineHeight, "lineHeight");
  if (style.maxWidth !== undefined) assertFinitePositive(style.maxWidth, "maxWidth");
  if (style.maxLines !== undefined) {
    if (!Number.isFinite(style.maxLines) || style.maxLines < 1) {
      throw new HudError("INVALID_ARGUMENT", "maxLines must be a finite positive number.", {
        maxLines: String(style.maxLines),
      });
    }
  }
  return Object.freeze({
    font: style.font,
    size: style.size,
    letterSpacing: style.letterSpacing ?? 0,
    lineHeight: style.lineHeight ?? "normal",
    align: style.align ?? "left",
    direction: "ltr",
    wrap: style.wrap ?? "none",
    maxWidth: style.maxWidth ?? null,
    maxLines: style.maxLines ?? null,
    overflow: style.overflow ?? "visible",
    color: style.color ?? 0xffffff,
    outlineWidth: style.outlineWidth ?? 0,
    shadowOffsetX: style.shadowOffsetX ?? 0,
    shadowOffsetY: style.shadowOffsetY ?? 0,
    backend: style.backend ?? "auto",
  });
}

export function layoutCacheKey(style: NormalizedTextStyle, text: string): string {
  return [
    style.font,
    style.size,
    style.letterSpacing,
    style.lineHeight,
    style.align,
    style.direction,
    style.wrap,
    style.maxWidth ?? "",
    style.maxLines ?? "",
    style.overflow,
    text,
  ].join("|");
}

export function paintCacheKey(style: NormalizedTextStyle): string {
  return [
    style.color,
    style.outlineWidth,
    style.shadowOffsetX,
    style.shadowOffsetY,
    style.backend,
  ].join("|");
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value))
    throw new HudError("INVALID_ARGUMENT", `${label} must be finite.`, { [label]: String(value) });
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new HudError("INVALID_ARGUMENT", `${label} must be a finite positive number.`, {
      [label]: String(value),
    });
  }
}
