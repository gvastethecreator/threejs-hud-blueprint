import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles, toPosix } from "./lib/tickets.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(repoRoot, "packages", "three-hud", "src");
const errors = [];

const rules = [
  {
    label: "contracts are framework and runtime independent",
    roots: ["contracts"],
    forbidden: [
      /^three(?:\/|$)/,
      /^\.\.\/(?:core|viewport|layout|render|text|primitives|input|theme|widgets)(?:\/|$)/,
    ],
  },
  {
    label: "widgets cannot bind a concrete backend or Three renderer internals",
    roots: ["widgets"],
    forbidden: [/text\/backends\//, /render\/three\//],
  },
  {
    label: "text backends cannot depend on widgets or input",
    roots: ["text/backends", "text"],
    include: (file) =>
      /(?:windfoil|sdf|bitmap|backends)/.test(toPosix(path.relative(sourceRoot, file))),
    forbidden: [/(?:^|\/)widgets(?:\/|$)/, /(?:^|\/)input(?:\/|$)/],
  },
];

for (const rule of rules) {
  for (const relativeRoot of rule.roots) {
    const absoluteRoot = path.join(sourceRoot, relativeRoot);
    for (const file of walkFiles(absoluteRoot, (value) =>
      /\.(?:ts|tsx|js|jsx|mts|cts)$/.test(value),
    )) {
      if (rule.include && !rule.include(file)) continue;
      const source = stripComments(fs.readFileSync(file, "utf8"));
      for (const specifier of importSpecifiers(source)) {
        for (const pattern of rule.forbidden) {
          if (pattern.test(specifier))
            errors.push(
              `${rule.label}: ${toPosix(path.relative(repoRoot, file))} imports ${specifier}.`,
            );
        }
      }
    }
  }
}

for (const file of walkFiles(path.join(repoRoot, "packages", "three-hud"), (value) =>
  /\.(?:ts|tsx|js|jsx|mts|cts)$/.test(value),
)) {
  const source = stripComments(fs.readFileSync(file, "utf8"));
  for (const specifier of importSpecifiers(source)) {
    if (/(?:^|\/)(?:apps|fixtures|e2e|planning|docs)(?:\/|$)/.test(specifier)) {
      errors.push(
        `Public package imports repository consumer/planning code: ${toPosix(path.relative(repoRoot, file))} -> ${specifier}.`,
      );
    }
  }
}

for (const file of walkFiles(path.join(sourceRoot, "contracts"), (value) => /\.ts$/.test(value))) {
  const source = stripComments(fs.readFileSync(file, "utf8"));
  if (/\b(?:window|document|navigator)\b/.test(source))
    errors.push(
      `Contract file references a browser global: ${toPosix(path.relative(repoRoot, file))}.`,
    );
}

if (errors.length) {
  console.error("Architecture boundary check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Architecture boundary check passed.");

function importSpecifiers(source) {
  const values = [];
  const pattern =
    /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const match of source.matchAll(pattern)) values.push(match[1] ?? match[2]);
  return values.filter(Boolean);
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}
