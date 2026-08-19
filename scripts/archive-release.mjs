import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseDir = path.join(root, "release");
const reports = path.join(root, "evidence", "tickets", "HUD-073", "reports");
fs.mkdirSync(releaseDir, { recursive: true });
fs.mkdirSync(reports, { recursive: true });
const pkg = JSON.parse(fs.readFileSync(path.join(root, "packages/three-hud/package.json"), "utf8"));

const pack = spawnSync(
  "pnpm",
  ["--filter", "@scope/three-hud", "pack", "--pack-destination", releaseDir],
  {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
  },
);
if (pack.status !== 0) {
  process.stdout.write(pack.stdout ?? "");
  process.stderr.write(pack.stderr ?? "");
  process.exit(pack.status ?? 1);
}

const tarballName = fs
  .readdirSync(releaseDir)
  .filter((name) => name.endsWith(".tgz"))
  .sort()
  .at(-1);
if (!tarballName) throw new Error("No tarball in release/.");
const tarball = path.join(releaseDir, tarballName);
const dry = spawnSync("pnpm", ["--filter", "@scope/three-hud", "pack", "--dry-run"], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
});

function copyIfExists(from, name) {
  if (!fs.existsSync(from)) return null;
  const dest = path.join(releaseDir, name);
  fs.copyFileSync(from, dest);
  return path.relative(root, dest).replaceAll("\\", "/");
}

const files = {
  tarball: path.relative(root, tarball).replaceAll("\\", "/"),
  packageFiles: copyIfExists(
    path.join(root, "evidence/tickets/HUD-073/reports/package-files.json"),
    "package-files.json",
  ),
  licenses: copyIfExists(
    path.join(root, "evidence/tickets/HUD-032/reports/font-licenses.json"),
    "licenses.json",
  ),
  compatibility: copyIfExists(
    path.join(root, "evidence/tickets/HUD-068/reports/compatibility.json"),
    "compatibility.json",
  ),
  bundle: copyIfExists(
    path.join(root, "evidence/tickets/HUD-039/reports/bundle-graph.json"),
    "bundle-report.json",
  ),
  visual: copyIfExists(
    path.join(root, "evidence/tickets/HUD-050/reports/layout.json"),
    "visual-summary.json",
  ),
  benchmark: copyIfExists(
    path.join(root, "evidence/tickets/HUD-026/reports/allocations.json"),
    "benchmark-summary.json",
  ),
};

const tag = spawnSync("git", ["tag", `v${pkg.version}`], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
});
const evidence = {
  schemaVersion: "three-hud/release-evidence/v0",
  version: pkg.version,
  tarball: files.tarball,
  dryRun: dry.stdout,
  gitTagAttempt: {
    command: `git tag v${pkg.version}`,
    status: tag.status,
    stdout: tag.stdout,
    stderr: tag.stderr,
    error: tag.error ? tag.error.message : null,
  },
  rollback:
    "Never overwrite a published version. Deprecate it, then publish a patch from a verified commit.",
  files,
};
fs.writeFileSync(
  path.join(releaseDir, "release-evidence.json"),
  `${JSON.stringify(evidence, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(reports, "tarball-manifest.json"),
  `${JSON.stringify({ tarball: files.tarball, dryRun: dry.stdout }, null, 2)}\n`,
);
console.log(JSON.stringify({ tarball: files.tarball, version: pkg.version }));
