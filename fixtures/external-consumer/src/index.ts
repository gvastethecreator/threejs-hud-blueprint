import {
  HUD,
  probeRendererCapabilities,
  resolveViewport,
  type HudScaleMode,
} from "@scope/three-hud";
import { createBitmapTextBackend } from "@scope/three-hud/text/bitmap";
import { preprocessWindfoilFace } from "@scope/three-hud/text/windfoil";

const mode: HudScaleMode = "contain";
const hud = new HUD({ referenceSize: { width: 1920, height: 1080 } });
hud.createLayer({ referenceSize: hud.referenceSize, scaleMode: mode });
const viewport = resolveViewport({
  referenceSize: hud.referenceSize,
  viewport: { x: 0, y: 0, width: 1280, height: 720 },
  mode,
});
const backend = createBitmapTextBackend();
const capabilities = await probeRendererCapabilities({
  isWebGLRenderer: true,
  capabilities: { isWebGL2: true, maxTextureSize: 4096 },
  getPixelRatio: () => 1,
});

const preprocess = preprocessWindfoilFace({
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  lineGap: 0,
  unicodeToGlyph: { "32": 0 },
  kerning: {},
  glyphs: [
    {
      glyphId: 0,
      advanceWidth: 250,
      leftSideBearing: 0,
      contours: [],
      empty: true,
    },
  ],
});

export { backend, capabilities, hud, preprocess, viewport };
