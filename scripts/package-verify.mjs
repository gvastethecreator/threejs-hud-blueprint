import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "packages/three-hud/package.json"), "utf8"));
const errors = [];
if (pkg.sideEffects !== false) errors.push("sideEffects must be false.");
if (
  !pkg.exports?.["."] ||
  !pkg.exports?.["./text/windfoil"] ||
  !pkg.exports?.["./text/sdf"] ||
  !pkg.exports?.["./text/bitmap"] ||
  !pkg.exports?.["./testing"]
)
  errors.push("Required subpath exports are missing.");
if (Object.keys(pkg.dependencies ?? {}).includes("three"))
  errors.push("Three.js must not be a bundled runtime dependency.");
for (const prohibited of ["react", "react-dom"]) {
  if (pkg.dependencies?.[prohibited] || pkg.peerDependencies?.[prohibited])
    errors.push(`${prohibited} is prohibited in the public v0.1 package.`);
}
if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
const result = spawnSync("pnpm", ["--filter", "@scope/three-hud", "pack", "--dry-run"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (result.status !== 0) process.exit(result.status ?? 1);
console.log("Package metadata and dry-run inspection passed.");
