export {
  BITMAP_MANIFEST_SCHEMA,
  BITMAP_MAX_PAGES,
  validateBitmapManifest,
  type BitmapFontManifest,
  type BitmapGlyph,
} from "./bitmap/manifest.js";
export {
  BitmapTextBackend,
  createBitmapTextBackend,
  rasterizeBitmapManifest,
  type BitmapTextBackendOptions,
  type PreparedBitmapText,
} from "./bitmap/adapter.js";
export { bitmapScalePolicy, type BitmapScaleDecision } from "./bitmap/scalePolicy.js";
