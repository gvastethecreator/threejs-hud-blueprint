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
  readonly segmentFills: HudNode[] = [];

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
    this.segments = Math.max(1, Math.floor(options.segments ?? 1));
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
    if (this.segments > 1) {
      for (let index = 0; index < this.segments; index += 1) {
        this.segmentFills.push(
          this.add(
            new HudNode({
              id: `${this.id}-seg-${index}`,
              height: this.size.height,
              fill: 0x3dff8a,
            }),
          ),
        );
      }
    }
    this.labelNode = this.add(
      new Label({ id: `${this.id}-label`, text: options.label ?? "", fontSize: 12 }),
    );
    this.syncFill();
    this.labelNode.setPosition(
      8,
      Math.max(0, (this.size.height - this.labelNode.size.height) / 2),
    );
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

  setFills(
    colors: Readonly<{
      track?: number;
      value?: number;
      delayed?: number;
      label?: number;
    }>,
  ): void {
    if (colors.track !== undefined) {
      this.fill = colors.track;
      this.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
    }
    if (colors.value !== undefined) {
      this.fillNode.fill = colors.value;
      this.fillNode.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
      for (const segment of this.segmentFills) {
        segment.fill = colors.value;
        segment.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
      }
    }
    if (colors.delayed !== undefined) {
      this.delayedNode.fill = colors.delayed;
      this.delayedNode.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
    }
    if (colors.label !== undefined) this.labelNode.color = colors.label;
    this.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
  }

  private syncFill(): void {
    const span = this.max - this.min;
    const ratio = span === 0 ? 0 : (this.value - this.min) / span;
    const delayedRatio = span === 0 ? 0 : (this.delayedValue - this.min) / span;
    const main = this.orientation === "horizontal" ? this.size.width : this.size.height;
    const cross = this.orientation === "horizontal" ? this.size.height : this.size.width;
    const fillMain = main * ratio;
    const delayedMain = main * delayedRatio;
    this.placeSpan(this.delayedNode, delayedMain, main, cross);
    if (this.segments <= 1) {
      this.fillNode.opacity = 1;
      this.placeSpan(this.fillNode, fillMain, main, cross);
      return;
    }
    this.fillNode.opacity = 0;
    this.placeSpan(this.fillNode, 0, main, cross);
    const gapTotal = this.gap * Math.max(0, this.segments - 1);
    const segMain = (main - gapTotal) / this.segments;
    const filledUnits = ratio * this.segments;
    for (let index = 0; index < this.segments; index += 1) {
      const segment = this.segmentFills[index];
      if (!segment) continue;
      const visible = Math.min(1, Math.max(0, filledUnits - index));
      const length = segMain * visible;
      const slot = this.reverse ? this.segments - 1 - index : index;
      const origin = slot * (segMain + this.gap);
      this.placeAt(segment, origin, length, main, cross);
    }
  }

  private placeSpan(node: HudNode, length: number, main: number, cross: number): void {
    const origin = this.reverse ? main - length : 0;
    this.placeAt(node, origin, length, main, cross);
  }

  private placeAt(
    node: HudNode,
    origin: number,
    length: number,
    main: number,
    cross: number,
  ): void {
    if (this.orientation === "horizontal") {
      node.setSize(length, cross, DirtyFlag.Geometry | DirtyFlag.HitTest | DirtyFlag.Queue);
      node.setPosition(origin, 0);
    } else {
      node.setSize(cross, length, DirtyFlag.Geometry | DirtyFlag.HitTest | DirtyFlag.Queue);
      node.setPosition(0, this.reverse ? origin : main - origin - length);
    }
  }
}
