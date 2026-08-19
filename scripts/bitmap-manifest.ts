import fs from "node:fs";
import path from "node:path";
import {
  validateBitmapManifest,
  type BitmapFontManifest,
} from "../packages/three-hud/src/text/bitmap/manifest.ts";

const verify = process.argv.includes("--verify");
const fixture: BitmapFontManifest = {
  schemaVersion: "three-hud/bitmap-font/v0",
  nativeSize: 11,
  lineHeight: 12,
  baseline: 9,
  pages: 1,
  sourceHash: "fixture",
  license: {
    family: "example-pixel-ui",
    sourceUrl: "https://example.invalid/pixel",
    licenseId: "OFL-1.1",
    redistributionAllowed: false,
  },
  glyphs: [{ id: 65, x: 0, y: 0, width: 8, height: 11, xAdvance: 8, xOffset: 0, yOffset: 0 }],
  kerning: {},
};
const valid = validateBitmapManifest(fixture);
if (verify && valid.pages !== 1) throw new Error("v0.1 must cap atlas pages at 1");
const out = path.resolve("evidence/tickets/HUD-044/reports/manifest.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(valid, null, 2)}\n`);
console.log(
  JSON.stringify({
    nativeSize: valid.nativeSize,
    pages: valid.pages,
    redistributionAllowed: valid.license.redistributionAllowed,
  }),
);
