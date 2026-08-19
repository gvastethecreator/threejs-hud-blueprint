import { DirtyFlag } from "../core/DirtyFlags.js";
import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { snapLogicalToDevicePixel } from "../viewport/resolveViewport.js";

export type LineAlignment = "center";

export type LineOptions = HudNodeOptions &
  Readonly<{
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    strokeWidth?: number;
    pixelSnap?: boolean;
  }>;

export class Line extends HudNode {
  readonly primitive = "line" as const;
  readonly alignment: LineAlignment = "center";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
  pixelSnap: boolean;

  constructor(options: LineOptions = {}) {
    super({ ...options, width: 0, height: 0, fill: options.fill ?? 0xffffff });
    this.x1 = options.x1 ?? 0;
    this.y1 = options.y1 ?? 0;
    this.x2 = options.x2 ?? 0;
    this.y2 = options.y2 ?? 0;
    this.strokeWidth = options.strokeWidth ?? 1;
    this.pixelSnap = options.pixelSnap === true;
    this.syncFromEndpoints();
  }

  setEndpoints(x1: number, y1: number, x2: number, y2: number): void {
    this.assertAlive();
    if (![x1, y1, x2, y2].every(Number.isFinite))
      throw new RangeError("Line endpoints must be finite.");
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.syncFromEndpoints();
    this.markDirty(DirtyFlag.Geometry | DirtyFlag.Layout | DirtyFlag.HitTest | DirtyFlag.Queue);
  }

  snapStroke(scale: number, dpr: number): number {
    const width = this.strokeWidth;
    if (!this.pixelSnap) return width;
    const snapped = snapLogicalToDevicePixel(width, scale, dpr);
    return Math.max(1 / (scale * dpr), snapped);
  }

  private syncFromEndpoints(): void {
    const minX = Math.min(this.x1, this.x2);
    const minY = Math.min(this.y1, this.y2);
    const width = Math.max(Math.abs(this.x2 - this.x1), this.strokeWidth);
    const height = Math.max(Math.abs(this.y2 - this.y1), this.strokeWidth);
    this.position = { x: minX, y: minY };
    this.size = Object.freeze({ width, height });
    this.bounds = { x: minX, y: minY, width, height };
  }
}
