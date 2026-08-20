import { emitDiagnostic, type HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { HudError } from "../contracts/errors.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import type { HudNode } from "../core/HudNode.js";

export type TokenRef = Readonly<{ $ref: string }>;
export type ColorValue = number | string;
export type StrokeInput = Readonly<{ width: number; color: ColorValue }>;
export type TextStyleInput = Readonly<{ font?: string; size?: number; color?: ColorValue }>;

export type WidgetStyleSet = Readonly<{
  base?: Record<string, ColorValue | number | string>;
  variant?: Record<string, Record<string, ColorValue | number | string>>;
  selected?: Record<string, ColorValue | number | string>;
  hovered?: Record<string, ColorValue | number | string>;
  pressed?: Record<string, ColorValue | number | string>;
  disabled?: Record<string, ColorValue | number | string>;
}>;

export type HudTheme = Readonly<{
  id: string;
  colors: Record<string, ColorValue | TokenRef>;
  typography: Record<string, TextStyleInput | TokenRef>;
  spacing: Record<string, number | TokenRef>;
  radii: Record<string, number | TokenRef>;
  strokes: Record<string, StrokeInput | TokenRef>;
  widgets: Record<string, WidgetStyleSet>;
}>;

export type InteractionState = Readonly<{
  hovered?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  selected?: boolean;
  variant?: string;
}>;

export const THEME_PRECEDENCE = [
  "base",
  "variant",
  "selected",
  "hovered",
  "pressed",
  "disabled",
  "override",
] as const;

export const DEFAULT_THEME: HudTheme = Object.freeze({
  id: "default",
  colors: {
    panel: 0x15202c,
    track: 0x102030,
    fill: 0x3dff8a,
    delayed: 0xf0c14b,
    text: 0xe8f6ff,
    crosshair: 0xe8f6ff,
    slot: 0x1c2c3c,
    selected: 0x4aa3ff,
  },
  typography: { label: { font: "ui", size: 14, color: 0xe8f6ff } },
  spacing: { sm: 4, md: 8, lg: 16 },
  radii: { panel: 8, slot: 4 },
  strokes: { panel: { width: 1, color: 0x2a3a4d } },
  widgets: {
    LinearBar: { hovered: { fill: 0x6dffb0 }, disabled: { fill: 0x556677 } },
    Slot: {
      base: { fill: 0x2a3d52 },
      selected: { fill: 0x4aa3ff },
      hovered: { fill: 0x2a4a5c },
      disabled: { fill: 0x101820 },
    },
  },
});

export type MonochromeThemeOptions = Readonly<{
  invert?: boolean;
  font?: string;
  size?: number;
}>;

export function isGrayscaleColor(value: number): boolean {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffff) return false;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return r === g && g === b;
}

export function themeColor(theme: HudTheme, key: string): number {
  const value = resolveToken(theme, `colors.${key}`);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HudError("INVALID_ARGUMENT", "Theme color must be a number.", { path: key });
  }
  return value;
}

export function createMonochromeTheme(options: MonochromeThemeOptions = {}): HudTheme {
  const invert = options.invert === true;
  const ink = invert ? 0x000000 : 0xffffff;
  const paper = invert ? 0xffffff : 0x000000;
  const muted = invert ? 0x666666 : 0x888888;
  const track = invert ? 0xdddddd : 0x222222;
  const slot = invert ? 0xeeeeee : 0x111111;
  const font = options.font ?? "pixel";
  const size = options.size ?? 14;
  return Object.freeze({
    id: invert ? "monochrome-invert" : "monochrome",
    colors: {
      panel: paper,
      track,
      fill: ink,
      delayed: muted,
      text: ink,
      muted,
      crosshair: ink,
      slot,
      selected: ink,
    },
    typography: { label: { font, size, color: ink } },
    spacing: { sm: 2, md: 4, lg: 8 },
    radii: { panel: 0, slot: 0 },
    strokes: { panel: { width: 2, color: ink } },
    widgets: {
      LinearBar: { hovered: { fill: muted }, disabled: { fill: muted } },
      Slot: {
        base: { fill: slot },
        selected: { fill: ink },
        hovered: { fill: muted },
        disabled: { fill: track },
      },
    },
  });
}

