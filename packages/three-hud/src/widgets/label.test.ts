import { describe, expect, it } from "vitest";
import { Label } from "./Label.js";

describe("label", () => {
  it("remeasures when text changes and keeps backend-agnostic props", () => {
    const label = new Label({ text: "HP", fontSize: 10 });
    const width = label.size.width;
    expect(width).toBeGreaterThan(0);
    label.setText("HEALTH");
    expect(label.size.width).toBeGreaterThan(width);
    label.fontId = "pixel";
    expect(label.text).toBe("HEALTH");
  });
});
