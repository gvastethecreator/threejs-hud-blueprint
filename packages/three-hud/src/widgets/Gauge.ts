import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { Line } from "../primitives/Line.js";
import { Ring } from "../primitives/Ring.js";
import { Label } from "./Label.js";

export type GaugeOptions = HudNodeOptions &
  Readonly<{
    value?: number;
    min?: number;
    max?: number;
    ticks?: number;
    startAngle?: number;
    sweep?: number;
  }>;

export class Gauge extends HudNode {
  value: number;
  min: number;
  max: number;
  readonly face: Ring;
  readonly needle: Line;
  readonly valueLabel: Label;
  readonly tickLabels: Label[] = [];

  constructor(options: GaugeOptions = {}) {
    super({
      ...options,
      width: options.width ?? 128,
      height: options.height ?? 128,
      fill: 0x000000,
    });
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.value = options.value ?? 0;
    const faceFill = options.fill ?? 0x4aa3ff;
    this.face = this.add(
      new Ring({
        id: `${this.id}-face`,
        outerRadius: this.size.width / 2,
        innerRadius: this.size.width / 2 - 14,
        startAngle: options.startAngle ?? -Math.PI * 0.75,
        sweep: options.sweep ?? Math.PI * 1.5,
        ticks: options.ticks ?? 8,
        min: this.min,
        max: this.max,
        value: this.value,
        fill: faceFill,
      }),
    );
    this.needle = this.add(
      new Line({
        id: `${this.id}-needle`,
        x1: this.size.width / 2,
        y1: this.size.height / 2,
        x2: this.size.width / 2,
        y2: 8,
        strokeWidth: 2,
        fill: 0xff6688,
      }),
    );
    this.valueLabel = this.add(
      new Label({ id: `${this.id}-value`, text: String(this.value), fontSize: 12 }),
    );
    const ticks = options.ticks ?? 8;
    for (let index = 0; index < ticks; index += 1) {
      const t = ticks <= 1 ? 0 : index / (ticks - 1);
      this.tickLabels.push(
        this.add(
          new Label({
            id: `${this.id}-tick-${index}`,
            text: String(Math.round(this.min + (this.max - this.min) * t)),
            fontSize: 10,
          }),
        ),
      );
    }
    this.syncMarks();
  }

  syncMarks(): void {
    this.valueLabel.remeasure();
    for (const label of this.tickLabels) label.remeasure();
    this.syncNeedle();
    this.placeTicks();
  }

  setValue(value: number): void {
    const clamped = Math.min(this.max, Math.max(this.min, value));
    this.value = clamped;
    this.face.value = clamped;
    this.valueLabel.setText(String(clamped));
    this.syncMarks();
    this.markDirty(DirtyFlag.Transform | DirtyFlag.Style);
  }

  private placeTicks(): void {
    const cx = this.size.width / 2;
    const cy = this.size.height / 2;
    const ticks = this.tickLabels.length;
    for (const [index, label] of this.tickLabels.entries()) {
      const t = ticks <= 1 ? 0 : index / (ticks - 1);
      const angle = this.face.startAngle + this.face.sweep * t;
      const pad = Math.max(label.size.width, label.size.height) / 2 + 1;
      const radius = Math.max(8, Math.min(this.face.outerRadius - pad, Math.min(cx, cy) - pad));
      label.setPosition(
        cx + Math.cos(angle) * radius - label.size.width / 2,
        cy + Math.sin(angle) * radius - label.size.height / 2,
      );
    }
  }

  private syncNeedle(): void {
    const span = this.max - this.min;
    const ratio = span === 0 ? 0 : (this.value - this.min) / span;
    const angle = this.face.startAngle + this.face.sweep * ratio;
    const cx = this.size.width / 2;
    const cy = this.size.height / 2;
    const length = Math.max(8, this.size.height / 2 - 18);
    this.needle.setEndpoints(cx, cy, cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
    this.valueLabel.setPosition(cx - this.valueLabel.size.width / 2, cy + 8);
  }
}
