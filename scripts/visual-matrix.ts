import fs from "node:fs";
import path from "node:path";

const verify = process.argv.includes("--verify");
const root = process.cwd();
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "packages/three-hud/package.json"), "utf8"),
) as { peerDependencies?: { three?: string }; version: string };
const three = pkg.peerDependencies?.three ?? "unspecified";

type Scenario = {
  id: string;
  renderer: string;
  backend: string;
  three: string;
  browser: string;
  dpr: number;
  fontFixture: string;
  class: "primitive" | "widget" | "showcase" | "experimental";
  blocking: boolean;
  profile: string;
};

function hashesOf(file: string): Record<string, string> {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return {};
  const parsed = JSON.parse(fs.readFileSync(full, "utf8")) as {
    hashes?: Record<string, string>;
    hash?: string;
  };
  if (parsed.hashes) return parsed.hashes;
  if (parsed.hash) return { showcase: parsed.hash };
  return {};
}

const primitives = hashesOf("fixtures/visual/primitive-hashes.json");
const widgets = hashesOf("fixtures/visual/widget-hashes.json");
const showcase = hashesOf("fixtures/visual/showcase-hash.json");

const scenarios: Scenario[] = [];
for (const id of Object.keys(primitives)) {
  scenarios.push({
    id,
    renderer: "none-cpu-raster",
    backend: "webgl-overlay-queue",
    three,
    browser: "node",
    dpr: 1,
    fontFixture: id.startsWith("text:") ? "ascii-5x7" : "none",
    class: "primitive",
    blocking: true,
    profile: "webgl-baseline",
  });
}
for (const id of Object.keys(widgets)) {
  scenarios.push({
    id: `widget:${id}`,
    renderer: "none-cpu-raster",
    backend: "webgl-overlay-queue",
    three,
    browser: "node",
    dpr: 1,
    fontFixture: "ascii-5x7",
    class: "widget",
    blocking: true,
    profile: "webgl-baseline",
  });
}
for (const id of Object.keys(showcase)) {
  scenarios.push({
    id: `showcase:${id}`,
    renderer: "none-cpu-raster",
    backend: "webgl-overlay-queue",
    three,
    browser: "node",
    dpr: 1,
    fontFixture: "ascii-5x7",
    class: "showcase",
    blocking: true,
    profile: "webgl-baseline",
  });
}
scenarios.push({
  id: "windfoil-three-spike",
  renderer: "WebGPURenderer",
  backend: "webgpu-native",
  three,
  browser: "unverified",
  dpr: 1,
  fontFixture: "none",
  class: "experimental",
  blocking: false,
  profile: "webgpu-windfoil",
});

const requiredProfiles = ["webgl-baseline"];
const presentProfiles = new Set(scenarios.filter((row) => row.blocking).map((row) => row.profile));
const missingRequired = requiredProfiles.filter((profile) => !presentProfiles.has(profile));

const visualDir = path.join(root, "fixtures/visual");
const fontBinaries = fs.existsSync(visualDir)
  ? fs.readdirSync(visualDir).filter((name) => /\.(?:ttf|otf|woff2?|eot)$/i.test(name))
  : [];

const report = {
  schemaVersion: "three-hud/visual-matrix/v0",
  packageVersion: pkg.version,
  three,
  requiredProfiles,
  missingRequired,
  experimentalProfiles: ["webgpu-windfoil"],
  fontBinaries,
  thresholdsDoc: "docs/quality/VISUAL_THRESHOLDS.md",
  scenarios,
};

if (verify) {
  if (missingRequired.length > 0) {
    throw new Error(`missing required visual profiles: ${missingRequired.join(", ")}`);
  }
  if (scenarios.filter((row) => row.blocking).length < 4) {
    throw new Error("too few blocking visual scenarios");
  }
  if (fontBinaries.length > 0) {
    throw new Error(`licensed font binaries in fixtures/visual: ${fontBinaries.join(", ")}`);
  }
  if (!fs.existsSync(path.join(root, "docs/quality/VISUAL_THRESHOLDS.md"))) {
    throw new Error("missing visual threshold policy");
  }
}

const outDir = path.resolve("evidence/tickets/HUD-064");
fs.mkdirSync(path.join(outDir, "reports"), { recursive: true });
fs.writeFileSync(
  path.join(outDir, "reports", "scenario-matrix.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const rows = scenarios
  .map(
    (row) =>
      `<tr><td>${row.id}</td><td>${row.profile}</td><td>${row.renderer}</td><td>${row.backend}</td><td>${row.three}</td><td>${row.browser}</td><td>${row.dpr}</td><td>${row.fontFixture}</td><td>${row.blocking ? "blocking" : "report-only"}</td></tr>`,
  )
  .join("\n");
fs.writeFileSync(
  path.join(outDir, "reports", "visual-report.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Three HUD visual matrix</title></head><body><h1>Visual scenario matrix</h1><p>Three.js ${three}. Thresholds: VISUAL_THRESHOLDS.md. Experimental webgpu-windfoil is report-only.</p><table border="1"><thead><tr><th>id</th><th>profile</th><th>renderer</th><th>backend</th><th>three</th><th>browser</th><th>dpr</th><th>font</th><th>gate</th></tr></thead><tbody>${rows}</tbody></table></body></html>\n`,
);
console.log(
  JSON.stringify({
    scenarios: scenarios.length,
    missingRequired,
    fontBinaries,
    verified: verify,
  }),
);
