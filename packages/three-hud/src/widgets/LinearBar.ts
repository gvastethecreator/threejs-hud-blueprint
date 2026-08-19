import { DirtyFlag } from "../core/DirtyFlags.js";
import { HudError } from "../contracts/errors.js";
import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { Label } from "./Label.js";

export type LinearBarOptions = HudNodeOptions &
  Readonly<{
    min?: number;
    max?: number;
    value?: number;
    delayedValue?: number;
    orientation?: "horizontal" | "vertical";
    reverse?: boolean;
    segments?: number;
    gap?: number;
    label?: string;
  }>;

export class LinearBar extends HudNode {
  min: number;
  max: number;
  value: number;
  delayedValue: number;
  orientation: "horizontal" | "vertical";
  reverse: boolean;
  segments: number;
  gap: number;
  readonly fillNode: HudNode;
  readonly delayedNode: HudNode;
  readonly labelNode: Label;

  constructor(options: LinearBarOptions = {}) {
    super({
      ...options,
      width: options.width ?? 360,
      height: options.height ?? 28,
      fill: options.fill ?? 0x123044,
    });
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.value = options.value ?? 0;
    this.delayedValue = options.delayedValue ?? this.value;
    this.orientation = options.orientation ?? "horizontal";
    this.reverse = options.reverse ?? false;
    this.segments = options.segments ?? 1;
    this.gap = options.gap ?? 2;
    if (this.min > this.max)
      throw new HudError("INVALID_ARGUMENT", "LinearBar min cannot exceed max.", {
        min: this.min,
        max: this.max,
      });
    this.delayedNode = this.add(
      new HudNode({ id: `${this.id}-delayed`, height: this.size.height, fill: 0xf0c14b }),
    );
    this.fillNode = this.add(
      new HudNode({ id: `${this.id}-fill`, height: this.size.height, fill: 0x3dff8a }),
    );
    this.labelNode = this.add(
      new Label({ id: `${this.id}-label`, text: options.label ?? "", fontSize: 12 }),
    );
    this.syncFill();
  }

  setValue(value: number): void {
    if (!Number.isFinite(value)) throw new RangeError("value must be finite.");
    const next = Math.min(this.max, Math.max(this.min, value));
    if (next === this.value) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.value = next;
    this.syncFill();
  }

  setDelayedValue(value: number): void {
    if (!Number.isFinite(value)) throw new RangeError("delayedValue must be finite.");
    this.delayedValue = Math.min(this.max, Math.max(this.min, value));
    this.syncFill();
  }

  private syncFill(): void {
    const span = this.max - this.min;
    const ratio = span === 0 ? 0 : (this.value - this.min) / span;
    const delayedRatio = span === 0 ? 0 : (this.delayedValue - this.min) / span;
    const main = this.orientation === "horizontal" ? this.size.width : this.size.height;
    const cross = this.orientation === "horizontal" ? this.size.height : this.size.width;
    const fillMain = main * ratio;
    const delayedMain = main * delayedRatio;
    if (this.orientation === "horizontal") {
      this.fillNode.setSize(
        fillMain,
        cross,
        DirtyFlag.Geometry | DirtyFlag.HitTest | DirtyFlag.Queue,
      );
      this.delayedNode.setSize(delayedMain, cross, DirtyFlag.Geometry | DirtyFlag.Queue);
      this.fillNode.setPosition(this.reverse ? main - fillMain : 0, 0);
      this.delayedNode.setPosition(this.reverse ? main - delayedMain : 0, 0);
    } else {
      this.fillNode.setSize(
        cross,
        fillMain,
        DirtyFlag.Geometry | DirtyFlag.HitTest | DirtyFlag.Queue,
      );
      this.delayedNode.setSize(cross, delayedMain, DirtyFlag.Geometry | DirtyFlag.Queue);
      this.fillNode.setPosition(0, this.reverse ? 0 : main - fillMain);
      this.delayedNode.setPosition(0, this.reverse ? 0 : main - delayedMain);
    }
    this.labelNode.setPosition(8, Math.max(0, (this.size.height - this.labelNode.size.height) / 2));
  }
}
