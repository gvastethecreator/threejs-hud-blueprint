import type { ReadonlyInsets, ReadonlyRect } from "../contracts/geometry.js";
import { zeroInsets } from "../contracts/geometry.js";
import { HudImage, type ImageOptions } from "./Image.js";

export type NineSliceOptions = ImageOptions & Readonly<{ insets?: ReadonlyInsets }>;

export class NineSlice extends HudImage {
  insets: ReadonlyInsets;

  constructor(options: NineSliceOptions = {}) {
    super(options);
    this.insets = Object.freeze({ ...(options.insets ?? zeroInsets()) });
  }

  sliceRects(): readonly ReadonlyRect[] {
    const { width, height } = this.size;
    const left = this.insets.left;
    const right = this.insets.right;
    const top = this.insets.top;
    const bottom = this.insets.bottom;
    const centerW = Math.max(0, width - left - right);
    const centerH = Math.max(0, height - top - bottom);
    const x = this.position.x;
    const y = this.position.y;
    return Object.freeze([
      { x, y, width: left, height: top },
      { x: x + left, y, width: centerW, height: top },
      { x: x + width - right, y, width: right, height: top },
      { x, y: y + top, width: left, height: centerH },
      { x: x + left, y: y + top, width: centerW, height: centerH },
      { x: x + width - right, y: y + top, width: right, height: centerH },
      { x, y: y + height - bottom, width: left, height: bottom },
      { x: x + left, y: y + height - bottom, width: centerW, height: bottom },
      { x: x + width - right, y: y + height - bottom, width: right, height: bottom },
    ]);
  }
}