export const MONOCHROME_THEME: HudTheme = createMonochromeTheme();
export const MONOCHROME_INVERT_THEME: HudTheme = createMonochromeTheme({ invert: true });

export const PIXEL_THEME: HudTheme = Object.freeze({
  id: "pixel",
  colors: {
    panel: 0x111111,
    track: 0x222034,
    fill: 0x99e550,
    delayed: 0xdf7126,
    text: 0xcbdbfc,
    crosshair: 0xffffff,
    slot: 0x45283c,
    selected: 0x5fcde4,
  },
  typography: { label: { font: "pixel", size: 11, color: 0xcbdbfc } },
  spacing: { sm: 2, md: 4, lg: 8 },
  radii: { panel: 0, slot: 0 },
  strokes: { panel: { width: 2, color: 0xffffff } },
  widgets: {
    LinearBar: { hovered: { fill: 0xb4ff6a }, disabled: { fill: 0x595959 } },
    Slot: {
      base: { fill: 0x45283c },
      selected: { fill: 0x5fcde4 },
      hovered: { fill: 0x76428a },
      disabled: { fill: 0x222034 },
    },
  },
});

export function resolveToken(
  theme: HudTheme,
  path: string,
  onDiagnostic?: HudDiagnosticHandler,
  seen: string[] = [],
): unknown {
  if (seen.includes(path)) {
    emitDiagnostic(onDiagnostic, {
      severity: "error",
      code: "THEME_CYCLE",
      message: "Cyclic theme token.",
      details: { path, chain: seen.join(">") },
    });
    throw new HudError("INVALID_STATE", "Cyclic theme token.", { path });
  }
  const [space, key] = path.split(".");
  if (!space || !key) {
    emitDiagnostic(onDiagnostic, {
      severity: "error",
      code: "THEME_MISSING",
      message: "Malformed theme token path.",
      details: { path },
    });
    throw new HudError("INVALID_ARGUMENT", "Malformed theme token path.", { path });
  }
  const table = (theme as unknown as Record<string, Record<string, unknown>>)[space];
  const value = table?.[key];
  if (value === undefined) {
    emitDiagnostic(onDiagnostic, {
      severity: "error",
      code: "THEME_MISSING",
      message: "Missing theme token.",
      details: { path },
    });
    throw new HudError("INVALID_ARGUMENT", "Missing theme token.", { path });
  }
  if (isRef(value)) return resolveToken(theme, value.$ref, onDiagnostic, [...seen, path]);
  return value;
}

export function resolveWidgetStyle(
  theme: HudTheme,
  widget: string,
  state: InteractionState = {},
  override: Record<string, ColorValue | number | string> = {},
): Record<string, ColorValue | number | string> {
  const set = theme.widgets[widget] ?? {};
  const merged: Record<string, ColorValue | number | string> = { ...(set.base ?? {}) };
  if (state.variant && set.variant?.[state.variant])
    Object.assign(merged, set.variant[state.variant]);
  if (state.selected === true) Object.assign(merged, set.selected ?? {});
  if (state.hovered === true) Object.assign(merged, set.hovered ?? {});
  if (state.pressed === true) Object.assign(merged, set.pressed ?? {});
  if (state.disabled === true) Object.assign(merged, set.disabled ?? {});
  Object.assign(merged, override);
  return merged;
}

export function applyStyle(
  node: HudNode,
  style: Record<string, ColorValue | number | string>,
  layoutKeys: ReadonlySet<string> = new Set(["width", "height", "padding"]),
): void {
  const fill = style["fill"];
  if (typeof fill === "number" && fill !== node.fill) {
    node.fill = fill;
    node.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
  }
  const touchesLayout = Object.keys(style).some((key) => layoutKeys.has(key));
  if (!touchesLayout) node.markDirty(DirtyFlag.Style);
}

export function serializeTheme(theme: HudTheme): string {
  return JSON.stringify(theme);
}

function isRef(value: unknown): value is TokenRef {
  return typeof value === "object" && value !== null && "$ref" in value;
}
