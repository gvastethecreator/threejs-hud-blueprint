import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(repoRoot, "planning", "github", "issues.ndjson");
const records = fs
  .readFileSync(manifestPath, "utf8")
  .trim()
  .split("\n")
  .filter(Boolean)
  .map(JSON.parse);
const apply = process.argv.includes("--apply");
const repository = process.env.GITHUB_REPOSITORY;
const from = argumentValue("--from");
const limit = Number(argumentValue("--limit") ?? Number.POSITIVE_INFINITY);
let selected = records;
if (from) selected = selected.filter((record) => record.id.localeCompare(from) >= 0);
selected = selected.slice(0, limit);

if (!apply) {
  console.log(
    `Dry run: ${selected.length} issue(s) would be created from ${path.relative(repoRoot, manifestPath)}.`,
  );
  for (const record of selected) console.log(`- ${record.title} [${record.labels.join(", ")}]`);
  console.log(
    "Use --apply with GITHUB_REPOSITORY=owner/repo only after validating labels, milestones, authentication, and repository identity.",
  );
  process.exit(0);
}

if (!repository || !/^[^/]+\/[^/]+$/.test(repository)) {
  console.error("GITHUB_REPOSITORY=owner/repo is required with --apply.");
  process.exit(1);
}
const status = spawnSync("gh", ["auth", "status"], { stdio: "inherit" });
if (status.status !== 0) process.exit(status.status ?? 1);

for (const record of selected) {
  const ticketFile = findTicketFile(record.id);
  const ticketText = fs.readFileSync(ticketFile, "utf8");
  const remote = /^github_issue:\s*(.+)$/m.exec(ticketText)?.[1]?.trim();
  if (remote && remote !== "pending") {
    console.log(`${record.id}: already synchronized as ${remote}; skipping.`);
    continue;
  }
  const args = [
    "issue",
    "create",
    "--repo",
    repository,
    "--title",
    record.title,
    "--body-file",
    path.join(repoRoot, record.bodyFile),
  ];
  for (const label of record.labels) args.push("--label", label);
  if (record.milestone) args.push("--milestone", record.milestone);
  const result = spawnSync("gh", args, { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? "");
    console.error(
      `${record.id}: creation failed. No duplicate retry will be attempted automatically.`,
    );
    process.exit(result.status ?? 1);
  }
  const url = result.stdout.trim().split("\n").at(-1)?.trim();
  if (!url?.startsWith("http")) {
    console.error(
      `${record.id}: gh returned no issue URL; inspect the repository before retrying.`,
    );
    process.exit(1);
  }
  fs.writeFileSync(
    ticketFile,
    ticketText
      .replace(/^github_issue:\s*pending$/m, `github_issue: ${url}`)
      .replace(/^sync:\s*pending$/m, "sync: synced"),
  );
  console.log(`${record.id}: ${url}`);
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
function findTicketFile(id) {
  const stack = [path.join(repoRoot, "planning", "tickets")];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (entry.name.startsWith(`${id}-`) && entry.name.endsWith(".md")) return absolute;
    }
  }
  throw new Error(`Ticket file not found for ${id}.`);
}
