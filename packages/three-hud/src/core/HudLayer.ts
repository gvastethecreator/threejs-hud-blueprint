import type {
  HudScaleMode,
  IntegerDownscalePolicy,
  ReadonlyInsets,
  ReadonlyPoint,
  ReadonlySize,
} from "../contracts/geometry.js";
import { zeroInsets } from "../contracts/geometry.js";
import { HudError } from "../contracts/errors.js";
import { DirtyFlag } from "./DirtyFlags.js";
import type { HUD } from "./HUD.js";
import { HudNode, type HudNodeOptions } from "./HudNode.js";

export type HudLayerOptions = HudNodeOptions &
  Readonly<{
    referenceSize: ReadonlySize;
    scaleMode?: HudScaleMode;
    zoom?: number;
    zoomAnchor?: ReadonlyPoint;
    pixelSnap?: boolean;
    integerDownscale?: IntegerDownscalePolicy;
    safeInsets?: ReadonlyInsets;
    order?: number;
    enabled?: boolean;
  }>;

export class HudLayer extends HudNode {
  referenceSize: ReadonlySize;
  scaleMode: HudScaleMode;
  zoom: number;
  zoomAnchor: ReadonlyPoint;
  pixelSnap: boolean;
  integerDownscale: IntegerDownscalePolicy;
  safeInsets: ReadonlyInsets;
  order: number;
  enabled: boolean;
  owner: HUD | null = null;

  constructor(options: HudLayerOptions) {
    super(options);
    this.referenceSize = Object.freeze({ ...options.referenceSize });
    this.scaleMode = options.scaleMode ?? "contain";
    this.zoom = options.zoom ?? 1;
    this.zoomAnchor = Object.freeze({
      x: options.zoomAnchor?.x ?? 0.5,
      y: options.zoomAnchor?.y ?? 0.5,
    });
    this.pixelSnap = options.pixelSnap ?? false;
    this.integerDownscale = options.integerDownscale ?? "overflow-1x";
    this.safeInsets = Object.freeze({ ...(options.safeInsets ?? zeroInsets()) });
    this.order = options.order ?? 0;
    this.enabled = options.enabled ?? true;
  }

  setReferenceSize(width: number, height: number): void {
    this.assertAlive();
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new RangeError("referenceSize must be finite and positive.");
    }
    this.referenceSize = Object.freeze({ width, height });
    this.markDirty(DirtyFlag.Layout | DirtyFlag.Transform | DirtyFlag.Queue);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setZoom(zoom: number): void {
    if (!Number.isFinite(zoom) || zoom <= 0) {
      throw new HudError("INVALID_ARGUMENT", "HUD zoom must be a finite positive number.", {
        zoom: Number.isNaN(zoom) ? "NaN" : String(zoom),
      });
    }
    if (this.zoom === zoom) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.zoom = zoom;
    this.markDirty(DirtyFlag.Transform | DirtyFlag.Layout | DirtyFlag.HitTest | DirtyFlag.Queue);
  }

  override processInvalidation(): void {
    if (!this.enabled) return;
    super.processInvalidation();
  }
}
