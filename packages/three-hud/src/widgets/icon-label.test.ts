import { describe, expect, it } from "vitest";
import { IconLabel } from "./IconLabel.js";

describe("icon-label", () => {
  it("includes icon, gap, and text in intrinsic size", () => {
    const icon = new IconLabel({ text: "Ammo", value: "18", iconSize: 20, gap: 6 });
    expect(icon.size.width).toBeGreaterThan(20 + 6);
    expect(icon.size.height).toBeGreaterThanOrEqual(20);
    icon.dispose();
  });
});
