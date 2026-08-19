import fs from "node:fs";
import path from "node:path";
import { HUD } from "../packages/three-hud/src/core/HUD.ts";
import { Line } from "../packages/three-hud/src/primitives/Line.ts";
import { Ring } from "../packages/three-hud/src/primitives/Ring.ts";
import { RoundedRect } from "../packages/three-hud/src/primitives/RoundedRect.ts";
import { Rect } from "../packages/three-hud/src/primitives/Rect.ts";
import { Label } from "../packages/three-hud/src/widgets/Label.ts";
import { encodeOverlayQueue } from "../packages/three-hud/src/render/encodeOverlayQueue.ts";
import { hashRgba, rasterCommands } from "../packages/three-hud/src/render/overlayRaster.ts";
import type { HudDrawCommand } from "../packages/three-hud/src/render/commands.ts";

const verify = process.argv.includes("--verify");
const write = process.argv.includes("--write-baseline");
const baselinePath = path.resolve("fixtures/visual/primitive-hashes.json");

const hud = new HUD({ referenceSize: { width: 128, height: 128 } });
const layer = hud.createLayer({ id: "lab", scaleMode: "native" });
layer.add(new Rect({ id: "rect", width: 32, height: 32, fill: 0xff0000 }));
layer
  .add(new RoundedRect({ id: "round", width: 32, height: 32, radius: 8, fill: 0x00ff00 }))
  .setPosition(40, 0);
layer.add(new Line({ id: "line", x1: 0, y1: 48, x2: 48, y2: 48, strokeWidth: 4, fill: 0x0000ff }));
layer
  .add(new Ring({ id: "ring", innerRadius: 8, outerRadius: 16, sweep: Math.PI, fill: 0xffff00 }))
  .setPosition(64, 40);
layer.add(new Label({ id: "label", text: "HP", fontSize: 12 })).setPosition(0, 80);
const queue = encodeOverlayQueue([layer], "webgl").snapshot();
const hashes: Record<string, string> = {};
for (const command of queue.commands) {
  const local = localize(command);
  hashes[keyOf(command)] = hashRgba(rasterCommands([local], 32, 32));
}
if (write) {
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
  fs.writeFileSync(
    baselinePath,
    `${JSON.stringify({ schemaVersion: "three-hud/visual-hash/v0", hashes }, null, 2)}\n`,
  );
}
if (verify) {
  throw new Error(
    "visual:verify cannot pass on none-cpu-raster CPU overlay hashes; this entry is not a GPU/browser visual profile",
  );
}
console.log(JSON.stringify({ commandCount: queue.commands.length, hashes, verified: verify }));
hud.dispose();

function keyOf(command: HudDrawCommand): string {
  if (command.kind === "text") return `text:${command.sourceNodeId}`;
  if (command.kind === "shape") return `shape:${command.shape}`;
  return `${command.kind}:${command.sourceNodeId}`;
}

function localize(command: HudDrawCommand): HudDrawCommand {
  if (command.kind === "shape" && command.shape === "line") {
    return {
      ...command,
      bounds: { x: 2, y: 14, width: 28, height: 4 },
      shapeParams: { x1: 2, y1: 16, x2: 30, y2: 16, strokeWidth: 4 },
    };
  }
  if (command.kind === "shape") {
    return {
      ...command,
      bounds: { x: 2, y: 2, width: 28, height: 28 },
    };
  }
  if (command.kind === "text") {
    return {
      ...command,
      glyphs: command.glyphs.map((glyph, index) => ({
        ...glyph,
        x: 2 + index * 8,
        y: 8,
        width: 8,
        height: 12,
      })),
    };
  }
  return command;
}
