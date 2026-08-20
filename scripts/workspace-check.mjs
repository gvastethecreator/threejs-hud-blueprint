import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles } from "./lib/tickets.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "package.json",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  "AGENTS.md",
  "CONTEXT.md",
  "ROADMAP.md",
  "packages/three-hud/package.json",
  "packages/three-hud/src/index.ts",
  "apps/playground/package.json",
  "apps/playground/src/main.ts",
  "fixtures/external-consumer/package.json",
  "planning/ticket-index.json",
];
const errors = [];
for (const relative of required)
  if (!fs.existsSync(path.join(repoRoot, relative)))
    errors.push(`Missing required path ${relative}.`);

const rootPackage = readJson("package.json");
const library = readJson("packages/three-hud/package.json");
const playground = readJson("apps/playground/package.json");
if (rootPackage.private !== true) errors.push("Root package must be private.");
if (rootPackage.packageManager !== "pnpm@11.22.0")
  errors.push(
    "Root packageManager must remain pinned to pnpm@11.22.0 until intentionally changed.",
  );
if (library.name !== "@scope/three-hud")
  errors.push(
    "Library placeholder name must be @scope/three-hud until the scope decision is applied consistently.",
  );
if (library.sideEffects !== false) errors.push("Library must declare sideEffects: false.");
if (!library.peerDependencies?.three)
  errors.push("Library must declare Three.js as a peer dependency.");
for (const dependency of ["react", "react-dom"]) {
  if (
    library.dependencies?.[dependency] ||
    library.peerDependencies?.[dependency] ||
    library.devDependencies?.[dependency]
  )
    errors.push(`Library must not depend on ${dependency}.`);
  if (playground.dependencies?.[dependency] || playground.devDependencies?.[dependency])
    errors.push(`Vanilla playground must not depend on ${dependency}.`);
}
if (playground.dependencies?.["@scope/three-hud"] !== "workspace:*")
  errors.push("Playground must consume @scope/three-hud through workspace:* public exports.");

for (const file of walkFiles(path.join(repoRoot, "apps", "playground", "src"), (value) =>
  /\.(?:ts|tsx|js|jsx)$/.test(value),
)) {
  const source = fs.readFileSync(file, "utf8");
  if (/packages\/three-hud\/src|\.\.\/\.\.\/packages\/three-hud/.test(source))
    errors.push(`Playground deep-imports library source: ${path.relative(repoRoot, file)}.`);
}

const workspace = fs.readFileSync(path.join(repoRoot, "pnpm-workspace.yaml"), "utf8");
if (/fixtures\/\*/.test(workspace))
  errors.push("External consumer fixtures must not be workspace packages.");

if (errors.length) {
  console.error("Workspace check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Workspace check passed: lean package/playground/consumer boundaries are present.");

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relative), "utf8"));
}
