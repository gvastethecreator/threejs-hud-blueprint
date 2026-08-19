import { describe, expect, it } from "vitest";
import { budgetDelta, measureShowcase, runPrimitiveScenarios } from "./primitiveScenarios.js";

describe("primitive-regression", () => {
  it("covers every public primitive with a positive and an edge scenario", () => {
    const scenarios = runPrimitiveScenarios("webgl");
    const names = ["Rect", "RoundedRect", "Line", "Image", "NineSlice", "Ring", "Arc"];
    for (const name of names) {
      expect(
        scenarios.some((scenario) => scenario.primitive === name && scenario.kind === "positive"),
      ).toBe(true);
      expect(
        scenarios.some((scenario) => scenario.primitive === name && scenario.kind === "edge"),
      ).toBe(true);
    }
  });

  it("fails budget verification with a readable delta when limits are exceeded", () => {
    const measured = measureShowcase("webgl");
    expect(budgetDelta(measured)).toEqual([]);
    const over = budgetDelta(measured, {
      maxDrawCalls: 0,
      maxBatches: 0,
      maxGeometries: 0,
      maxMaterials: 0,
      maxAllocations: 0,
    });
    expect(over.join("\n")).toMatch(/drawCalls \d+ > 0/);
    expect(measured.drawCalls).toBe(measured.batches);
  });
});
