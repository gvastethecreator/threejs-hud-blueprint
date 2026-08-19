import { describe, expect, it } from "vitest";
import { Hotbar } from "./Hotbar.js";

describe("hotbar", () => {
  it("moves selection visuals between slots without owning keyboard listeners", () => {
    const keys: string[] = [];
    const bar = new Hotbar({
      slots: [{ key: "gun" }, { key: "med" }, { key: "nade" }],
      onActivate: (key) => keys.push(key),
    });
    bar.setActiveIndex(2);
    expect(bar.slots[2]?.selected).toBe(true);
    expect(bar.slots[0]?.selected).toBe(false);
    bar.activate(1);
    expect(keys).toEqual(["med"]);
    expect(bar.selection.position.x).toBe(bar.slots[1]!.position.x - 2);
  });

  it("does not double-count slot positions when walking frame world bounds", () => {
    const bar = new Hotbar({
      slots: [{ key: "gun" }, { key: "med" }, { key: "nade" }],
    });
    bar.setPosition(100, 40);
    const last = bar.slots[2];
    expect(last).toBeDefined();
    if (!last) return;
    const host = last.worldBounds();
    const frame = last.frame.worldBounds();
    expect(frame.x).toBeGreaterThanOrEqual(host.x);
    expect(frame.x + frame.width).toBeLessThanOrEqual(host.x + host.width);
    expect(host.x).toBeGreaterThan(bar.position.x);
  });
});
