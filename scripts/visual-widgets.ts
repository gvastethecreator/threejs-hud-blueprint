import fs from "node:fs";
import path from "node:path";
import { HUD } from "../packages/three-hud/src/core/HUD.ts";
import type { HudLayer } from "../packages/three-hud/src/core/HudLayer.ts";
import { Crosshair } from "../packages/three-hud/src/widgets/Crosshair.ts";
import { Gauge } from "../packages/three-hud/src/widgets/Gauge.ts";
import { Hotbar } from "../packages/three-hud/src/widgets/Hotbar.ts";
import { LinearBar } from "../packages/three-hud/src/widgets/LinearBar.ts";
import { RadialBar } from "../packages/three-hud/src/widgets/RadialBar.ts";
import { encodeOverlayQueue } from "../packages/three-hud/src/render/encodeOverlayQueue.ts";
import { hashRgba, rasterCommands } from "../packages/three-hud/src/render/overlayRaster.ts";

const filter = process.argv.slice(2).find((arg) => !arg.startsWith("-")) ?? "all";
const verify = process.argv.includes("--verify");
const write = process.argv.includes("--write-baseline");
const baselinePath = path.resolve("fixtures/visual/widget-hashes.json");

const builders: Record<string, (layer: HudLayer) => void> = {
  "linear-bar": (layer) => {
    const bar = new LinearBar({ id: "hp", width: 120, height: 16, value: 40, delayedValue: 70 });
    bar.setPosition(8, 8);
    layer.add(bar);
  },
  linear: (layer) => {
    const bar = new LinearBar({ id: "lin", width: 80, height: 12, value: 50 });
    bar.setPosition(8, 8);
    layer.add(bar);
  },
  radial: (layer) => {
    const ring = new RadialBar({ id: "ammo", width: 48, height: 48, value: 25, max: 100 });
    ring.setPosition(8, 8);
    layer.add(ring);
  },
  crosshair: (layer) => {
    const cross = new Crosshair({ id: "cross", dot: true });
    cross.setPosition(56, 56);
    layer.add(cross);
  },
  hotbar: (layer) => {
    const bar = new Hotbar({ id: "hot", slots: [{ key: "a" }, { key: "b" }] });
    bar.setPosition(8, 96);
    layer.add(bar);
  },
  gauge: (layer) => {
    const gauge = new Gauge({ id: "g", width: 48, height: 48, value: 3, max: 10 });
    gauge.setPosition(8, 8);
    layer.add(gauge);
  },
};

function hashWidget(name: string): string {
  const builder = builders[name];
  if (!builder) throw new Error(`unknown widget ${name}`);
  const hud = new HUD({ referenceSize: { width: 128, height: 128 } });
  const layer = hud.createLayer({ id: "w", scaleMode: "native" });
  builder(layer);
  const queue = encodeOverlayQueue([layer], "webgl").snapshot();
  if (queue.commands.length === 0) throw new Error(`${name} encoded zero overlay commands`);
  const hash = hashRgba(rasterCommands(queue.commands, 128, 128));
  hud.dispose();
  return hash;
}

const names =
  filter === "all"
    ? Object.keys(builders)
    : Object.keys(builders).filter((name) => name.includes(filter));
const hashes: Record<string, string> = {};
for (const name of names) hashes[name] = hashWidget(name);

if (write) {
  const current = fs.existsSync(baselinePath)
    ? (JSON.parse(fs.readFileSync(baselinePath, "utf8")) as { hashes: Record<string, string> })
    : { hashes: {} };
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
  fs.writeFileSync(
    baselinePath,
    `${JSON.stringify(
      { schemaVersion: "three-hud/widget-hash/v0", hashes: { ...current.hashes, ...hashes } },
      null,
      2,
    )}\n`,
  );
}

if (verify) {
  if (!fs.existsSync(baselinePath)) throw new Error("missing fixtures/visual/widget-hashes.json");
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8")) as {
    hashes: Record<string, string>;
  };
  for (const [key, hash] of Object.entries(hashes)) {
    if (baseline.hashes[key] !== hash)
      throw new Error(`widget hash mismatch for ${key}: ${hash} != ${baseline.hashes[key]}`);
  }
  const unique = new Set(Object.values(hashes));
  if (names.length > 1 && unique.size < 2)
    throw new Error("widget rasters are not distinct; visual gate is not discriminating");
}

console.log(JSON.stringify({ filter, hashes, commandVerified: verify, write }));
