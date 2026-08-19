import type { HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { emitDiagnostic } from "../contracts/diagnostics.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import type { HudShapeKind } from "../render/commands.js";
import { Rect, type RectOptions } from "./Rect.js";

export type RoundedRectOptions = RectOptions & Readonly<{ radius?: number }>;

export class RoundedRect extends Rect {
  override readonly primitive: HudShapeKind = "rounded-rect";
  radius: number;

  constructor(options: RoundedRectOptions = {}) {
    super(options);
    this.radius = options.radius ?? 0;
  }

  setRadius(radius: number): void {
    this.assertAlive();
    if (!Number.isFinite(radius) || radius < 0)
      throw new RangeError("radius must be finite and non-negative.");
    if (this.radius === radius) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.radius = radius;
    this.markDirty(DirtyFlag.Geometry | DirtyFlag.Queue);
  }

  diagnoseNonUniformStretch(handler?: HudDiagnosticHandler): boolean {
    if (this.scaleX === this.scaleY) return true;
    emitDiagnostic(handler, {
      severity: "warning",
      code: "ROUNDED_NONUNIFORM_STRETCH",
      message: "RoundedRect radius is uniform; non-uniform scale is unsupported.",
      nodeId: this.id,
      details: { scaleX: this.scaleX, scaleY: this.scaleY },
    });
    return false;
  }
}
