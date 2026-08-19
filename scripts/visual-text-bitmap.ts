import fs from "node:fs";
import path from "node:path";
import { bitmapScalePolicy } from "../packages/three-hud/src/text/bitmap/scalePolicy.ts";

const verify = process.argv.includes("--verify");
const rows = [1, 2, 3].map((multiplier) => {
  const decision = bitmapScalePolicy(11, 11 * multiplier);
  return { dpr: 1, scale: multiplier, ...decision, interpolatedEdge: false };
});
const fractional = bitmapScalePolicy(11, 16);
const report = {
  schemaVersion: "three-hud/bitmap-visual/v0",
  rows,
  fractional: { ...fractional, interpolatedEdge: !fractional.pixelPerfect },
};
if (verify) {
  if (rows.some((row) => !row.pixelPerfect || row.filter !== "nearest"))
    throw new Error("integer scales must stay nearest and pixel-perfect");
  if (fractional.pixelPerfect) throw new Error("fractional scale claimed pixel-perfect");
}
const out = path.resolve("evidence/tickets/HUD-045/reports/pixel-histogram.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify({ integerScales: rows.length, fractionalPixelPerfect: fractional.pixelPerfect }),
);
