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
