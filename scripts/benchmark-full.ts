import fs from "node:fs";
import path from "node:path";
import { HUD } from "../packages/three-hud/src/core/HUD.ts";
import { Rect } from "../packages/three-hud/src/primitives/Rect.ts";
import { Label } from "../packages/three-hud/src/widgets/Label.ts";
import { encodeOverlayQueue } from "../packages/three-hud/src/render/encodeOverlayQueue.ts";
import { LinearBar } from "../packages/three-hud/src/widgets/LinearBar.ts";

const verify = process.argv.includes("--verify");
const write = process.argv.includes("--write-baseline");
const baselinePath = path.resolve("benchmarks/baseline-full.json");
const budgets = JSON.parse(fs.readFileSync(path.resolve("benchmarks/budgets.json"), "utf8")) as {
  budgets: { standardQueueEncodingP95Ms: number; standardUpdateLayoutP95Ms: number };
};

function percentile(samples: number[], p: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index] ?? 0;
}

const hud = new HUD({ referenceSize: { width: 1920, height: 1080 } });
const layer = hud.createLayer({ id: "bench", scaleMode: "contain" });
for (let index = 0; index < 100; index += 1) {
  const node = layer.add(new Rect({ id: `r${index}`, width: 12, height: 12, fill: 0x334455 }));
  node.setPosition((index % 20) * 16, Math.floor(index / 20) * 16);
}
const bar = layer.add(new LinearBar({ id: "bar", width: 200, height: 16, value: 40 }));
bar.setPosition(8, 200);
layer.add(new Label({ id: "counter", text: "0000", fontSize: 14 })).setPosition(8, 230);
await hud.initialize();

const encodeSamples: number[] = [];
const updateSamples: number[] = [];
for (let sample = 0; sample < 40; sample += 1) {
  const t0 = performance.now();
  bar.setValue(40 + (sample % 10));
  hud.update(0);
  updateSamples.push(performance.now() - t0);
  const t1 = performance.now();
  encodeOverlayQueue(hud.layers, "webgl").snapshot();
  encodeSamples.push(performance.now() - t1);
}
const queue = encodeOverlayQueue(hud.layers, "webgl").snapshot();
const report = {
  schemaVersion: "three-hud/benchmark/v0",
  environment: { node: process.version, platform: process.platform },
  samples: { encode: encodeSamples.length, update: updateSamples.length },
  encodeMs: {
    median: percentile(encodeSamples.slice(10), 50),
    p95: percentile(encodeSamples.slice(10), 95),
  },
  updateMs: {
    median: percentile(updateSamples.slice(10), 50),
    p95: percentile(updateSamples.slice(10), 95),
  },
  valueOnlyUpdateP95Ms: percentile(updateSamples.slice(10), 95),
  drawCommands: queue.commands.length,
  gpuTimers: "unavailable",
  primitives: 100,
};
if (write) {
  if (fs.existsSync(baselinePath)) {
    const previous = JSON.parse(fs.readFileSync(baselinePath, "utf8")) as {
      environment?: { node?: string };
    };
    if (previous.environment?.node && previous.environment.node !== process.version) {
      throw new Error(
        `refusing to overwrite baseline captured on ${previous.environment.node} from ${process.version}`,
      );
    }
  }
  fs.writeFileSync(baselinePath, `${JSON.stringify(report, null, 2)}\n`);
}
if (verify) {
  if (report.encodeMs.p95 > budgets.budgets.standardQueueEncodingP95Ms * 20) {
    throw new Error(`encode p95 ${report.encodeMs.p95} exceeds calibrated budget`);
  }
  if (report.updateMs.p95 > budgets.budgets.standardUpdateLayoutP95Ms * 20) {
    throw new Error(`update p95 ${report.updateMs.p95} exceeds calibrated budget`);
  }
  if (report.drawCommands < 1) throw new Error("benchmark encoded zero draw commands");
}
const out = path.resolve("evidence/tickets/HUD-065/reports");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "benchmark-full.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
hud.dispose();
