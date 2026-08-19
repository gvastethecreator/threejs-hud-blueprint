import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import type { ReadonlyInsets } from "../contracts/geometry.js";
import { zeroInsets } from "../contracts/geometry.js";
import { RoundedRect } from "../primitives/RoundedRect.js";
import { setLayoutProps } from "../layout/box.js";
import { layoutStack } from "../layout/stack.js";

export type PanelOptions = HudNodeOptions &
  Readonly<{
    padding?: ReadonlyInsets;
    radius?: number;
    clip?: boolean;
  }>;

export class Panel extends HudNode {
  readonly background: RoundedRect;
  readonly content: HudNode;
  readonly padding: ReadonlyInsets;

  constructor(options: PanelOptions = {}) {
    super({
      width: options.width ?? 320,
      height: options.height ?? 180,
      fill: options.fill ?? 0x1a2433,
      ...options,
    });
    this.padding = options.padding ?? { top: 8, right: 8, bottom: 8, left: 8 };
    this.background = this.add(
      new RoundedRect({
        id: `${this.id}-bg`,
        width: this.size.width,
        height: this.size.height,
        fill: this.fill,
        radius: options.radius ?? 8,
      }),
    );
    this.content = this.add(
      new HudNode({
        id: `${this.id}-content`,
        width: Math.max(0, this.size.width - this.padding.left - this.padding.right),
        height: Math.max(0, this.size.height - this.padding.top - this.padding.bottom),
        fill: 0x000000,
      }),
    );
    this.content.setPosition(this.padding.left, this.padding.top);
    setLayoutProps(this, {
      padding: this.padding,
      clip: options.clip === true,
      width: this.size.width,
      height: this.size.height,
    });
    if (options.clip === true)
      this.setClip({
        x: this.position.x,
        y: this.position.y,
        width: this.size.width,
        height: this.size.height,
      });
  }

  layoutChildren(direction: "horizontal" | "vertical" = "vertical", gap = 8): void {
    layoutStack(this.content.children, {
      direction,
      gap,
      padding: zeroInsets(),
      x: this.content.position.x,
      y: this.content.position.y,
      width: this.content.size.width,
      height: this.content.size.height,
    });
  }
}
