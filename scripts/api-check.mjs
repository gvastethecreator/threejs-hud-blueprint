import fs from "node:fs";
import path from "node:path";

const index = fs.readFileSync(path.resolve("packages/three-hud/src/index.ts"), "utf8");
const declarations = fs.readFileSync(path.resolve("packages/three-hud/dist/index.d.ts"), "utf8");
if (declarations.includes("../src/") || declarations.includes("packages/three-hud/src")) {
  throw new Error("Declaration snapshot leaks internal source paths.");
}
const exported = [
  ...index.matchAll(
    /export\s+(?:type\s+|\{[\s\S]*?|async\s+function\s+|function\s+|const\s+|class\s+)([A-Za-z0-9_]+)/g,
  ),
].map((match) => match[1]);
const named = [...index.matchAll(/export\s+\{([\s\S]*?)\}/g)].flatMap((block) =>
  block[1]
    .split(",")
    .map((part) =>
      part
        .trim()
        .split(/\s+as\s+|\s+/)
        .filter(Boolean)
        .pop(),
    )
    .filter(Boolean),
);
const names = new Set([...exported, ...named].filter((name) => name && name !== "type"));
const missing = [...names].filter((name) => !declarations.includes(name));
if (missing.length) throw new Error(`api:check missing from declarations: ${missing.join(", ")}`);
console.log(`api:check passed (${names.size} public names, no internal paths).`);
