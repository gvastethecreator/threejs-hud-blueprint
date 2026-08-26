export { HUD, type HudClock, type HudLifecycleState, type HudOptions } from "./core/HUD.js";
export { HudLayer, type HudLayerOptions } from "./core/HudLayer.js";
export {
  HudNode,
  type HudNodeOptions,
  type LayoutVisibility,
  type PointerEventsPolicy,
} from "./core/HudNode.js";
export { DirtyFlag, dirtyFlagNames, type InvalidationCounters } from "./core/DirtyFlags.js";
export {
  HUD_ORDER_AUTHORITY,
  collectHitOrder,
  collectPaintOrder,
  compareHudOrder,
} from "./core/order.js";
export {
  USER_KEY_SCOPE,
  snapshotHud,
  snapshotHudTree,
  type DuplicateUserKeyRecord,
  type HudNodeSnapshot,
  type HudSnapshot,
  type HudTreeSnapshot,
} from "./core/snapshot.js";
export {
  layoutStack,
  snapshotStack,
  type StackAlign,
  type StackOptions,
  type StackSnapshot,
} from "./layout/stack.js";
export {
  clampMinMax,
  getLayoutBox,
  getLayoutProps,
  layoutDirty,
  layoutNode,
  measureNode,
  participatesInLayout,
  setLayoutProps,
  snapshotLayoutBox,
  type LayoutBox,
  type LayoutConstraints,
  type LayoutDimension,
  type LayoutProps,
} from "./layout/box.js";
export {
  ANCHOR_PRESETS,
  anchorPoint,
  anchorSheet,
  layoutAbsolute,
  resolveFrame,
  type AnchorPreset,
  type AnchorTarget,
} from "./layout/absolute.js";
export {
  gridContentSize,
  layoutGrid,
  type GridCell,
  type GridOptions,
  type GridOverflowPolicy,
} from "./layout/grid.js";
export { createLayoutDebugOverlays, type LayoutDebugKind } from "./layout/debug.js";
export { layoutNodePath } from "./layout/path.js";
export { Rect, type BorderPolicy, type RectOptions } from "./primitives/Rect.js";
export { RoundedRect, type RoundedRectOptions } from "./primitives/RoundedRect.js";
export { Line, type LineAlignment, type LineOptions } from "./primitives/Line.js";
export {
  HudImage as Image,
  HudImage,
  type HudTextureHandle,
  type ImageOptions,
  type TextureFilter,
  type TextureOwnership,
} from "./primitives/Image.js";
export { NineSlice, type NineSliceOptions } from "./primitives/NineSlice.js";
export {
  Arc,
  Ring,
  RING_SEGMENT_CAP,
  RING_TICK_CAP,
  type RingDirection,
  type RingOptions,
} from "./primitives/Ring.js";
export { LinearBar, type LinearBarOptions } from "./widgets/LinearBar.js";
export { Panel, type PanelOptions } from "./widgets/Panel.js";
export { RadialBar, type RadialBarOptions } from "./widgets/RadialBar.js";
export { Crosshair, Reticle, type CrosshairOptions } from "./widgets/Crosshair.js";
export { Label, type LabelOptions } from "./widgets/Label.js";
export { IconLabel, type IconLabelOptions } from "./widgets/IconLabel.js";
export { Gauge, type GaugeOptions } from "./widgets/Gauge.js";
export { Compass, type CompassOptions } from "./widgets/Compass.js";
export { Slot, type SlotData, type SlotOptions } from "./widgets/Slot.js";
export { InventoryGrid, type InventoryGridOptions } from "./widgets/InventoryGrid.js";
export { Hotbar, type HotbarOptions } from "./widgets/Hotbar.js";
export { hitTest, isEligible } from "./input/hitTest.js";
export {
  mapPointerToLayer,
  pickLayerAt,
  type MappedPointer,
  type PointerMapInput,
} from "./input/pointerMap.js";
export {
  HudPointerController,
  type HudPointerEvent,
  type HudPointerInput,
  type HudPointerPhase,
  type HudPointerType,
  type PointerDispatchOptions,
  type PointerListener,
} from "./input/dispatcher.js";
export { connectHudPointerEvents, type ConnectedPointer } from "./input/connectPointer.js";
export {
  DEFAULT_THEME,
  MONOCHROME_INVERT_THEME,
  MONOCHROME_THEME,
  PIXEL_THEME,
  THEME_PRECEDENCE,
  applyStyle,
  createMonochromeTheme,
  isGrayscaleColor,
  resolveToken,
  resolveWidgetStyle,
  serializeTheme,
  themeColor,
  type HudTheme,
  type InteractionState,
  type TokenRef,
  type WidgetStyleSet,
} from "./theme/theme.js";
export {
  HudError,
  HudFeatureUnavailableError,
  type HudErrorCode,
  type HudErrorDetails,
} from "./contracts/errors.js";
export {
  emitDiagnostic,
  type HudDiagnostic,
  type HudDiagnosticHandler,
  type HudDiagnosticSeverity,
} from "./contracts/diagnostics.js";
export type {
  CapabilityReason,
  CapabilityReasonCode,
  FeatureSupport,
  HudActiveBackend,
  HudRendererKind,
  ProbeRendererOptions,
  ProbedRendererKind,
  RendererCapabilities,
  RendererCapabilityReport,
  RendererCapabilityStatus,
  TextBackendCapabilities,
} from "./contracts/capabilities.js";
export { RENDERER_CAPABILITY_REPORT_SCHEMA } from "./contracts/capabilities.js";
export { probeRendererCapabilities } from "./render/renderer-capabilities.js";
export {
  overlayStateDiff,
  restoreRendererOverlayState,
  snapshotRendererOverlayState,
  type OverlayRendererLike,
  type OverlayVec4,
  type RendererOverlayState,
} from "./render/overlayState.js";
export {
  OVERLAY_COLOR_POLICY,
  resolveOverlayRendererProfile,
  type OverlayRendererProfile,
} from "./render/overlayProfile.js";
export { encodeOverlayQueue } from "./render/encodeOverlayQueue.js";
export { effectiveClip, intersectRects } from "./render/clip.js";
export {
  createHudOverlayAdapter,
  type HudOverlayAdapter,
  type HudOverlayAdapterOptions,
} from "./render/createHudOverlayAdapter.js";
export type {
  HudBlendMode,
  HudScaleMode,
  IntegerDownscalePolicy,
  ReadonlyInsets,
  ReadonlyPoint,
  ReadonlyRect,
  ReadonlySize,
} from "./contracts/geometry.js";
export {
  MODULE_CONTRACTS,
  type ModuleContract,
  type SharedContractId,
} from "./contracts/moduleContracts.js";
export {
  THREE_HUD_IMPLEMENTATION_STATUS,
  THREE_HUD_PACKAGE_VERSION,
  THREE_HUD_SCHEMA_VERSION,
} from "./contracts/version.js";
export type { HudFrameInfo, HudRendererAdapter } from "./render/contracts.js";
export {
  composeBatchKey,
  serializeDrawCommand,
  type DebugCommand,
  type DrawCommandBase,
  type HudDrawCommand,
  type HudDrawKind,
  type HudShapeKind,
  type ImageInstanceCommand,
  type ResourceHandle,
  type ShapeInstanceCommand,
  type TextDrawableCommand,
} from "./render/commands.js";
export {
  RenderQueue,
  compareDrawCommand,
  type RenderBatch,
  type RenderQueueSnapshot,
} from "./render/renderQueue.js";
export {
  HudResourcePool,
  type PoolDiagnostics,
  type HudResourcePoolOptions,
} from "./render/resourcePool.js";
export {
  createGlyphRun,
  fontCacheKey,
  freezeGlyphRun,
  isPreprocessedFontAsset,
  resolveFontMetadata,
  selectTextBackend,
  type FontLicenseRecord,
  type FontMetadata,
  type FontRegistration,
  type FontRenderMode,
  type FontSource,
  type FontStyle,
  type GlyphLine,
  type GlyphPlacement,
  type GlyphRun,
  type TextBackendDecision,
  type TextBackendDecisionStatus,
  type TextBackendRequest,
  type PixelFontPolicy,
  type PixelFontRenderIntent,
  type PreprocessedFontAsset,
  type TextBackend,
} from "./text/contracts.js";
export {
  BUNDLED_FONT_LICENSES,
  EXAMPLE_FONT_LICENSE_RECORDS,
  EXAMPLE_PIXEL_FONT_POLICY,
  enumerateBundledFontLicenses,
  FONT_BINARY_EXTENSIONS,
} from "./text/fontLicenses.js";
export {
  layoutCacheKey,
  normalizeTextStyle,
  paintCacheKey,
  type NormalizedTextStyle,
  type TextAlign,
  type TextOverflow,
  type TextStyle,
  type TextWrap,
} from "./text/textStyle.js";
export {
  MeasurementCache,
  type Measurement,
  type MeasurementCacheStats,
} from "./text/measurementCache.js";
export {
  createHudTypeFace,
  createMonospaceFace,
  layoutText,
  type LayoutFontFace,
  type LayoutTextResult,
} from "./text/layoutText.js";
export {
  detectFallbackCycle,
  layoutWithFallbacks,
  NOTDEF_GLYPH_ID,
  type FallbackLayout,
} from "./text/textFallback.js";
export {
  runTextBackendConformance,
  canonicalGlyphRunFixtures,
  type ConformanceResult,
} from "./text/textBackendConformance.js";
export {
  FontRegistry,
  defaultHudFonts,
  defaultFontLoad,
  type FontHandle,
  type FontHandleState,
  type FontLifecycleEvent,
  type FontLoadFn,
  type FontRegistryOptions,
  type HudTextBackendId,
  type ParsedFontFace,
} from "./text/fontRegistry.js";
export {
  convertPoint,
  COORDINATE_SPACES,
  type ConversionContext,
  type CoordinateSpace,
  type TaggedPoint,
} from "./viewport/coordinateSpaces.js";
export {
  cssRectToDevice,
  drawingBufferMismatchDiagnostic,
  readHostSurface,
  type HostSurfaceState,
} from "./viewport/hostSurface.js";
export {
  cssToLogical,
  logicalToCss,
  resolveIntegerScale,
  resolveViewport,
  snapCssToDevicePixel,
  snapLogicalToDevicePixel,
  type ResolvedViewport,
  type ResolveViewportInput,
} from "./viewport/resolveViewport.js";
export {
  applyLayerViewportToOrthographicCamera,
  deviceToLogical,
  letterboxRects,
  logicalSafeRect,
  logicalToClip,
  logicalToDevice,
  logicalSizeToClip,
  resolveLayerViewport,
  serializeLayerViewport,
  stretchTextDiagnostic,
  viewportToLogical,
  type LayerViewportTransform,
  type OrthographicCameraLike,
} from "./viewport/layerTransform.js";
