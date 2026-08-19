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
});
