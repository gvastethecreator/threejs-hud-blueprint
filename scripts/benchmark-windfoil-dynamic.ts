import fs from "node:fs";
import path from "node:path";
import { WindfoilGlyphAtlas } from "../packages/three-hud/src/text/windfoil/atlas.ts";
import type { ParsedFontFace, ParsedGlyph } from "../packages/three-hud/src/text/windfoil/types.ts";

function box(glyphId: number): ParsedGlyph {
  return {
    glyphId,
    advanceWidth: 500,
    leftSideBearing: 0,
    empty: false,
    contours: [
      [
        { type: "move", p: { x: 0, y: 0 } },
        { type: "line", p: { x: 200, y: 0 } },
        { type: "line", p: { x: 200, y: 400 } },
        { type: "close" },
      ],
    ],
  };
}

const source: ParsedFontFace = {
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  lineGap: 0,
  unicodeToGlyph: { "48": 0, "49": 1, "57": 9 },
  kerning: {},
  glyphs: [0, 1, 9].map(box),
};

const atlas = new WindfoilGlyphAtlas();
const timeline = [];
const t0 = performance.now();
timeline.push({ step: "99", ...atlas.ensureGlyphs("counter", [9, 9], source), ms: 0 });
const t1 = performance.now();
timeline.push({ step: "100", ...atlas.ensureGlyphs("counter", [1, 0, 0], source), ms: t1 - t0 });
const memory = atlas.diagnostics();
atlas.dispose();
const report = {
  schemaVersion: "three-hud/windfoil-atlas/v0",
  timeline,
  memory,
  afterDispose: atlas.diagnostics(),
};
const out = path.resolve("evidence/tickets/HUD-040/reports/atlas-growth.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify({
    prepared99: timeline[0]?.preparedNew,
    prepared100: timeline[1]?.preparedNew,
    cpuBytes: memory.cpuBytes,
  }),
);
