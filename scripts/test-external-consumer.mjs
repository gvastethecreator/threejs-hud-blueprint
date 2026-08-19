import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
run("pnpm", ["run", "build:lib"], root);
const pack = spawnSync(
  "pnpm",
  ["--filter", "@scope/three-hud", "pack", "--pack-destination", path.join(root, "release")],
  { cwd: root, encoding: "utf8", shell: process.platform === "win32" },
);
if (pack.status !== 0) fail(pack);
const tarballLine = pack.stdout
  .trim()
  .split("\n")
  .findLast((line) => line.trim().endsWith(".tgz"));
if (!tarballLine) throw new Error("Could not locate packed tarball path in pnpm output.");
const tarball = path.isAbsolute(tarballLine.trim())
  ? tarballLine.trim()
  : path.resolve(root, tarballLine.trim());
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "three-hud-consumer-"));
fs.cpSync(path.join(root, "fixtures", "external-consumer"), temp, { recursive: true });
fs.copyFileSync(tarball, path.join(temp, "three-hud-package.tgz"));
run("pnpm", ["install", "--ignore-workspace", "--no-frozen-lockfile", "--ignore-scripts"], temp);
run("pnpm", ["run", "typecheck"], temp);
run("pnpm", ["run", "build"], temp);
console.log(`Packed external-consumer test passed in ${temp}.`);

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function fail(result) {
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  process.exit(result.status ?? 1);
}
