import fs from "node:fs";
import path from "node:path";

const playground = path.resolve("apps/playground/src/main.ts");
const source = fs.readFileSync(playground, "utf8");
if (!source.includes("@scope/three-hud"))
  throw new Error("playground does not consume the public package");
if (source.includes("../packages/three-hud/src/"))
  throw new Error("playground deep-imports package source");
const docs = ["docs/api/GETTING_STARTED.md", "docs/api/WIDGETS.md"];
for (const file of docs) {
  if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
}
console.log("examples:verify passed");
