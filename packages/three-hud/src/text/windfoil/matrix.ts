import { encodeWindfoilInstances, type WindfoilGlyphInstance } from "./threeSpike.js";
import { preprocessWindfoilFace, type WindfoilPreprocessResult } from "./preprocess.js";

export type WindfoilArtifactClass = "ok" | "minification-risk" | "clip-partial" | "dynamic-update";

export type WindfoilMatrixScenario = Readonly<{
  id: string;
  dpr: number;
  zoom: number;
  snap: boolean;
  opacity: number;
  clip: boolean;
  fractionalTranslation: boolean;
  stringId: string;
  instanceCount: number;
}>;

export type WindfoilMatrixRecord = Readonly<{
  id: string;
  config: WindfoilMatrixScenario;
  metrics: Readonly<{
    coldEncodeMs: number;
    warmEncodeMs: number;
    instanceCount: number;
    uniqueGlyphCount: number;
    reusedInstanceCount: number;
  }>;
  artifactClass: WindfoilArtifactClass;
}>;

const STRINGS: Record<string, readonly WindfoilGlyphInstance[]> = {
  straight: instancesOf(2, 8),
  curves: instancesOf(2, 8),
  counters: instancesOf(2, 12),
  punctuation: instancesOf(2, 6),
  accents: instancesOf(2, 6),
  repeated: instancesOf(2, 24),
  blank: [{ glyphId: 1, x: 0, y: 0, scale: 1, color: [1, 1, 1, 1] }],
  "dynamic-counter": instancesOf(2, 10),
  "static-panel-2000": instancesOf(2, 2000),
};

export function defaultWindfoilMatrixFace(): WindfoilPreprocessResult {
  return preprocessWindfoilFace({
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    lineGap: 0,
    unicodeToGlyph: { "32": 1, "65": 2 },
    kerning: {},
    glyphs: [
      { glyphId: 0, advanceWidth: 0, leftSideBearing: 0, contours: [], empty: true },
      { glyphId: 1, advanceWidth: 250, leftSideBearing: 0, contours: [], empty: true },
      {
        glyphId: 2,
        advanceWidth: 500,
        leftSideBearing: 0,
        empty: false,
        contours: [
          [
            { type: "move", p: { x: 0, y: 0 } },
            { type: "quadratic", c: { x: 200, y: 400 }, p: { x: 400, y: 0 } },
            { type: "line", p: { x: 0, y: 0 } },
            { type: "close" },
          ],
        ],
      },
    ],
  });
}

export function listWindfoilMatrixScenarios(): readonly WindfoilMatrixScenario[] {
  const scenarios: WindfoilMatrixScenario[] = [];
  const dprs = [1, 1.25, 1.5, 2, 3];
  const zooms = [0.25, 1, 4, 16];
  for (const dpr of dprs) {
    for (const zoom of zooms) {
      scenarios.push(
        scenario(`zoom-${zoom}-dpr-${dpr}`, { dpr, zoom, stringId: "curves", instanceCount: 8 }),
      );
    }
  }
  scenarios.push(
    scenario("minification-0.125", { dpr: 1, zoom: 0.125, stringId: "straight", instanceCount: 8 }),
  );
  scenarios.push(
    scenario("snap-on", { dpr: 2, zoom: 1, snap: true, stringId: "punctuation", instanceCount: 6 }),
  );
  scenarios.push(
    scenario("fractional-translate", {
      dpr: 1.5,
      zoom: 1,
      fractionalTranslation: true,
      stringId: "accents",
      instanceCount: 6,
    }),
  );
  scenarios.push(
    scenario("opacity-0.5", {
      dpr: 1,
      zoom: 1,
      opacity: 0.5,
      stringId: "counters",
      instanceCount: 12,
    }),
  );
  scenarios.push(
    scenario("clip-intersect", {
      dpr: 1,
      zoom: 1,
      clip: true,
      stringId: "repeated",
      instanceCount: 24,
    }),
  );
  scenarios.push(
    scenario("dynamic-counter", {
      dpr: 1,
      zoom: 1,
      stringId: "dynamic-counter",
      instanceCount: 10,
    }),
  );
  scenarios.push(
    scenario("static-panel-2000", {
      dpr: 1,
      zoom: 1,
      stringId: "static-panel-2000",
      instanceCount: 2000,
    }),
  );
  scenarios.push(scenario("blank-glyph", { dpr: 1, zoom: 1, stringId: "blank", instanceCount: 1 }));
  return Object.freeze(scenarios);
}

export function runWindfoilEvidenceMatrix(
  preprocess: WindfoilPreprocessResult = defaultWindfoilMatrixFace(),
): readonly WindfoilMatrixRecord[] {
  return listWindfoilMatrixScenarios().map((config) => {
    const instances = (STRINGS[config.stringId] ?? instancesOf(2, config.instanceCount)).map(
      (instance) => ({
        ...instance,
        x: instance.x + (config.fractionalTranslation ? 0.37 : 0),
        scale: instance.scale * config.zoom,
        color: [1, 1, 1, config.opacity] as const,
      }),
    );
    const coldStart = now();
    const cold = encodeWindfoilInstances(preprocess, instances);
    const coldEncodeMs = now() - coldStart;
    const warmStart = now();
    encodeWindfoilInstances(preprocess, instances);
    const warmEncodeMs = now() - warmStart;
    return Object.freeze({
      id: config.id,
      config,
      metrics: Object.freeze({
        coldEncodeMs,
        warmEncodeMs,
        instanceCount: cold.instanceCount,
        uniqueGlyphCount: cold.uniqueGlyphCount,
        reusedInstanceCount: cold.reusedInstanceCount,
      }),
      artifactClass: classify(config),
    });
  });
}

function classify(config: WindfoilMatrixScenario): WindfoilArtifactClass {
  if (config.zoom < 0.25) return "minification-risk";
  if (config.clip) return "clip-partial";
  if (config.stringId === "dynamic-counter") return "dynamic-update";
  return "ok";
}

function scenario(
  id: string,
  values: Partial<WindfoilMatrixScenario> &
    Pick<WindfoilMatrixScenario, "dpr" | "zoom" | "stringId" | "instanceCount">,
): WindfoilMatrixScenario {
  return Object.freeze({
    id,
    snap: false,
    opacity: 1,
    clip: false,
    fractionalTranslation: false,
    ...values,
  });
}

function instancesOf(glyphId: number, count: number): WindfoilGlyphInstance[] {
  return Array.from({ length: count }, (_, index) => ({
    glyphId,
    x: index * 12,
    y: 0,
    scale: 1,
    color: [1, 1, 1, 1] as const,
  }));
}

function now(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}
