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
  }>;

export class Crosshair extends HudNode {
  readonly horizontal: HudNode;
  readonly vertical: HudNode;
  readonly dot: HudNode;
  readonly ring: Ring;
  gap: number;
  length: number;
  thickness: number;
  spread: number;
  recoil: number;

  constructor(options: CrosshairOptions = {}) {
    super({ width: 24, height: 24, fill: 0x000000, ...options });
    this.opacity = 1;
    this.gap = options.gap ?? 4;
    this.length = options.length ?? 10;
    this.thickness = options.thickness ?? 2;
    this.spread = options.spread ?? 0;
    this.recoil = options.recoil ?? 0;
    this.horizontal = this.add(
      new HudNode({ id: `${this.id}-h`, width: 24, height: this.thickness, fill: 0xe8f6ff }),
    );
    this.vertical = this.add(
      new HudNode({ id: `${this.id}-v`, width: this.thickness, height: 24, fill: 0xe8f6ff }),
    );
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
    this.sync();
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
    this.horizontal.setPosition(0, 11 + this.recoil);
    this.vertical.setPosition(11, this.recoil);
    this.dot.setPosition(10.5, 10.5 + this.recoil);
    this.ring.setPosition(4, 4 + this.recoil);
    void offset;
  }
}
