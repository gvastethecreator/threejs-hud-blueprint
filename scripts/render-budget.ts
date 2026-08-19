import {
  budgetDelta,
  measureShowcase,
} from "../packages/three-hud/src/render/primitiveScenarios.ts";

const verify = process.argv.includes("--verify");
const showcase = measureShowcase("webgl");
const delta = budgetDelta(showcase);
const result = { showcase, delta };
if (verify && delta.length) {
  throw new Error(`render budget failed:\n${delta.join("\n")}`);
}
console.log(JSON.stringify(result));
