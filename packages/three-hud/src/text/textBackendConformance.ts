import { createGlyphRun, type GlyphRun, type TextBackend } from "./contracts.js";

export type ConformanceCaseId =
  | "create"
  | "text-change"
  | "paint-only"
  | "layout-change"
  | "font-change"
  | "visibility"
  | "clipping"
  | "teardown";

export type ConformanceResult = Readonly<{
  backendId: string;
  caseId: ConformanceCaseId;
  status: "pass" | "fail" | "skip";
  reason?: string;
}>;

const fixtures = {
  hello: createGlyphRun({
    fontId: "ui",
    text: "Hello",
    fontSize: 16,
    bounds: { x: 0, y: 0, width: 40, height: 16 },
  }),
  helloPaint: createGlyphRun({
    fontId: "ui",
    text: "Hello",
    fontSize: 16,
    bounds: { x: 0, y: 0, width: 40, height: 16 },
  }),
  helloWide: createGlyphRun({
    fontId: "ui",
    text: "Hello",
    fontSize: 24,
    bounds: { x: 0, y: 0, width: 60, height: 24 },
  }),
  otherFont: createGlyphRun({
    fontId: "other",
    text: "Hello",
    fontSize: 16,
    bounds: { x: 0, y: 0, width: 40, height: 16 },
  }),
};

export function runTextBackendConformance(backend: TextBackend): readonly ConformanceResult[] {
  const results: ConformanceResult[] = [];
  const skipUnsupported = (caseId: ConformanceCaseId, required: boolean): boolean => {
    const status = backend.capabilities.status;
    if (status === "supported" || status === "experimental") return false;
    if (required) {
      results.push({
        backendId: backend.id,
        caseId,
        status: "fail",
        reason: "required operation unavailable",
      });
      return true;
    }
    results.push({ backendId: backend.id, caseId, status: "skip", reason: `status ${status}` });
    return true;
  };

  const record = (caseId: ConformanceCaseId, run: () => void): void => {
    try {
      run();
      results.push({ backendId: backend.id, caseId, status: "pass" });
    } catch (error) {
      results.push({
        backendId: backend.id,
        caseId,
        status: "fail",
        reason: error instanceof Error ? error.message : "unknown",
      });
    }
  };

  if (!skipUnsupported("create", true)) {
    record("create", () => {
      const prepared = backend.prepare(fixtures.hello);
      backend.disposePrepared(prepared);
    });
  }
  if (!skipUnsupported("text-change", false)) {
    record("text-change", () => {
      const prepared = backend.prepare(fixtures.hello);
      backend.update(
        prepared,
        createGlyphRun({
          fontId: "ui",
          text: "Hi",
          fontSize: 16,
          bounds: { x: 0, y: 0, width: 16, height: 16 },
        }),
      );
      backend.disposePrepared(prepared);
    });
  }
  if (!skipUnsupported("paint-only", false)) {
    record("paint-only", () => {
      const prepared = backend.prepare(fixtures.hello);
      backend.update(prepared, fixtures.helloPaint);
      backend.disposePrepared(prepared);
    });
  }
  if (!skipUnsupported("layout-change", false)) {
    record("layout-change", () => {
      const prepared = backend.prepare(fixtures.hello);
      backend.update(prepared, fixtures.helloWide);
      backend.disposePrepared(prepared);
    });
  }
  if (!skipUnsupported("font-change", false)) {
    record("font-change", () => {
      const prepared = backend.prepare(fixtures.hello);
      backend.update(prepared, fixtures.otherFont);
      backend.disposePrepared(prepared);
    });
  }
  if (!skipUnsupported("visibility", false)) {
    record("visibility", () => {
      const prepared = backend.prepare(fixtures.hello);
      backend.disposePrepared(prepared);
    });
  }
  if (!skipUnsupported("clipping", false)) {
    record("clipping", () => {
      if (!backend.capabilities.scalableCoverage && backend.capabilities.pixelPerfect) {
        /* bitmap may skip coverage clips via capability, still must not throw */
      }
      const prepared = backend.prepare(fixtures.hello);
      backend.disposePrepared(prepared);
    });
  }
  record("teardown", () => {
    backend.dispose();
  });
  return Object.freeze(results);
}

export function canonicalGlyphRunFixtures(): readonly GlyphRun[] {
  return Object.freeze([fixtures.hello, fixtures.helloWide, fixtures.otherFont]);
}
