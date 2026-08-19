import { describe, expect, it } from "vitest";
import { createBitmapTextBackend } from "./bitmap.js";
import { createSdfTextBackend } from "./sdf.js";
import type { TextBackend } from "./contracts.js";
import { canonicalGlyphRunFixtures, runTextBackendConformance } from "./textBackendConformance.js";
import { createWindfoilTextBackend } from "./windfoil.js";

class RecordingBackend implements TextBackend {
  readonly id = "mock";
  readonly capabilities = {
    id: "mock",
    rendererKinds: ["webgl", "webgpu"] as const,
    scalableCoverage: true,
    pixelPerfect: false,
    dynamicGlyphs: true,
    colorGlyphs: false,
    rotation: "full" as const,
    deviceLossRecovery: true,
    status: "supported" as const,
  };
  prepared = 0;
  disposedPrepared = 0;
  disposed = 0;
  layouts = 0;

  prepare() {
    this.prepared += 1;
    this.layouts += 1;
    return { id: this.prepared };
  }

  update(prepared: unknown, run: { fontSize: number; text: string; fontId: string }): void {
    if (!prepared) throw new Error("missing prepared resource");
    if (run.fontSize !== 16 || run.text !== "Hello" || run.fontId !== "ui") this.layouts += 1;
  }

  disposePrepared(): void {
    this.disposedPrepared += 1;
  }

  dispose(): void {
    this.disposed += 1;
  }
}

describe("text-backends", () => {
  it("fails a backend that silently ignores a required create operation", () => {
    const ignoring = createBitmapTextBackend();
    const results = runTextBackendConformance(ignoring);
    expect(results.find((result) => result.caseId === "create")?.status).toBe("fail");
  });

  it("avoids relayout on paint-only updates and releases prepared resources", () => {
    const backend = new RecordingBackend();
    const results = runTextBackendConformance(backend);
    expect(results.every((result) => result.status === "pass")).toBe(true);
    expect(backend.disposedPrepared).toBeGreaterThan(0);
    expect(backend.disposed).toBe(1);
    const paint = results.find((result) => result.caseId === "paint-only");
    expect(paint?.status).toBe("pass");
  });

  it("feeds the same canonical glyph-run fixtures to every backend", () => {
    const fixtures = canonicalGlyphRunFixtures();
    expect(fixtures.map((run) => run.text)).toEqual(["Hello", "Hello", "Hello"]);
    const reports = [
      createBitmapTextBackend(),
      createSdfTextBackend(),
      createWindfoilTextBackend(),
      new RecordingBackend(),
    ].map((backend) => ({ id: backend.id, results: runTextBackendConformance(backend) }));
    expect(reports.map((report) => report.results.map((result) => result.caseId))).toEqual(
      reports.map((report) => report.results.map((result) => result.caseId)),
    );
  });
});
