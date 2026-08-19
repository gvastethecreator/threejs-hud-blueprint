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

export { DeterministicClock, type HudClock } from "./clock.js";
export {
  createEmptyGlyphRun,
  createIdFactory,
  createMockRenderer,
  createMockRendererAdapter,
  createMockResource,
  createMockTextBackend,
  createMockViewport,
  type MockOwnership,
  type MockResource,
} from "./mocks.js";
export { createCanonicalTreeFixture, createHudFixture, type HudFixture } from "./fixtures.js";
