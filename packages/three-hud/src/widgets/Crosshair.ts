import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { Ring } from "../primitives/Ring.js";

export type CrosshairOptions = HudNodeOptions &
  Readonly<{
    gap?: number;
    length?: number;
    thickness?: number;
    spread?: number;
    recoil?: number;
    dot?: boolean;
    ring?: boolean;
    brackets?: boolean;
  }>;

export class Crosshair extends HudNode {
  readonly horizontal: HudNode;
  readonly vertical: HudNode;
  readonly left: HudNode;
  readonly right: HudNode;
  readonly top: HudNode;
  readonly bottom: HudNode;
  readonly dot: HudNode;
  readonly ring: Ring;
  readonly brackets: HudNode[] = [];
  gap: number;
  length: number;
  thickness: number;
  spread: number;
  recoil: number;

  constructor(options: CrosshairOptions = {}) {
    const gap = options.gap ?? 4;
    const length = options.length ?? 10;
    const thickness = options.thickness ?? 2;
    const spread = options.spread ?? 0;
    const extent = Math.max(24, 2 * (gap + spread + length) + thickness);
    super({ width: extent, height: extent, fill: 0x000000, ...options });
    this.opacity = 1;
    this.gap = gap;
    this.length = length;
    this.thickness = thickness;
    this.spread = spread;
    this.recoil = options.recoil ?? 0;
    this.left = this.add(
      new HudNode({ id: `${this.id}-left`, width: length, height: thickness, fill: 0xe8f6ff }),
    );
    this.right = this.add(
      new HudNode({ id: `${this.id}-right`, width: length, height: thickness, fill: 0xe8f6ff }),
    );
    this.top = this.add(
      new HudNode({ id: `${this.id}-top`, width: thickness, height: length, fill: 0xe8f6ff }),
    );
    this.bottom = this.add(
      new HudNode({ id: `${this.id}-bottom`, width: thickness, height: length, fill: 0xe8f6ff }),
    );
    this.horizontal = this.right;
    this.vertical = this.bottom;
    this.dot = this.add(
      new HudNode({
        id: `${this.id}-dot`,
        width: 3,
        height: 3,
        fill: 0xe8f6ff,
        visible: options.dot !== false,
      }),
    );
    this.ring = this.add(
      new Ring({
        id: `${this.id}-ring`,
        outerRadius: 8,
        innerRadius: 6,
        fill: 0xe8f6ff,
        visible: options.ring === true,
      }),
    );
    if (options.brackets === true) {
      for (const name of ["tl", "tr", "bl", "br"] as const) {
        this.brackets.push(
          this.add(
            new HudNode({
              id: `${this.id}-bracket-${name}-h`,
              width: 6,
              height: this.thickness,
              fill: 0xe8f6ff,
            }),
          ),
          this.add(
            new HudNode({
              id: `${this.id}-bracket-${name}-v`,
              width: this.thickness,
              height: 6,
              fill: 0xe8f6ff,
            }),
          ),
        );
      }
    }
    this.sync();
  }

  setHit(hit: boolean): void {
    const fill = hit ? 0xff6688 : 0xe8f6ff;
    this.left.fill = fill;
    this.right.fill = fill;
    this.top.fill = fill;
    this.bottom.fill = fill;
    this.dot.fill = fill;
    this.ring.fill = fill;
    this.markDirty(DirtyFlag.Style);
  }

  setSpread(spread: number): void {
    this.spread = spread;
    this.sync();
    this.markDirty(DirtyFlag.Transform);
  }

  setRecoil(recoil: number): void {
    this.recoil = recoil;
    this.sync();
    this.markDirty(DirtyFlag.Transform);
  }

  private sync(): void {
    const offset = this.gap + this.spread;
    const center = this.size.width / 2;
    const half = this.thickness / 2;
    const rec = this.recoil;
    this.right.setSize(this.length, this.thickness);
    this.left.setSize(this.length, this.thickness);
    this.top.setSize(this.thickness, this.length);
    this.bottom.setSize(this.thickness, this.length);
    this.right.setPosition(center + offset, center - half + rec);
    this.left.setPosition(center - offset - this.length, center - half + rec);
    this.bottom.setPosition(center - half, center + offset + rec);
    this.top.setPosition(center - half, center - offset - this.length + rec);
    this.dot.setPosition(center - 1.5, center - 1.5 + rec);
    this.ring.setPosition(center - 8, center - 8 + rec);
    if (this.brackets.length === 8) {
      const inset = 2;
      const far = this.size.width - inset - 6;
      const pairs: Array<readonly [number, number, number, number]> = [
        [inset, inset, inset, inset],
        [far, inset, this.size.width - inset - this.thickness, inset],
        [inset, this.size.height - inset - this.thickness, inset, far],
        [
          far,
          this.size.height - inset - this.thickness,
          this.size.width - inset - this.thickness,
          far,
        ],
      ];
      for (let index = 0; index < 4; index += 1) {
        const pair = pairs[index];
        const horizontal = this.brackets[index * 2];
        const vertical = this.brackets[index * 2 + 1];
        if (!pair || !horizontal || !vertical) continue;
        horizontal.setPosition(pair[0], pair[1] + rec);
        vertical.setPosition(pair[2], pair[3] + rec);
      }
    }
  }
}

export class Reticle extends Crosshair {
  constructor(options: CrosshairOptions = {}) {
    super({ ...options, ring: options.ring ?? true, brackets: options.brackets ?? true });
  }
}
