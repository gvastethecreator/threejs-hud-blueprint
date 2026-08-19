import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { HudImage, type HudTextureHandle } from "../primitives/Image.js";
import { layoutStack } from "../layout/stack.js";
import { Label } from "./Label.js";

export type IconLabelOptions = HudNodeOptions &
  Readonly<{
    text?: string;
    value?: string;
    gap?: number;
    texture?: HudTextureHandle | null;
    iconSize?: number;
    fontSize?: number;
  }>;

export class IconLabel extends HudNode {
  readonly icon: HudImage;
  readonly label: Label;
  readonly valueLabel: Label;
  readonly gap: number;

  constructor(options: IconLabelOptions = {}) {
    super({
      width: options.width ?? 0,
      height: options.height ?? options.iconSize ?? 24,
      ...options,
    });
    this.gap = options.gap ?? 6;
    const iconSize = options.iconSize ?? 24;
    this.icon = this.add(
      new HudImage({
        id: `${this.id}-icon`,
        width: iconSize,
        height: iconSize,
        ...(options.texture ? { texture: options.texture } : {}),
      }),
    );
    this.label = this.add(
      new Label({
        id: `${this.id}-label`,
        text: options.text ?? "",
        fontSize: options.fontSize ?? 14,
      }),
    );
    this.valueLabel = this.add(
      new Label({
        id: `${this.id}-value`,
        text: options.value ?? "",
        fontSize: options.fontSize ?? 14,
      }),
    );
    this.relayout();
  }

  setText(text: string): void {
    this.label.setText(text);
    this.relayout();
  }

  setValue(value: string): void {
    this.valueLabel.setText(value);
    this.relayout();
  }

  relayout(): void {
    this.valueLabel.setLayoutVisibility(this.valueLabel.text ? "participate" : "collapse");
    layoutStack([this.icon, this.label, this.valueLabel], {
      direction: "horizontal",
      gap: this.gap,
      x: 0,
      y: 0,
      align: "center",
    });
    const width =
      this.icon.size.width +
      this.gap +
      this.label.size.width +
      (this.valueLabel.text ? this.gap + this.valueLabel.size.width : 0);
    const height = Math.max(
      this.icon.size.height,
      this.label.size.height,
      this.valueLabel.size.height,
    );
    this.setSize(width, height);
  }
}
