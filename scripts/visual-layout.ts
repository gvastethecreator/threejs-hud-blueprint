import fs from "node:fs";
import path from "node:path";
import { HudNode } from "../packages/three-hud/src/core/HudNode.ts";
import { layoutNode, setLayoutProps } from "../packages/three-hud/src/layout/box.ts";
import { anchorSheet, layoutAbsolute } from "../packages/three-hud/src/layout/absolute.ts";
import { layoutStack } from "../packages/three-hud/src/layout/stack.ts";
import { layoutGrid } from "../packages/three-hud/src/layout/grid.ts";

const verify = process.argv.includes("--verify");
const a = new HudNode({ id: "a", width: 20, height: 10 });
const b = new HudNode({ id: "b", width: 20, height: 10 });
const stack = layoutStack([a, b], { direction: "horizontal", gap: 4, width: 80 });
const node = new HudNode({ id: "abs", width: 20, height: 20 });
layoutAbsolute(node, {
  anchor: "center",
  pivot: { x: 0.5, y: 0.5 },
  reference: { width: 100, height: 80 },
});
const cells = layoutGrid(
  Array.from({ length: 4 }, (_, index) => new HudNode({ id: `c${index}`, width: 16, height: 16 })),
  { columns: 2, rows: 2, cellWidth: 16, cellHeight: 16, gapX: 2, gapY: 2 },
);
setLayoutProps(a, { clip: true, width: 20, height: 10 });
const clipped = layoutNode(a, { width: 20, height: 10 });
const report = {
  schemaVersion: "three-hud/layout-regression/v0",
  baselinesRequireApproval: true,
  stack,
  absolute: node.position,
  cells,
  clipped,
};
const size = { width: 200, height: 80 };
const wide = anchorSheet({ width: 1920, height: 1080 }, size);
const tall = anchorSheet({ width: 1080, height: 1920 }, size);
if (verify) {
  if (stack.width !== 80) throw new Error("stack snapshot drifted");
  if (node.position.x !== 40 || node.position.y !== 30)
    throw new Error("absolute snapshot drifted");
  if (cells.length !== 4) throw new Error("grid snapshot drifted");
  if (wide["bottom-right"]?.x !== 1720 || tall["bottom-right"]?.x !== 880)
    throw new Error("anchor sheet drifted");
}
const hud047 = path.resolve("evidence/tickets/HUD-047/fixtures");
fs.mkdirSync(hud047, { recursive: true });
fs.writeFileSync(
  path.join(hud047, "anchor-sheet.json"),
  `${JSON.stringify({ wide, tall, size }, null, 2)}\n`,
);
const dir = path.resolve("evidence/tickets/HUD-050/reports");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "layout.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(dir, "layout-report.html"),
  `<!doctype html><meta charset="utf-8"><title>Layout</title><pre>${JSON.stringify(report, null, 2)}</pre>\n`,
);
console.log(JSON.stringify({ stack: stack.width, cells: cells.length, verified: verify }));
