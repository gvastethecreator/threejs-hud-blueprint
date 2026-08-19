import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { Ring, type RingDirection } from "../primitives/Ring.js";
import { Label } from "./Label.js";

export type RadialBarOptions = HudNodeOptions &
  Readonly<{
    value?: number;
    min?: number;
    max?: number;
    startAngle?: number;
    sweep?: number;
    direction?: RingDirection;
    innerRadius?: number;
    outerRadius?: number;
  }>;

export class RadialBar extends HudNode {
  value: number;
  min: number;
  max: number;
  readonly track: Ring;
  readonly fillRing: Ring;
  readonly label: Label;

  constructor(options: RadialBarOptions = {}) {
    super({
      width: options.width ?? 96,
      height: options.height ?? 96,
      fill: options.fill ?? 0x2a3a4d,
      ...options,
    });
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.value = options.value ?? 0;
    const outer = options.outerRadius ?? this.size.width / 2;
    const ringBase = {
      innerRadius: options.innerRadius ?? outer * 0.7,
      outerRadius: outer,
      fill: this.fill,
      ...(options.startAngle !== undefined ? { startAngle: options.startAngle } : {}),
      ...(options.sweep !== undefined ? { sweep: options.sweep } : {}),
      ...(options.direction !== undefined ? { direction: options.direction } : {}),
    };
    this.track = this.add(new Ring({ id: `${this.id}-track`, ...ringBase }));
    this.fillRing = this.add(
      new Ring({
        id: `${this.id}-fill`,
        ...ringBase,
        fill: 0x3dff8a,
        min: this.min,
        max: this.max,
        value: this.value,
      }),
    );
    this.label = this.add(
      new Label({ id: `${this.id}-label`, text: String(this.value), fontSize: 12 }),
    );
  }

  ratio(): number {
    const span = this.max - this.min;
    return span === 0 ? 0 : (this.value - this.min) / span;
  }

  setValue(value: number): void {
    this.value = value;
    this.fillRing.value = value;
    this.label.text = String(value);
    this.markDirty(DirtyFlag.Geometry | DirtyFlag.Style);
  }
}
