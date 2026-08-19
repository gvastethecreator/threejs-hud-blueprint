import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const report = spawnSync("pnpm run bundle:report", { shell: true, stdio: "inherit", cwd: root });
if (report.status !== 0) process.exit(report.status ?? 1);
const budgets = JSON.parse(fs.readFileSync(path.join(root, "benchmarks/budgets.json"), "utf8"));
const budgetKiB =
  budgets.budgets?.mainEntryGzipReleaseCeilingKiB ?? budgets.budgets?.mainEntryGzipKiB;
if (typeof budgetKiB !== "number") throw new Error("Missing performance budgets.");

const distEntry = path.join(root, "packages/three-hud/dist/index.js");
if (!fs.existsSync(distEntry)) {
  throw new Error("bundle:verify requires packages/three-hud/dist/index.js from a this-run pack");
}

const packDir = fs.mkdtempSync(path.join(os.tmpdir(), "three-hud-pack-"));
const pack = spawnSync("pnpm", ["--filter", "@scope/three-hud", "pack", "--pack-destination", packDir], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (pack.status !== 0) {
  throw new Error(`this-run pnpm pack failed: ${pack.stderr || pack.stdout || pack.status}`);
}
const tarball = fs.readdirSync(packDir).find((name) => name.endsWith(".tgz"));
if (!tarball) throw new Error("this-run pack produced no .tgz");
const tarballPath = path.join(packDir, tarball);

const extracted = spawnSync("tar", ["-xOf", tarballPath, "package/dist/index.js"], {
  encoding: "buffer",
});
if (extracted.status !== 0 || !extracted.stdout || extracted.stdout.length === 0) {
  throw new Error("could not extract package/dist/index.js from this-run packed tarball");
}
const packedMainEntryGzipKiB = gzipSync(extracted.stdout).length / 1024;
const line = `packedMainEntryGzipKiB: ${packedMainEntryGzipKiB.toFixed(2)} budgetKiB: ${budgetKiB}`;
console.log(line);
if (packedMainEntryGzipKiB > budgetKiB) {
  throw new Error(`${line} exceeds ceiling`);
}
console.log("bundle:verify passed");
