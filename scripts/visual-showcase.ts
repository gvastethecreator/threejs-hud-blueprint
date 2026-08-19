import fs from "node:fs";
import path from "node:path";
import { HUD } from "../packages/three-hud/src/core/HUD.ts";
import { Hotbar } from "../packages/three-hud/src/widgets/Hotbar.ts";
import { InventoryGrid } from "../packages/three-hud/src/widgets/InventoryGrid.ts";
import { LinearBar } from "../packages/three-hud/src/widgets/LinearBar.ts";
import { Panel } from "../packages/three-hud/src/widgets/Panel.ts";
import { encodeOverlayQueue } from "../packages/three-hud/src/render/encodeOverlayQueue.ts";
import { hashRgba, rasterCommands } from "../packages/three-hud/src/render/overlayRaster.ts";

const verify = process.argv.includes("--verify");
const write = process.argv.includes("--write-baseline");
const baselinePath = path.resolve("fixtures/visual/showcase-hash.json");

const hud = new HUD({ referenceSize: { width: 256, height: 256 } });
const layer = hud.createLayer({ id: "show", scaleMode: "native" });
const panel = new Panel({ id: "panel", width: 80, height: 40 });
panel.setPosition(8, 8);
layer.add(panel);
const bar = new LinearBar({ id: "bar", width: 100, height: 12, value: 10 });
bar.setPosition(8, 56);
layer.add(bar);
const inventory = new InventoryGrid({ id: "pack", columns: 4, rows: 2, cellSize: 16 });
inventory.setPosition(8, 80);
layer.add(inventory);
const hotbar = new Hotbar({ id: "hot" });
hotbar.setPosition(8, 160);
layer.add(hotbar);
const queue = encodeOverlayQueue([layer], "webgl").snapshot();
if (queue.commands.length < 8) throw new Error("showcase encoded too few overlay commands");
const hash = hashRgba(rasterCommands(queue.commands, 256, 256));
const showcase = {
  panel: panel.size.width,
  bar: bar.fillNode.size.width,
  inventory: inventory.slots.length,
  hotbar: hotbar.slots.length,
  commands: queue.commands.length,
  hash,
};
hud.dispose();

if (write) {
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
  fs.writeFileSync(
    baselinePath,
    `${JSON.stringify({ schemaVersion: "three-hud/showcase-hash/v0", hash }, null, 2)}\n`,
  );
}

if (verify) {
  if (showcase.inventory !== 8 || showcase.hotbar !== 6)
    throw new Error("showcase snapshot drifted");
  if (!fs.existsSync(baselinePath)) throw new Error("missing fixtures/visual/showcase-hash.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8")) as { hash: string };
  if (baseline.hash !== hash)
    throw new Error(`showcase raster mismatch: ${hash} != ${baseline.hash}`);
}

console.log(JSON.stringify({ showcase, verified: verify }));
