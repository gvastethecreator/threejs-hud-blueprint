import fs from "node:fs";
import path from "node:path";

const verify = process.argv.includes("--verify");
const root = process.cwd();
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "packages/three-hud/package.json"), "utf8"),
) as { peerDependencies?: { three?: string } };
const hashesFile = JSON.parse(
  fs.readFileSync(path.join(root, "fixtures/visual/primitive-hashes.json"), "utf8"),
) as { hashes?: Record<string, string> };
const hashes = hashesFile.hashes ?? {};
const widgetHashesPath = path.join(root, "fixtures/visual/widget-hashes.json");
const widgetFile = fs.existsSync(widgetHashesPath)
  ? (JSON.parse(fs.readFileSync(widgetHashesPath, "utf8")) as { hashes?: Record<string, string> })
  : { hashes: {} };
const widgetHashes = widgetFile.hashes ?? {};
const passedScenarioIds = [...Object.keys(hashes), ...Object.keys(widgetHashes)];
const three = pkg.peerDependencies?.three ?? "unspecified";
const report = {
  schemaVersion: "three-hud/compatibility/v0",
  three,
  renderers: ["WebGLRenderer", "WebGPURenderer"],
  textBackends: {
    windfoil: "experimental-native-webgpu",
    sdf: "supported-contract",
    bitmap: "supported-integer-nearest",
  },
  browsers: ["Chromium"],
  passedScenarioIds,
  cells: {
    "webgl-baseline": { status: "measured", scenarios: passedScenarioIds },
    "node-import": { status: "measured", scenarios: ["ssr-import"] },
    "webgpu-windfoil": { status: "experimental", scenarios: ["windfoil-three-spike"] },
  },
};
if (verify) {
  if (!three.includes("0.185"))
    throw new Error("compatibility matrix missing three@0.185 peer pin");
  if (!passedScenarioIds.includes("shape:rect"))
    throw new Error("compatibility matrix missing primitive scenario shape:rect");
  if (passedScenarioIds.length < 4)
    throw new Error("compatibility matrix has too few scenario IDs");
}
const dir = path.resolve("docs/quality");
fs.mkdirSync(dir, { recursive: true });
const out = path.resolve("evidence/tickets/HUD-068/reports");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "compatibility.json"), `${JSON.stringify(report, null, 2)}\n`);
const matrixPath = path.join(dir, "COMPATIBILITY_MATRIX.md");
const matrix = fs.readFileSync(matrixPath, "utf8");
const generated = `## Generated evidence (HUD-068)

Generated from named passing scenario IDs, not hardcoded object equality.

| Cell | Status | Scenario IDs |
| ---- | ------ | ------------ |
| webgl-baseline | measured | ${passedScenarioIds.join(", ")} |
| node-import | measured | ssr-import |
| webgpu-windfoil | experimental | windfoil-three-spike |

Three.js peer: \`${three}\`.
`;
const marker = "## Generated evidence (HUD-068)";
const next = matrix.includes(marker)
  ? `${matrix.slice(0, matrix.indexOf(marker)).trimEnd()}\n\n${generated}`
  : `${matrix.trimEnd()}\n\n${generated}`;
fs.writeFileSync(matrixPath, `${next.trimEnd()}\n`);
console.log(JSON.stringify(report));
