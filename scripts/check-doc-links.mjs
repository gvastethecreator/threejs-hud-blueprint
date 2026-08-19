import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles, toPosix } from "./lib/tickets.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDocRoots = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}.scratch${path.sep}`,
  `${path.sep}coverage${path.sep}`,
  `${path.sep}playwright-report${path.sep}`,
  `${path.sep}test-results${path.sep}`,
  `${path.sep}release${path.sep}`,
];
const markdownFiles = walkFiles(repoRoot, (file) => {
  if (!file.endsWith(".md")) return false;
  const relative = `${path.sep}${path.relative(repoRoot, file)}`;
  return !ignoredDocRoots.some((marker) => relative.includes(marker));
});
const errors = [];
for (const file of markdownFiles) {
  const source = fs.readFileSync(file, "utf8");
  const withoutFences = source.replace(/```[\s\S]*?```/g, "");
  const links = [...withoutFences.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) =>
    match[1].trim(),
  );
  for (const raw of links) {
    const destination = raw.replace(/^<|>$/g, "").split(/\s+["']/)[0];
    if (
      !destination ||
      destination.startsWith("#") ||
      /^(?:https?:|mailto:|data:)/.test(destination)
    )
      continue;
    const pathPart = decodeURIComponent(destination.split("#")[0]);
    if (!pathPart) continue;
    const target = path.resolve(path.dirname(file), pathPart);
    if (!fs.existsSync(target))
      errors.push(`${toPosix(path.relative(repoRoot, file))}: missing link target ${destination}.`);
  }
}
if (errors.length) {
  console.error(`Documentation link check failed with ${errors.length} broken link(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Documentation link check passed across ${markdownFiles.length} Markdown files.`);
