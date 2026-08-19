export {
  CUBIC_APPROXIMATION_POLICY,
  parseTrueTypeFont,
  preprocessWindfoilFace,
  preprocessWindfoilFont,
  serializeWindfoilPreprocess,
} from "./windfoil/preprocess.js";
export {
  WINDFOIL_THREE_PUBLIC_APIS,
  createWindfoilThreeSpike,
  encodeWindfoilInstances,
} from "./windfoil/threeSpike.js";
export type {
  EncodedWindfoilDraw,
  EncodedWindfoilInstance,
  WindfoilDrawResult,
  WindfoilGlyphInstance,
  WindfoilThreeSpike,
} from "./windfoil/threeSpike.js";
export {
  defaultWindfoilMatrixFace,
  listWindfoilMatrixScenarios,
  runWindfoilEvidenceMatrix,
} from "./windfoil/matrix.js";
export type {
  WindfoilArtifactClass,
  WindfoilMatrixRecord,
  WindfoilMatrixScenario,
} from "./windfoil/matrix.js";
export type {
  FontPoint,
  OutlineCommand,
  ParsedFontFace,
  ParsedGlyph,
  QuadraticSegment,
  WindfoilGlyphRecord,
  WindfoilPreprocessOptions,
  WindfoilPreprocessResult,
} from "./windfoil/types.js";

export {
  WINDFOIL_EXPOSURE,
  WINDFOIL_PACKAGE_SUBPATH,
  WindfoilTextBackend,
  createWindfoilTextBackend,
  type PreparedWindfoilText,
  type WindfoilTextBackendOptions,
} from "./windfoil/adapter.js";
export {
  WindfoilGlyphAtlas,
  type AtlasDiagnostics,
  type AtlasEnsureResult,
} from "./windfoil/atlas.js";
export {
  WINDFOIL_RESTORE_POLICY,
  WINDFOIL_SCALE_LIMITS,
  diagnoseWindfoilScale,
  type WindfoilRuntimeState,
} from "./windfoil/limits.js";
export type WindfoilBackendExposure = "production" | "experimental" | "blocked";
