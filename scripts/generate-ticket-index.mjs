import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTicketIndex } from "./lib/tickets.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(repoRoot, "planning", "ticket-index.json");
const generated = buildTicketIndex(repoRoot);
const check = process.argv.includes("--check");

if (check) {
  const existing = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  const normalizedExisting = { ...existing, generatedAt: generated.generatedAt };
  if (JSON.stringify(normalizedExisting) !== JSON.stringify(generated)) {
    console.error("Ticket index is stale. Run `pnpm run tickets:index`.");
    process.exit(1);
  }
  console.log(`Ticket index is current (${generated.count} tickets).`);
} else {
  fs.writeFileSync(outputPath, `${JSON.stringify(generated, null, 2)}\n`);
  console.log(`Wrote ${path.relative(repoRoot, outputPath)} with ${generated.count} tickets.`);
}
