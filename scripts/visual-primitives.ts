import fs from "node:fs";
import path from "node:path";
import {
  budgetDelta,
  measureShowcase,
  runPrimitiveScenarios,
} from "../packages/three-hud/src/render/primitiveScenarios.ts";

const verify = process.argv.includes("--verify");
const scenarios = [...runPrimitiveScenarios("webgl"), ...runPrimitiveScenarios("webgpu")];
const showcase = measureShowcase("webgl");
const delta = budgetDelta(showcase);
const report = {
  schemaVersion: "three-hud/primitive-regression/v0",
  baselinesRequireApproval: true,
  scenarioCount: scenarios.length,
  showcase,
  budgetDelta: delta,
  scenarios,
};
if (verify) {
  const primitives = new Set(scenarios.map((scenario) => scenario.primitive));
  for (const name of ["Rect", "RoundedRect", "Line", "Image", "NineSlice", "Ring", "Arc"]) {
    if (!primitives.has(name)) throw new Error(`missing primitive ${name}`);
    const kinds = scenarios
      .filter((scenario) => scenario.primitive === name)
      .map((scenario) => scenario.kind);
    if (!kinds.includes("positive") || !kinds.includes("edge"))
      throw new Error(`${name} missing positive/edge`);
  }
  if (delta.length) throw new Error(`budget failed:\n${delta.join("\n")}`);
}
const dir = path.resolve("evidence/tickets/HUD-031/reports");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "metrics.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(dir, "visual-report.html"),
  `<!doctype html><meta charset="utf-8"><title>Three HUD primitive regression</title><pre>${JSON.stringify(report, null, 2)}</pre>\n`,
);
console.log(
  JSON.stringify({
    scenarioCount: scenarios.length,
    drawCalls: showcase.drawCalls,
    budgetDelta: delta,
  }),
);
