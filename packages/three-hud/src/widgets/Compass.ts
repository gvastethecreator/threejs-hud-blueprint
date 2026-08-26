import { DirtyFlag } from "../core/DirtyFlags.js";
import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { Line } from "../primitives/Line.js";
import { Ring } from "../primitives/Ring.js";
import { Label } from "./Label.js";

export type CompassOptions = HudNodeOptions &
  Readonly<{
    heading?: number;
    fontId?: string;
  }>;

const CARDINALS = ["N", "E", "S", "W"] as const;

export class Compass extends HudNode {
  heading: number;
  readonly bezel: Ring;
  readonly rose: Ring;
  readonly needle: Line;
  readonly hub: HudNode;
  readonly headingLabel: Label;
  readonly marks: Label[] = [];

  constructor(options: CompassOptions = {}) {
    const size = options.width ?? options.height ?? 104;
    super({
      ...options,
      width: size,
      height: size,
      fill: 0x000000,
    });
    this.heading = options.heading ?? 0;
    const cx = size / 2;
    const cy = size / 2;
    this.bezel = this.add(
      new Ring({
        id: `${this.id}-bezel`,
        outerRadius: size / 2 - 1,
        innerRadius: size / 2 - 4,
        startAngle: -Math.PI / 2,
        sweep: Math.PI * 2,
        ticks: 12,
        fill: 0xffffff,
      }),
    );
    this.rose = this.add(
      new Ring({
        id: `${this.id}-rose`,
        outerRadius: size / 2 - 10,
        innerRadius: size / 2 - 12,
        startAngle: -Math.PI / 2,
        sweep: Math.PI * 2,
        ticks: 4,
        fill: 0x888888,
      }),
    );
    this.needle = this.add(
      new Line({
        id: `${this.id}-needle`,
        x1: cx,
        y1: cy,
        x2: cx,
        y2: 14,
        strokeWidth: 2,
        fill: 0xffffff,
      }),
    );
    this.hub = this.add(
      new HudNode({
        id: `${this.id}-hub`,
        width: 4,
        height: 4,
        fill: 0xffffff,
      }),
    );
    this.hub.setPosition(cx - 2, cy - 2);
    const fontId = options.fontId ?? "pixel";
    for (const name of CARDINALS) {
      this.marks.push(
        this.add(
          new Label({
            id: `${this.id}-${name}`,
            text: name,
            fontId,
            fontSize: 11,
            color: 0xffffff,
          }),
        ),
      );
    }
    this.headingLabel = this.add(
      new Label({
        id: `${this.id}-face`,
        text: "N",
        fontId,
        fontSize: 12,
        color: 0xffffff,
      }),
    );
    this.sync();
  }

  setHeading(radians: number): void {
    if (!Number.isFinite(radians)) throw new RangeError("heading must be finite.");
    this.heading = radians;
    this.sync();
    this.markDirty(DirtyFlag.Transform | DirtyFlag.Style);
  }

  override setSize(
    width: number,
    height: number,
    dirty: DirtyFlag = DirtyFlag.Layout | DirtyFlag.Geometry,
  ): void {
    super.setSize(width, height, dirty);
    const size = Math.min(width, height);
    this.bezel.outerRadius = size / 2 - 1;
    this.bezel.innerRadius = size / 2 - 3;
    this.rose.outerRadius = Math.max(6, size / 2 - 8);
    this.rose.innerRadius = Math.max(4, size / 2 - 10);
    this.bezel.setSize(size, size);
    this.rose.setSize(size, size);
    this.sync();
  }

  setColor(ink: number, muted = 0x888888): void {
    this.bezel.fill = ink;
    this.rose.fill = muted;
    this.needle.fill = ink;
    this.hub.fill = ink;
    this.headingLabel.color = ink;
    for (const mark of this.marks) mark.color = ink;
    this.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
  }

  syncMarks(): void {
    this.headingLabel.remeasure();
    for (const mark of this.marks) mark.remeasure();
    this.sync();
  }

  private sync(): void {
    const cx = this.size.width / 2;
    const cy = this.size.height / 2;
    const compact = this.size.width < 72;
    const length = Math.max(8, this.size.height / 2 - (compact ? 10 : 20));
    this.needle.setEndpoints(
      cx,
      cy,
      cx + Math.sin(this.heading) * length,
      cy - Math.cos(this.heading) * length,
    );
    const north = this.marks[0];
    const east = this.marks[1];
    const south = this.marks[2];
    const west = this.marks[3];
    if (north) north.setPosition(cx - north.size.width / 2, 2);
    if (east)
      east.setPosition(this.size.width - east.size.width - 3, cy - east.size.height / 2);
    if (south)
      south.setPosition(cx - south.size.width / 2, this.size.height - south.size.height - 2);
    if (west) west.setPosition(3, cy - west.size.height / 2);
    for (const mark of this.marks) mark.visible = !compact;
    const deg = ((this.heading * 180) / Math.PI + 3600) % 360;
    const face = deg >= 315 || deg < 45 ? "N" : deg < 135 ? "E" : deg < 225 ? "S" : "W";
    this.headingLabel.setText(face);
    this.hub.setPosition(cx - this.hub.size.width / 2, cy - this.hub.size.height / 2);
    this.headingLabel.visible = false;
    this.headingLabel.setPosition(
      cx - this.headingLabel.size.width / 2,
      cy + 6,
    );
  }
}
