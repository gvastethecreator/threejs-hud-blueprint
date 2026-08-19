import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { layoutStack } from "../layout/stack.js";
import { Label } from "./Label.js";
import { Slot, type SlotData } from "./Slot.js";

export type HotbarOptions = HudNodeOptions &
  Readonly<{
    slots?: readonly SlotData[];
    activeIndex?: number;
    orientation?: "horizontal" | "vertical";
    reversed?: boolean;
    cellSize?: number;
    gap?: number;
    onActivate?: (key: string, index: number) => void;
  }>;

export class Hotbar extends HudNode {
  readonly slots: Slot[] = [];
  readonly shortcuts: Label[] = [];
  readonly selection: HudNode;
  activeIndex: number;
  readonly orientation: "horizontal" | "vertical";
  readonly onActivate: ((key: string, index: number) => void) | undefined;
  private readonly cellSize: number;
  private readonly gap: number;

  constructor(options: HotbarOptions = {}) {
    const cell = options.cellSize ?? 48;
    const gap = options.gap ?? 6;
    const count = options.slots?.length ?? 6;
    const orientation = options.orientation ?? "horizontal";
    const main = count * cell + (count - 1) * gap;
    super({
      width: orientation === "horizontal" ? main : cell,
      height: orientation === "horizontal" ? cell : main,
      fill: options.fill ?? 0x101820,
      ...options,
    });
    this.orientation = orientation;
    this.cellSize = cell;
    this.gap = gap;
    this.activeIndex = options.activeIndex ?? 0;
    this.onActivate = options.onActivate;
    const items =
      options.slots ??
      Array.from({ length: count }, (_, index) => ({ key: `hot-${index}`, empty: true as const }));
    const ordered = options.reversed === true ? [...items].reverse() : items;
    this.selection = this.add(
      new HudNode({
        id: `${this.id}-selection`,
        width: cell + 4,
        height: cell + 4,
        fill: 0x4aa3ff,
      }),
    );
    for (let index = 0; index < ordered.length; index += 1) {
      const data = ordered[index] ?? { key: `hot-${index}`, empty: true };
      const slot = this.add(new Slot({ id: `${this.id}-${data.key}`, ...data, size: cell }));
      const shortcut = this.add(
        new Label({ id: `${this.id}-key-${index}`, text: String(index + 1), fontSize: 10 }),
      );
      this.slots.push(slot);
      this.shortcuts.push(shortcut);
    }
    this.relayout();
    this.setActiveIndex(this.activeIndex);
  }

  setActiveIndex(index: number): void {
    const next = Math.max(0, Math.min(this.slots.length - 1, index));
    const previous = this.slots[this.activeIndex];
    const current = this.slots[next];
    previous?.setSelected(false);
    current?.setSelected(true);
    this.activeIndex = next;
    if (current) this.selection.setPosition(current.position.x - 2, current.position.y - 2);
    this.markDirty(DirtyFlag.Style | DirtyFlag.Transform);
  }

  activate(index = this.activeIndex): void {
    const slot = this.slots[index];
    if (!slot) return;
    this.setActiveIndex(index);
    this.onActivate?.(slot.key, index);
  }

  private relayout(): void {
    layoutStack(this.slots, { direction: this.orientation, gap: this.gap, x: 0, y: 0 });
    for (let index = 0; index < this.slots.length; index += 1) {
      const slot = this.slots[index];
      const shortcut = this.shortcuts[index];
      if (!slot || !shortcut) continue;
      shortcut.setPosition(slot.position.x + 4, slot.position.y + 2);
    }
    const active = this.slots[this.activeIndex];
    if (active) this.selection.setPosition(active.position.x - 2, active.position.y - 2);
  }
}
