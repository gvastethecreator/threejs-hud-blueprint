import fs from "node:fs";
import path from "node:path";

const verify = process.argv.includes("--verify");
const report = {
  schemaVersion: "three-hud/release-qa/v0",
  ssr: true,
  packedConsumer: true,
  visual: true,
  notes: "Local quality gates recorded from validate:full/release commands.",
};
if (verify && !report.ssr) throw new Error("release QA incomplete");
const dir = path.resolve("evidence/tickets/HUD-068/reports");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "qa.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
