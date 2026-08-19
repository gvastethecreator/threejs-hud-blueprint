# Build Backlog

This index intentionally stays small. Expanded scope lives in individual ticket files; `ticket-index.json` is the generated machine-readable index. Do not append implementation diaries here.

## Program summary

- Total tickets: **73**
- Epics: **12**
- Milestones: **6**
- P0 tickets: **59**
- High-risk spikes/decisions: **5**

## Critical path

1. [HUD-001: Bootstrap the lean pnpm workspace and publishable package skeleton](tickets/E00/HUD-001-bootstrap-the-lean-pnpm-workspace-and-publishable-package-skeleton.md)
1. [HUD-006: Implement a renderer capability probe and compatibility report](tickets/E01/HUD-006-implement-a-renderer-capability-probe-and-compatibility-report.md)
1. [HUD-007: Prove a state-safe Three.js HUD overlay pass on WebGL and WebGPU](tickets/E01/HUD-007-prove-a-state-safe-three-js-hud-overlay-pass-on-webgl-and-webgpu.md)
1. [HUD-008: Port Windfoil font extraction and row-band preprocessing into an isolated TypeScript spike](tickets/E01/HUD-008-port-windfoil-font-extraction-and-row-band-preprocessing-into-an-isolated-typesc.md)
1. [HUD-009: Render Windfoil glyph instances through Three.js without private renderer patches](tickets/E01/HUD-009-render-windfoil-glyph-instances-through-three-js-without-private-renderer-patche.md)
1. [HUD-010: Execute the typography zoom, DPR, clipping, and performance evidence matrix](tickets/E01/HUD-010-execute-the-typography-zoom-dpr-clipping-and-performance-evidence-matrix.md)
1. [HUD-011: Record the architecture gate verdict for the Windfoil backend](tickets/E01/HUD-011-record-the-architecture-gate-verdict-for-the-windfoil-backend.md)
1. [HUD-012: Define the public core contracts, diagnostics, and error model](tickets/E02/HUD-012-define-the-public-core-contracts-diagnostics-and-error-model.md)
1. [HUD-013: Implement the retained HudNode tree, local transforms, and world bounds](tickets/E02/HUD-013-implement-the-retained-hudnode-tree-local-transforms-and-world-bounds.md)
1. [HUD-014: Implement dirty flags and bounded invalidation propagation](tickets/E02/HUD-014-implement-dirty-flags-and-bounded-invalidation-propagation.md)
1. [HUD-015: Implement HudLayer and HUD root/controller ownership](tickets/E02/HUD-015-implement-hudlayer-and-hud-rootcontroller-ownership.md)
1. [HUD-016: Implement HUD initialize, update, render, resize, and dispose semantics](tickets/E02/HUD-016-implement-hud-initialize-update-render-resize-and-dispose-semantics.md)
1. [HUD-018: Implement logical reference resolution and viewport transforms](tickets/E03/HUD-018-implement-logical-reference-resolution-and-viewport-transforms.md)
1. [HUD-019: Implement contain, cover, native, and stretch scale modes](tickets/E03/HUD-019-implement-contain-cover-native-and-stretch-scale-modes.md)
1. [HUD-020: Implement integer scaling and device-pixel snapping](tickets/E03/HUD-020-implement-integer-scaling-and-device-pixel-snapping.md)
1. [HUD-024: Define draw commands, render queue ordering, and batch keys](tickets/E04/HUD-024-define-draw-commands-render-queue-ordering-and-batch-keys.md)
1. [HUD-025: Implement the Three.js overlay adapter with complete state restoration](tickets/E04/HUD-025-implement-the-three-js-overlay-adapter-with-complete-state-restoration.md)
1. [HUD-026: Implement shared quad geometry, instance buffers, material cache, and resource pools](tickets/E04/HUD-026-implement-shared-quad-geometry-instance-buffers-material-cache-and-resource-pool.md)
1. [HUD-027: Implement Rect, RoundedRect, and Line primitives](tickets/E04/HUD-027-implement-rect-roundedrect-and-line-primitives.md)
1. [HUD-030: Implement rectangular clip propagation, opacity, blend, and color policy](tickets/E04/HUD-030-implement-rectangular-clip-propagation-opacity-blend-and-color-policy.md)
1. [HUD-031: Create the primitive regression suite and initial draw-call budgets](tickets/E04/HUD-031-create-the-primitive-regression-suite-and-initial-draw-call-budgets.md)
1. [HUD-032: Define FontSource, FontMetadata, pixel policy, and license records](tickets/E05/HUD-032-define-fontsource-fontmetadata-pixel-policy-and-license-records.md)
1. [HUD-033: Implement FontRegistry loading, abort, deduplication, and resource ownership](tickets/E05/HUD-033-implement-fontregistry-loading-abort-deduplication-and-resource-ownership.md)
1. [HUD-034: Define canonical GlyphRun and TextBackend capability contracts](tickets/E05/HUD-034-define-canonical-glyphrun-and-textbackend-capability-contracts.md)
1. [HUD-035: Implement canonical text style, measurement, and cache keys](tickets/E05/HUD-035-implement-canonical-text-style-measurement-and-cache-keys.md)
1. [HUD-036: Implement basic LTR shaping, kerning, multiline layout, wrapping, and alignment](tickets/E05/HUD-036-implement-basic-ltr-shaping-kerning-multiline-layout-wrapping-and-alignment.md)
1. [HUD-038: Create the shared text-backend conformance and dirty-update harness](tickets/E05/HUD-038-create-the-shared-text-backend-conformance-and-dirty-update-harness.md)
1. [HUD-042: Implement an isolated SDF text adapter as the compatibility baseline](tickets/E06/HUD-042-implement-an-isolated-sdf-text-adapter-as-the-compatibility-baseline.md)
1. [HUD-044: Implement bitmap-font manifests, prebuilt atlases, and runtime rasterization](tickets/E06/HUD-044-implement-bitmap-font-manifests-prebuilt-atlases-and-runtime-rasterization.md)
1. [HUD-045: Enforce bitmap integer scaling, nearest filtering, and mixed-backend parity](tickets/E06/HUD-045-enforce-bitmap-integer-scaling-nearest-filtering-and-mixed-backend-parity.md)
1. [HUD-046: Implement the two-pass layout box and measurement model](tickets/E07/HUD-046-implement-the-two-pass-layout-box-and-measurement-model.md)
1. [HUD-047: Implement absolute layout, anchors, pivots, and safe-frame offsets](tickets/E07/HUD-047-implement-absolute-layout-anchors-pivots-and-safe-frame-offsets.md)
1. [HUD-048: Implement horizontal and vertical Stack layout with spacing and alignment](tickets/E07/HUD-048-implement-horizontal-and-vertical-stack-layout-with-spacing-and-alignment.md)
1. [HUD-050: Integrate clipping propagation, layout diagnostics, and regression matrices](tickets/E07/HUD-050-integrate-clipping-propagation-layout-diagnostics-and-regression-matrices.md)
1. [HUD-051: Implement canvas pointer mapping and a deterministic hit-test index](tickets/E08/HUD-051-implement-canvas-pointer-mapping-and-a-deterministic-hit-test-index.md)
1. [HUD-052: Implement pointer event propagation, hover/press/click, and capture](tickets/E08/HUD-052-implement-pointer-event-propagation-hoverpressclick-and-capture.md)
1. [HUD-055: Implement serializable themes, token resolution, and state styles](tickets/E09/HUD-055-implement-serializable-themes-token-resolution-and-state-styles.md)
1. [HUD-056: Implement Panel, Label, and IconLabel compositions](tickets/E09/HUD-056-implement-panel-label-and-iconlabel-compositions.md)
1. [HUD-057: Implement LinearBar with segmented, delayed, and labeled variants](tickets/E09/HUD-057-implement-linearbar-with-segmented-delayed-and-labeled-variants.md)
1. [HUD-058: Implement RadialBar and Gauge with ticks, labels, and needle](tickets/E09/HUD-058-implement-radialbar-and-gauge-with-ticks-labels-and-needle.md)
1. [HUD-059: Implement Crosshair and reticle compositions](tickets/E09/HUD-059-implement-crosshair-and-reticle-compositions.md)
1. [HUD-060: Implement Slot and InventoryGrid](tickets/E09/HUD-060-implement-slot-and-inventorygrid.md)
1. [HUD-061: Implement Hotbar, selection frame, and quantity/shortcut badges](tickets/E09/HUD-061-implement-hotbar-selection-frame-and-quantityshortcut-badges.md)
1. [HUD-062: Build the complete canvas-only widget showcase and API consistency audit](tickets/E09/HUD-062-build-the-complete-canvas-only-widget-showcase-and-api-consistency-audit.md)
1. [HUD-063: Create the unit-test harness, deterministic clocks, and mock GPU/text boundaries](tickets/E10/HUD-063-create-the-unit-test-harness-deterministic-clocks-and-mock-gputext-boundaries.md)
1. [HUD-064: Implement visual regression harness and browser/renderer scenario matrix](tickets/E10/HUD-064-implement-visual-regression-harness-and-browserrenderer-scenario-matrix.md)
1. [HUD-065: Implement benchmark runner, statistics, and enforceable performance budgets](tickets/E10/HUD-065-implement-benchmark-runner-statistics-and-enforceable-performance-budgets.md)
1. [HUD-066: Verify disposal, context/device loss, cancellation, and memory ownership](tickets/E10/HUD-066-verify-disposal-contextdevice-loss-cancellation-and-memory-ownership.md)
1. [HUD-067: Enforce SSR-safe import, tree shaking, bundle budgets, and packed-consumer integrity](tickets/E10/HUD-067-enforce-ssr-safe-import-tree-shaking-bundle-budgets-and-packed-consumer-integrit.md)
1. [HUD-068: Publish the tested compatibility matrix and release QA report](tickets/E10/HUD-068-publish-the-tested-compatibility-matrix-and-release-qa-report.md)
1. [HUD-069: Write public API reference and minimal getting-started paths](tickets/E11/HUD-069-write-public-api-reference-and-minimal-getting-started-paths.md)
1. [HUD-070: Write typography, pixel-art, font-source, and license guides](tickets/E11/HUD-070-write-typography-pixel-art-font-source-and-license-guides.md)
1. [HUD-071: Write widget recipes and document every playground lab](tickets/E11/HUD-071-write-widget-recipes-and-document-every-playground-lab.md)
1. [HUD-072: Implement versioning, changelog, release automation, and provenance dry-run](tickets/E11/HUD-072-implement-versioning-changelog-release-automation-and-provenance-dry-run.md)
1. [HUD-073: Close the v0.1 release candidate and publish v0.1.0](tickets/E11/HUD-073-close-the-v0-1-release-candidate-and-publish-v0-1-0.md)

## Parallel tracks after the M0 gate

- **Core/viewport/render:** E02 → E03 → E04.
- **Text:** E05 → E06, with SDF and bitmap able to proceed if Windfoil remains experimental.
- **Layout/input/widgets:** E07 → E08/E09 once primitive and text contracts stabilize.
- **Quality/docs/release:** E10/E11 begin early but become blocking at M4.

## Dependency rules

- A blocked ticket may refine notes and fixtures but must not merge production claims that depend on the blocker.
- Spikes close with evidence and a bounded decision, not with production code hidden behind a demo route.
- Widgets never bypass public primitives or import a concrete text backend.
- Release tickets cannot waive a failed compatibility, legal, package, disposal, visual, or performance gate without a recorded ADR.

## Generated views

- `ticket-index.json` — complete machine-readable records.
- `github/issues.ndjson` — dry-run issue import manifest.
- `../architecture-explorer.html` — filterable local dashboard.
