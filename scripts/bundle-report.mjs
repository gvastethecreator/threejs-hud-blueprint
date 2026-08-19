import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "packages/three-hud/src/index.ts"), "utf8");
const pkg = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "packages/three-hud/package.json"), "utf8"),
);
const windfoilHits = [...indexSource.matchAll(/windfoil|WGSL|parseTrueType/gi)].map(
  (match) => match[0],
);
const report = {
  schemaVersion: "three-hud/bundle-report/v0",
  mainEntryImportsWindfoil: windfoilHits.length > 0,
  windfoilHits,
  exports: Object.keys(pkg.exports ?? {}),
  windfoilSubpath: pkg.exports?.["./text/windfoil"] ?? null,
};
if (report.mainEntryImportsWindfoil) {
  throw new Error("Main package entry imports Windfoil code.");
}
if (!report.windfoilSubpath) throw new Error("Missing ./text/windfoil subpath export.");
const out = path.join(repoRoot, "evidence/tickets/HUD-039/reports/bundle-graph.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify({ mainEntryImportsWindfoil: false, windfoilSubpath: "./text/windfoil" }),
);
