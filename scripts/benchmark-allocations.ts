import fs from "node:fs";
import path from "node:path";
import { Matrix4 } from "three";
import { HudResourcePool } from "../packages/three-hud/src/render/resourcePool.ts";

const matrix = new Matrix4();
const pool = new HudResourcePool({ initialCapacity: 16, maxCapacity: 4096 });
const before = pool.diagnostics();
pool.beginFrame();
for (let index = 0; index < 100; index += 1) {
  pool.writeInstance(pool.acquireSlot(), matrix, 0x88aacc);
}
pool.endFrame();
const warmed = pool.diagnostics();
const allocationsAfterWarmup = warmed.allocations;
pool.beginFrame();
for (let index = 0; index < 100; index += 1) {
  pool.writeInstance(pool.acquireSlot(), matrix, 0x88aacc);
}
pool.endFrame();
const steady = pool.diagnostics();
pool.dispose();
const afterDispose = pool.diagnostics();
const report = {
  schemaVersion: "three-hud/render-pool/v0",
  beforeWarmup: before,
  afterWarmup: warmed,
  afterSteadyFrame: {
    ...steady,
    allocationsUnchanged: steady.allocations === allocationsAfterWarmup,
  },
  afterDispose,
};
if (warmed.geometryCount !== 1 || warmed.materialCount !== 1) {
  throw new Error("100-primitive fixture used more than one geometry or material.");
}
if (steady.allocations !== allocationsAfterWarmup) {
  throw new Error("steady-state frame allocated after warm-up.");
}
const out = path.resolve("evidence/tickets/HUD-026/reports/allocations.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
