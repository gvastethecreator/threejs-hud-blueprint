import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const relative of [
  "packages/three-hud/dist",
  "apps/playground/dist",
  "apps/playground/tsconfig.tsbuildinfo",
  "packages/three-hud/tsconfig.tsbuildinfo",
  "coverage",
  "test-results",
  "playwright-report",
  "blob-report",
]) {
  fs.rmSync(path.join(root, relative), { recursive: true, force: true });
}
console.log("Removed generated build and test outputs.");
