export type ReadonlySize = Readonly<{ width: number; height: number }>;
export type ReadonlyPoint = Readonly<{ x: number; y: number }>;
export type ReadonlyInsets = Readonly<{ top: number; right: number; bottom: number; left: number }>;
export type ReadonlyRect = Readonly<{ x: number; y: number; width: number; height: number }>;

export type HudScaleMode = "contain" | "cover" | "native" | "stretch" | "integer";
export type IntegerDownscalePolicy = "overflow-1x" | "disable" | "explicit-fractional";
export type HudBlendMode = "premultiplied" | "alpha" | "additive";

export function assertFinitePositiveSize(size: ReadonlySize, label = "size"): void {
  if (
    !Number.isFinite(size.width) ||
    !Number.isFinite(size.height) ||
    size.width <= 0 ||
    size.height <= 0
  ) {
    throw new RangeError(`${label} must contain finite positive width and height.`);
  }
}

export function zeroInsets(): ReadonlyInsets {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}
