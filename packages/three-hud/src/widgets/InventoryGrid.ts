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
    const capacity = this.columns * this.rows;
    const available = new Set(this.slots);
    const next: Array<Slot | null> = Array.from({ length: capacity }, () => null);
    for (let index = 0; index < capacity; index += 1) {
      const data = items[index] ?? { key: `empty-${index}`, empty: true };
      const match = this.slots.find(
        (candidate) => candidate.key === data.key && available.has(candidate),
      );
      if (!match) continue;
      match.setData(data);
      next[index] = match;
      available.delete(match);
    }
    for (let index = 0; index < capacity; index += 1) {
      if (next[index]) continue;
      const data = items[index] ?? { key: `empty-${index}`, empty: true };
      const leftover = available.values().next().value as Slot | undefined;
      if (leftover) {
        leftover.setData(data);
        available.delete(leftover);
        next[index] = leftover;
        continue;
      }
      next[index] = this.add(
        new Slot({ id: `${this.id}-slot-${data.key}-${index}`, ...data, size: this.cellSize }),
      );
    }
    for (const slot of available) this.remove(slot);
    this.slots.length = 0;
    for (const slot of next) if (slot) this.slots.push(slot);
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
