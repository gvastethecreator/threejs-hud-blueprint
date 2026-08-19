import { describe, expect, it } from "vitest";
import { listWindfoilMatrixScenarios, runWindfoilEvidenceMatrix } from "./windfoil.js";

describe("visual:windfoil matrix", () => {
  it("covers DPR, zoom, clipping, dynamic counter, and 2000-glyph panel without fonts", () => {
    const records = runWindfoilEvidenceMatrix();
    const ids = new Set(records.map((record) => record.id));
    expect(ids.has("minification-0.125")).toBe(true);
    expect(ids.has("dynamic-counter")).toBe(true);
    expect(ids.has("static-panel-2000")).toBe(true);
    expect(ids.has("clip-intersect")).toBe(true);
    expect(ids.has("blank-glyph")).toBe(true);
    expect(records.some((record) => record.config.dpr === 3)).toBe(true);
    expect(records.some((record) => record.config.zoom === 16)).toBe(true);
    const panel = records.find((record) => record.id === "static-panel-2000");
    expect(panel?.metrics.instanceCount).toBe(2000);
    expect(panel?.metrics.uniqueGlyphCount).toBe(1);
    expect(panel?.metrics.reusedInstanceCount).toBe(1999);
    expect(
      records.every((record) => record.metrics.warmEncodeMs <= record.metrics.coldEncodeMs + 50),
    ).toBe(true);
    expect(records.find((record) => record.id === "minification-0.125")?.artifactClass).toBe(
      "minification-risk",
    );
    expect(listWindfoilMatrixScenarios().length).toBe(records.length);
  });
});
