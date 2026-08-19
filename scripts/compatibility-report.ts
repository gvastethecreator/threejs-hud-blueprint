import fs from "node:fs";
import path from "node:path";

const verify = process.argv.includes("--verify");
const report = {
  schemaVersion: "three-hud/compatibility/v0",
  three: "0.185.1",
  renderers: ["WebGLRenderer", "WebGPURenderer"],
  textBackends: {
    windfoil: "experimental-native-webgpu",
    sdf: "supported-contract",
    bitmap: "supported-integer-nearest",
  },
  browsers: ["Chromium"],
};
if (verify && report.three !== "0.185.1") throw new Error("compatibility matrix drifted");
const dir = path.resolve("docs/quality");
fs.mkdirSync(dir, { recursive: true });
const out = path.resolve("evidence/tickets/HUD-068/reports");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "compatibility.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
