import fs from "node:fs";
import path from "node:path";

const verify = process.argv.includes("--verify");
const root = process.cwd();
const visualHashes = path.join(root, "fixtures/visual/primitive-hashes.json");
const consumer = path.join(root, "fixtures/external-consumer/package.json");
const pkg = path.join(root, "packages/three-hud/package.json");
const releaseStatusPath = path.join(root, "release-status.json");
const hashes = fs.existsSync(visualHashes)
  ? ((JSON.parse(fs.readFileSync(visualHashes, "utf8")) as { hashes?: Record<string, string> })
      .hashes ?? {})
  : {};
const status = fs.existsSync(releaseStatusPath)
  ? (JSON.parse(fs.readFileSync(releaseStatusPath, "utf8")) as { releaseReady?: boolean })
  : {};
const report = {
  schemaVersion: "three-hud/release-qa/v0",
  ssr: fs.existsSync(path.join(root, "scripts/test-ssr-import.mjs")),
  packedConsumer: fs.existsSync(consumer),
  visual: Object.keys(hashes).length > 0,
  visualScenarioCount: Object.keys(hashes).length,
  releaseReady: status.releaseReady === true,
  notes: "Release QA reads on-disk gate artifacts; it does not hardcode ssr:true.",
};
if (verify) {
  if (!report.ssr) throw new Error("release QA missing ssr import script");
  if (!report.packedConsumer) throw new Error("release QA missing external consumer fixture");
  if (!report.visual || report.visualScenarioCount < 4)
    throw new Error("release QA missing visual hash artifacts");
  if (!fs.existsSync(pkg)) throw new Error("release QA missing public package.json");
}
const dir = path.resolve("evidence/tickets/HUD-068/reports");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "qa.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
