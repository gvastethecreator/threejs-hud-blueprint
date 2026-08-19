import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repository = process.env.GITHUB_REPOSITORY;
const apply = process.argv.includes("--apply");
const labelsOnly = process.argv.includes("--labels-only");
const milestonesOnly = process.argv.includes("--milestones-only");
const labels = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "planning/github/labels.json"), "utf8"),
).labels;
const milestones = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "planning/github/milestones.json"), "utf8"),
).milestones;

if (!apply) {
  console.log(`Dry run: ${labels.length} labels and ${milestones.length} milestones are defined.`);
  if (!milestonesOnly)
    for (const label of labels)
      console.log(`label  ${label.name}  #${label.color}  ${label.description}`);
  if (!labelsOnly)
    for (const milestone of milestones)
      console.log(`milestone  ${milestone.title}  (${milestone.ticketCount} tickets)`);
  console.log(
    "Use --apply with GITHUB_REPOSITORY=owner/repo after confirming repository identity and gh authentication.",
  );
  process.exit(0);
}

if (!repository || !/^[^/]+\/[^/]+$/.test(repository)) {
  console.error("GITHUB_REPOSITORY=owner/repo is required with --apply.");
  process.exit(1);
}
run(["auth", "status"]);

if (!milestonesOnly) {
  for (const label of labels) {
    run([
      "label",
      "create",
      label.name,
      "--repo",
      repository,
      "--color",
      label.color,
      "--description",
      label.description,
      "--force",
    ]);
  }
}

if (!labelsOnly) {
  const existing = JSON.parse(
    capture(["api", `repos/${repository}/milestones?state=all&per_page=100`]),
  ).map((item) => item.title);
  for (const milestone of milestones) {
    if (existing.includes(milestone.title)) {
      console.log(`milestone exists: ${milestone.title}`);
      continue;
    }
    run([
      "api",
      `repos/${repository}/milestones`,
      "--method",
      "POST",
      "-f",
      `title=${milestone.title}`,
      "-f",
      `description=${milestone.description}`,
    ]);
  }
}

function run(args) {
  const result = spawnSync("gh", args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function capture(args) {
  const result = spawnSync("gh", args, { encoding: "utf8", shell: process.platform === "win32" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? "");
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}
