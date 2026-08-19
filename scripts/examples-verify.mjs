import fs from "node:fs";
import path from "node:path";

const playground = path.resolve("apps/playground/src/main.ts");
const source = fs.readFileSync(playground, "utf8");
if (!source.includes("@scope/three-hud"))
  throw new Error("playground does not consume the public package");
if (source.includes("../packages/three-hud/src/"))
  throw new Error("playground deep-imports package source");
const pkg = JSON.parse(fs.readFileSync("packages/three-hud/package.json", "utf8"));
const docs = ["docs/api/GETTING_STARTED.md", "docs/api/WIDGETS.md", "docs/api/TYPOGRAPHY.md"];
for (const file of docs) {
  if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
}
const gettingStarted = fs.readFileSync("docs/api/GETTING_STARTED.md", "utf8");
for (const symbol of ["HUD", "LinearBar", "createHudOverlayAdapter", "probeRendererCapabilities"]) {
  if (!gettingStarted.includes(symbol)) throw new Error(`getting-started missing ${symbol}`);
}
if (!gettingStarted.includes("hud.dispose()")) throw new Error("getting-started missing dispose");
if (!gettingStarted.includes("@scope/three-hud"))
  throw new Error("getting-started missing public import");
if (!pkg.exports?.["."] || !pkg.exports?.["./text/windfoil"])
  throw new Error("packed export map missing getting-started imports");
const widgets = fs.readFileSync("docs/api/WIDGETS.md", "utf8");
for (const widget of [
  "Panel",
  "Label",
  "IconLabel",
  "LinearBar",
  "RadialBar",
  "Gauge",
  "Crosshair",
  "InventoryGrid",
  "Hotbar",
]) {
  if (!widgets.includes(widget)) throw new Error(`widget recipes missing ${widget}`);
}
if (!fs.existsSync("apps/playground/src/labs/capability.ts"))
  throw new Error("missing playground capability lab");
console.log("examples:verify passed");
