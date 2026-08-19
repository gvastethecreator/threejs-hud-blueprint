import fs from "node:fs";
import path from "node:path";

const summaryPath = path.resolve("coverage/package/coverage-summary.json");
if (!fs.existsSync(summaryPath)) {
  throw new Error("missing coverage/package/coverage-summary.json; run vitest --coverage first");
}
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const files = Object.keys(summary).filter((key) => key !== "total");
const playground = files.filter((file) => file.replaceAll("\\", "/").includes("/apps/playground/"));
const packageFiles = files.filter((file) =>
  file.replaceAll("\\", "/").includes("/packages/three-hud/"),
);
if (playground.length > 0) {
  throw new Error(
    `coverage mixed playground files into the package report: ${playground.slice(0, 5).join(", ")}`,
  );
}
if (packageFiles.length === 0) {
  throw new Error("coverage report contains no packages/three-hud files");
}
const report = {
  schemaVersion: "three-hud/coverage-split/v0",
  packageFiles: packageFiles.length,
  playgroundFiles: playground.length,
  total: summary.total ?? null,
};
const outDir = path.resolve("evidence/tickets/HUD-063/reports");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "coverage-summary.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify(report));
