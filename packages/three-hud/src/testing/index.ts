export type PlannedScenarioId =
  | "scaling-lab"
  | "primitive-lab"
  | "typography-lab"
  | "layout-lab"
  | "input-lab"
  | "widget-showcase"
  | "stress-lab";

export const PLANNED_SCENARIOS: readonly PlannedScenarioId[] = Object.freeze([
  "scaling-lab",
  "primitive-lab",
  "typography-lab",
  "layout-lab",
  "input-lab",
  "widget-showcase",
  "stress-lab",
]);

export { DeterministicClock } from "./clock.js";
export { createEmptyGlyphRun, createMockRenderer, createMockTextBackend } from "./mocks.js";
