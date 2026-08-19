export type BitmapScaleDecision = Readonly<{
  integer: boolean;
  multiplier: number;
  pixelPerfect: boolean;
  filter: "nearest";
  mipmaps: false;
}>;

export function bitmapScalePolicy(nativeSize: number, presentedSize: number): BitmapScaleDecision {
  const multiplier = presentedSize / nativeSize;
  const integer = Number.isInteger(multiplier) && multiplier >= 1;
  return Object.freeze({
    integer,
    multiplier,
    pixelPerfect: integer,
    filter: "nearest",
    mipmaps: false,
  });
}
