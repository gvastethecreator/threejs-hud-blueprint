import fs from "node:fs";
import path from "node:path";
import { HUD } from "../packages/three-hud/src/core/HUD.ts";
import { HudError } from "../packages/three-hud/src/contracts/errors.ts";
import {
  createMockRenderer,
  createMockRendererAdapter,
  createMockResource,
  createMockTextBackend,
} from "../packages/three-hud/src/testing/mocks.ts";

if (!process.argv.includes("--mock")) {
  throw new Error(
    "memory:verify cannot pass on a mock ledger; no WEBGL_lose_context profile was measured",
  );
}

const ledger = { create: 0, dispose: 0, late: 0 };

for (let index = 0; index < 3; index += 1) {
  const adapter = createMockRendererAdapter();
  const hud = new HUD({
    referenceSize: { width: 64, height: 64 },
    rendererAdapter: adapter,
  });
  ledger.create += 1;
  await hud.initialize();
  hud.dispose();
  hud.dispose();
  ledger.dispose += 1;
  queueMicrotask(() => {
    ledger.late += 1;
    if (hud.state !== "disposed") throw new Error("late callback revived HUD");
  });
}
await new Promise((resolve) => setTimeout(resolve, 0));

const renderer = createMockRenderer();
renderer.dispose();
const backend = createMockTextBackend();
backend.dispose();
const owned = createMockResource({ id: "atlas", ownership: "owned" });
owned.dispose();
const borrowed = createMockResource({ id: "host-texture", ownership: "borrowed" });
let borrowedThrew = false;
try {
  borrowed.dispose();
} catch (error) {
  borrowedThrew = error instanceof HudError && error.code === "INVALID_STATE";
}
if (!borrowedThrew) throw new Error("borrowed resource was disposed");
if (!owned.disposed) throw new Error("owned resource was not disposed");
if (ledger.create !== 3 || ledger.dispose !== 3) {
  throw new Error(`resource counters did not return to baseline: ${JSON.stringify(ledger)}`);
}

const dir = path.resolve("evidence/tickets/HUD-066/reports");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  joinSafe(dir, "ledger.json"),
  `${JSON.stringify({ ledger, borrowedThrew, ownedDisposed: owned.disposed }, null, 2)}\n`,
);
console.log("test:resources passed");

function joinSafe(dirName: string, fileName: string): string {
  return path.join(dirName, fileName);
}
