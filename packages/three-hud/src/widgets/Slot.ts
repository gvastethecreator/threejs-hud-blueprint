import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { HudImage, type HudTextureHandle } from "../primitives/Image.js";
import { Ring } from "../primitives/Ring.js";
import { applyStyle, DEFAULT_THEME, resolveWidgetStyle } from "../theme/theme.js";
import { Label } from "./Label.js";

export type SlotData = Readonly<{
  key: string;
  quantity?: number;
  cooldown?: number;
  disabled?: boolean;
  empty?: boolean;
  texture?: HudTextureHandle;
}>;

export class Slot extends HudNode {
  key: string;
  selected = false;
  readonly icon: HudImage;
  readonly quantity: Label;
  readonly cooldown: Ring;
  readonly frame: HudNode;

  constructor(options: HudNodeOptions & SlotData & { size?: number } = { key: "empty" }) {
    const size = options.size ?? 48;
    super({ width: size, height: size, fill: options.fill ?? 0x1c2c3c, ...options });
    this.key = options.key;
    this.frame = this.add(
      new HudNode({
        id: `${this.id}-frame`,
        width: Math.max(1, size - 4),
        height: Math.max(1, size - 4),
        fill: 0x2a3d52,
      }),
    );
    this.frame.setPosition(2, 2);
    this.icon = this.add(
      new HudImage({
        id: `${this.id}-icon`,
        width: size - 8,
        height: size - 8,
        ...(options.texture ? { texture: options.texture } : {}),
      }),
    );
    this.icon.setPosition(4, 4);
    this.quantity = this.add(
      new Label({
        id: `${this.id}-qty`,
        text: options.quantity ? String(options.quantity) : "",
        fontSize: 14,
      }),
    );
    this.quantity.setPosition(size - 16, size - 14);
    this.cooldown = this.add(
      new Ring({
        id: `${this.id}-cd`,
        outerRadius: size / 2 - 2,
        innerRadius: size / 2 - 6,
        value: options.cooldown ?? 0,
        max: 1,
        fill: 0x000000,
      }),
    );
    this.cooldown.opacity = options.cooldown ? 0.45 : 0;
    if (options.disabled === true) this.setDisabled(true);
    if (options.empty === true) this.icon.opacity = 0;
  }

  setSelected(selected: boolean): void {
    if (this.selected === selected) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.selected = selected;
    applyStyle(
      this.frame,
      resolveWidgetStyle(DEFAULT_THEME, "Slot", {
        selected,
        hovered: false,
        disabled: this.disabled,
      }),
    );
    this.markDirty(DirtyFlag.Style);
  }

  setData(data: SlotData): void {
    this.key = data.key;
    this.quantity.setText(data.quantity ? String(data.quantity) : "");
    this.cooldown.value = data.cooldown ?? 0;
    this.cooldown.opacity = data.cooldown ? 0.45 : 0;
    if (data.texture) this.icon.setTexture(data.texture);
    this.icon.opacity = data.empty === true ? 0 : 1;
    if (data.disabled !== undefined) this.setDisabled(data.disabled);
    this.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
  }
}
