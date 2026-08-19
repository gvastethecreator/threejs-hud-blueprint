import { describe, expect, it } from "vitest";
import { Slot } from "./Slot.js";

describe("slot", () => {
  it("updates one slot without mutating host data", () => {
    const data = { key: "potion", quantity: 2 };
    const slot = new Slot({ ...data, size: 32 });
    slot.setData({ key: "potion", quantity: 3 });
    expect(data.quantity).toBe(2);
    expect(slot.quantity.text).toBe("3");
    expect(slot.size.width).toBe(32);
  });

  it("hides the icon for empty slots and keeps quantity inside the frame", () => {
    const empty = new Slot({ key: "empty", empty: true, size: 48 });
    expect(empty.icon.opacity).toBe(0);
    const filled = new Slot({ key: "ammo", quantity: 12, size: 48 });
    const host = filled.worldBounds();
    const qty = filled.quantity.worldBounds();
    expect(qty.x).toBeGreaterThanOrEqual(host.x);
    expect(qty.y).toBeGreaterThanOrEqual(host.y);
    expect(qty.x + qty.width).toBeLessThanOrEqual(host.x + host.width + 8);
    expect(qty.y + qty.height).toBeLessThanOrEqual(host.y + host.height + 8);
  });
});
