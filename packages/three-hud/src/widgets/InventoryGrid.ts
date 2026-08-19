import { HudNode, type HudNodeOptions } from "../core/HudNode.js";
import { layoutGrid } from "../layout/grid.js";
import { Slot, type SlotData } from "./Slot.js";

export type InventoryGridOptions = HudNodeOptions &
  Readonly<{
    columns: number;
    rows: number;
    cellSize?: number;
    gap?: number;
    items?: readonly SlotData[];
    onActivate?: (key: string) => void;
  }>;

export class InventoryGrid extends HudNode {
  readonly columns: number;
  readonly rows: number;
  readonly cellSize: number;
  readonly gap: number;
  readonly slots: Slot[] = [];
  readonly onActivate: ((key: string) => void) | undefined;
  private items: readonly SlotData[];

  constructor(options: InventoryGridOptions) {
    const cell = options.cellSize ?? 48;
    const gap = options.gap ?? 4;
    const width = options.columns * cell + (options.columns - 1) * gap;
    const height = options.rows * cell + (options.rows - 1) * gap;
    super({ width, height, fill: options.fill ?? 0x101820, ...options });
    this.columns = options.columns;
    this.rows = options.rows;
    this.cellSize = cell;
    this.gap = gap;
    this.items = options.items ?? [];
    this.onActivate = options.onActivate;
    const capacity = this.columns * this.rows;
    for (let index = 0; index < capacity; index += 1) {
      const data = this.items[index] ?? { key: `empty-${index}`, empty: true };
      this.slots.push(
        this.add(new Slot({ id: `${this.id}-slot-${data.key}`, ...data, size: cell })),
      );
    }
    this.relayout();
  }

  setItems(items: readonly SlotData[]): void {
    this.items = items;
    const used = new Map(this.slots.map((slot) => [slot.key, slot]));
    for (let index = 0; index < this.slots.length; index += 1) {
      const data = items[index] ?? { key: `empty-${index}`, empty: true };
      const existing = used.get(data.key) ?? this.slots[index];
      if (!existing) continue;
      existing.setData(data);
      this.slots[index] = existing;
    }
    this.relayout();
  }

  activate(key: string): void {
    this.onActivate?.(key);
  }

  private relayout(): void {
    layoutGrid(this.slots, {
      columns: this.columns,
      rows: this.rows,
      cellWidth: this.cellSize,
      cellHeight: this.cellSize,
      gapX: this.gap,
      gapY: this.gap,
    });
  }
}
