import fs from "node:fs";
import path from "node:path";
import { runWindfoilEvidenceMatrix } from "../packages/three-hud/src/text/windfoil/matrix.ts";

const verify = process.argv.includes("--verify");
const records = runWindfoilEvidenceMatrix();
const panel = records.find((record) => record.id === "static-panel-2000");
const report = {
  schemaVersion: "three-hud/windfoil-matrix/v0",
  scenarioCount: records.length,
  panelInstances: panel?.metrics.instanceCount ?? 0,
  panelReuse: panel?.metrics.reusedInstanceCount ?? 0,
  coldMs: panel?.metrics.coldEncodeMs ?? null,
  warmMs: panel?.metrics.warmEncodeMs ?? null,
};
if (verify) {
  if (records.length < 20) throw new Error("matrix too small");
  if (report.panelInstances !== 2000) throw new Error("2000-glyph panel missing");
  if (report.panelReuse !== 1999) throw new Error("atlas reuse missing");
}
const out = path.resolve("evidence/tickets/HUD-010/reports/matrix.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({ report, records }, null, 2)}\n`);
console.log(JSON.stringify(report));
