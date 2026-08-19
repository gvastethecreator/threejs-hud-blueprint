import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "packages", "three-hud", "dist", "index.js");
if (!fs.existsSync(entry)) {
  console.error("Built package entry is missing. Run `pnpm run build:lib` first.");
  process.exit(1);
}
const before = new Set(Object.getOwnPropertyNames(globalThis));
const module = await import(`${pathToFileURL(entry).href}?ssr-smoke=${Date.now()}`);
for (const expected of ["HUD", "HudNode", "resolveViewport", "probeRendererCapabilities"]) {
  if (!(expected in module)) throw new Error(`SSR import is missing public export ${expected}.`);
}
const added = Object.getOwnPropertyNames(globalThis).filter((key) => !before.has(key));
if (added.length) throw new Error(`Package import added global keys: ${added.join(", ")}`);
console.log("SSR-safe import passed.");
