import { describe, expect, it } from "vitest";
import { InventoryGrid } from "./InventoryGrid.js";

describe("inventory-grid", () => {
  it("reuses slots by stable key when data is reordered", () => {
    const grid = new InventoryGrid({
      columns: 2,
      rows: 2,
      items: [
        { key: "a", quantity: 1 },
        { key: "b", quantity: 2 },
      ],
    });
    const first = grid.slots[0];
    grid.setItems([
      { key: "b", quantity: 9 },
      { key: "a", quantity: 1 },
    ]);
    expect(grid.slots.some((slot) => slot === first)).toBe(true);
    expect(grid.slots.find((slot) => slot.key === "b")?.quantity.text).toBe("9");
  });

  it("keeps distinct Slot instances when mixing a new key with a reused key", () => {
    const grid = new InventoryGrid({
      columns: 2,
      rows: 1,
      items: [
        { key: "a", quantity: 1 },
        { key: "b", quantity: 2 },
      ],
    });
    const slotA = grid.slots.find((slot) => slot.key === "a");
    grid.setItems([
      { key: "c", quantity: 4 },
      { key: "a", quantity: 1 },
    ]);
    expect(grid.slots[1]).toBe(slotA);
    expect(grid.slots[0]?.key).toBe("c");
    expect(grid.slots[0]).not.toBe(grid.slots[1]);
    expect(new Set(grid.slots).size).toBe(2);
  });

  it("emits item identity without mutating host inventory data", () => {
    const items = [
      { key: "rifle", quantity: 1 },
      { key: "med", quantity: 3 },
    ] as const;
    const keys: string[] = [];
    const grid = new InventoryGrid({
      columns: 2,
      rows: 1,
      items,
      onActivate: (key) => keys.push(key),
    });
    const first = grid.slots[0];
    grid.activate("rifle");
    expect(keys).toEqual(["rifle"]);
    expect(items[0]?.quantity).toBe(1);
    expect(grid.slots[0]).toBe(first);
  });

  it("keeps slot frames inside the parent slot world bounds", () => {
    const grid = new InventoryGrid({
      columns: 4,
      rows: 2,
      cellSize: 48,
      gap: 4,
      items: [
        { key: "a", quantity: 1 },
        { key: "b", quantity: 2 },
        { key: "c", quantity: 3 },
        { key: "d", quantity: 4 },
      ],
    });
    grid.setPosition(64, 20);
    const slot = grid.slots[3];
    expect(slot).toBeDefined();
    if (!slot) return;
    const host = slot.worldBounds();
    const frame = slot.frame.worldBounds();
    expect(frame.x).toBeGreaterThanOrEqual(host.x);
    expect(frame.y).toBeGreaterThanOrEqual(host.y);
    expect(frame.x + frame.width).toBeLessThanOrEqual(host.x + host.width);
    expect(frame.y + frame.height).toBeLessThanOrEqual(host.y + host.height);
  });
});
