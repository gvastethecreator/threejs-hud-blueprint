import { DirtyFlag } from "../core/DirtyFlags.js";
import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import type { HudShapeKind } from "../render/commands.js";

export type BorderPolicy = "inside";

export type RectOptions = HudNodeOptions &
  Readonly<{
    stroke?: number;
    strokeWidth?: number;
  }>;

export class Rect extends HudNode {
  readonly primitive: HudShapeKind = "rect";
  readonly borderPolicy: BorderPolicy = "inside";
  stroke: number;
  strokeWidth: number;

  constructor(options: RectOptions = {}) {
    super({ ...options, width: options.width ?? 32, height: options.height ?? 32 });
    this.stroke = options.stroke ?? 0xffffff;
    this.strokeWidth = options.strokeWidth ?? 0;
  }

  setStrokeWidth(width: number): void {
    this.assertAlive();
    if (!Number.isFinite(width) || width < 0)
      throw new RangeError("strokeWidth must be finite and non-negative.");
    if (this.strokeWidth === width) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.strokeWidth = width;
    this.markDirty(DirtyFlag.Style | DirtyFlag.Geometry | DirtyFlag.HitTest | DirtyFlag.Queue);
  }

  innerFillBounds(): { x: number; y: number; width: number; height: number } {
    const inset = this.strokeWidth;
    return {
      x: this.position.x + inset,
      y: this.position.y + inset,
      width: Math.max(0, this.size.width - inset * 2),
      height: Math.max(0, this.size.height - inset * 2),
    };
  }
}
