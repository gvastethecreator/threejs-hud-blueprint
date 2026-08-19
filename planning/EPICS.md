# Epics

The epics below define the complete v0.1 construction program. Ticket files are the expanded local briefs; GitHub owns live execution state after import.

## E00: Foundation and project governance

Create a small but disciplined library workspace with explicit authorities, boundaries, and issue operations.

- Default milestone: **M0 — Architecture proof**
- Tickets: **5**

- [HUD-001: Bootstrap the lean pnpm workspace and publishable package skeleton](tickets/E00/HUD-001-bootstrap-the-lean-pnpm-workspace-and-publishable-package-skeleton.md) — P0, M, task
- [HUD-002: Establish source-of-truth documents and the agent operating guide](tickets/E00/HUD-002-establish-source-of-truth-documents-and-the-agent-operating-guide.md) — P0, M, docs
- [HUD-003: Define fast, full, and release quality command matrices](tickets/E00/HUD-003-define-fast-full-and-release-quality-command-matrices.md) — P0, M, task
- [HUD-004: Create typed module contracts and an executable boundary checker](tickets/E00/HUD-004-create-typed-module-contracts-and-an-executable-boundary-checker.md) — P0, L, task
- [HUD-005: Prepare GitHub issue forms, labels, Project fields, and mirror protocol](tickets/E00/HUD-005-prepare-github-issue-forms-labels-project-fields-and-mirror-protocol.md) — P1, M, task

## E01: Renderer and Windfoil feasibility

Prove the risky WebGPU/Windfoil integration before freezing the production API.

- Default milestone: **M0 — Architecture proof**
- Tickets: **6**

- [HUD-006: Implement a renderer capability probe and compatibility report](tickets/E01/HUD-006-implement-a-renderer-capability-probe-and-compatibility-report.md) — P0, M, spike
- [HUD-007: Prove a state-safe Three.js HUD overlay pass on WebGL and WebGPU](tickets/E01/HUD-007-prove-a-state-safe-three-js-hud-overlay-pass-on-webgl-and-webgpu.md) — P0, L, spike
- [HUD-008: Port Windfoil font extraction and row-band preprocessing into an isolated TypeScript spike](tickets/E01/HUD-008-port-windfoil-font-extraction-and-row-band-preprocessing-into-an-isolated-typesc.md) — P0, L, spike
- [HUD-009: Render Windfoil glyph instances through Three.js without private renderer patches](tickets/E01/HUD-009-render-windfoil-glyph-instances-through-three-js-without-private-renderer-patche.md) — P0, XL, spike
- [HUD-010: Execute the typography zoom, DPR, clipping, and performance evidence matrix](tickets/E01/HUD-010-execute-the-typography-zoom-dpr-clipping-and-performance-evidence-matrix.md) — P0, L, spike
- [HUD-011: Record the architecture gate verdict for the Windfoil backend](tickets/E01/HUD-011-record-the-architecture-gate-verdict-for-the-windfoil-backend.md) — P0, S, decision

## E02: Retained core and lifecycle

Implement the framework-neutral retained HUD tree, invalidation model, layers, and explicit resource lifecycle.

- Default milestone: **M1 — Core alpha**
- Tickets: **6**

- [HUD-012: Define the public core contracts, diagnostics, and error model](tickets/E02/HUD-012-define-the-public-core-contracts-diagnostics-and-error-model.md) — P0, L, task
- [HUD-013: Implement the retained HudNode tree, local transforms, and world bounds](tickets/E02/HUD-013-implement-the-retained-hudnode-tree-local-transforms-and-world-bounds.md) — P0, L, task
- [HUD-014: Implement dirty flags and bounded invalidation propagation](tickets/E02/HUD-014-implement-dirty-flags-and-bounded-invalidation-propagation.md) — P0, L, task
- [HUD-015: Implement HudLayer and HUD root/controller ownership](tickets/E02/HUD-015-implement-hudlayer-and-hud-rootcontroller-ownership.md) — P0, L, task
- [HUD-016: Implement HUD initialize, update, render, resize, and dispose semantics](tickets/E02/HUD-016-implement-hud-initialize-update-render-resize-and-dispose-semantics.md) — P0, XL, task
- [HUD-017: Guarantee deterministic ordering, stable IDs, and debug metadata](tickets/E02/HUD-017-guarantee-deterministic-ordering-stable-ids-and-debug-metadata.md) — P1, M, task

## E03: Viewport, scaling, and coordinate spaces

Make the HUD predictable across resolutions, DPR values, aspect ratios, zoom levels, and pixel-art layers.

- Default milestone: **M1 — Core alpha**
- Tickets: **6**

- [HUD-018: Implement logical reference resolution and viewport transforms](tickets/E03/HUD-018-implement-logical-reference-resolution-and-viewport-transforms.md) — P0, L, task
- [HUD-019: Implement contain, cover, native, and stretch scale modes](tickets/E03/HUD-019-implement-contain-cover-native-and-stretch-scale-modes.md) — P0, M, task
- [HUD-020: Implement integer scaling and device-pixel snapping](tickets/E03/HUD-020-implement-integer-scaling-and-device-pixel-snapping.md) — P0, L, task
- [HUD-021: Add safe insets, letterbox bounds, and independent HUD zoom](tickets/E03/HUD-021-add-safe-insets-letterbox-bounds-and-independent-hud-zoom.md) — P1, M, task
- [HUD-022: Synchronize CSS size, drawing-buffer size, DPR, and multi-viewport state](tickets/E03/HUD-022-synchronize-css-size-drawing-buffer-size-dpr-and-multi-viewport-state.md) — P0, L, task
- [HUD-023: Provide authoritative screen, viewport, layer, logical, and device coordinate conversions](tickets/E03/HUD-023-provide-authoritative-screen-viewport-layer-logical-and-device-coordinate-conver.md) — P0, M, task

## E04: Render pipeline and primitives

Build a batched Three.js overlay pipeline and the primitive vocabulary required by all widgets.

- Default milestone: **M1 — Core alpha**
- Tickets: **8**

- [HUD-024: Define draw commands, render queue ordering, and batch keys](tickets/E04/HUD-024-define-draw-commands-render-queue-ordering-and-batch-keys.md) — P0, L, task
- [HUD-025: Implement the Three.js overlay adapter with complete state restoration](tickets/E04/HUD-025-implement-the-three-js-overlay-adapter-with-complete-state-restoration.md) — P0, XL, task
- [HUD-026: Implement shared quad geometry, instance buffers, material cache, and resource pools](tickets/E04/HUD-026-implement-shared-quad-geometry-instance-buffers-material-cache-and-resource-pool.md) — P0, L, task
- [HUD-027: Implement Rect, RoundedRect, and Line primitives](tickets/E04/HUD-027-implement-rect-roundedrect-and-line-primitives.md) — P0, L, task
- [HUD-028: Implement Image and NineSlice primitives](tickets/E04/HUD-028-implement-image-and-nineslice-primitives.md) — P1, L, task
- [HUD-029: Implement Arc, Ring, segmented progress, and tick geometry](tickets/E04/HUD-029-implement-arc-ring-segmented-progress-and-tick-geometry.md) — P1, L, task
- [HUD-030: Implement rectangular clip propagation, opacity, blend, and color policy](tickets/E04/HUD-030-implement-rectangular-clip-propagation-opacity-blend-and-color-policy.md) — P0, XL, task
- [HUD-031: Create the primitive regression suite and initial draw-call budgets](tickets/E04/HUD-031-create-the-primitive-regression-suite-and-initial-draw-call-budgets.md) — P0, M, quality

## E05: Text core and font resources

Define canonical font, glyph-run, measurement, fallback, and text lifecycle contracts independent of raster backend.

- Default milestone: **M2 — Typography and layout alpha**
- Tickets: **7**

- [HUD-032: Define FontSource, FontMetadata, pixel policy, and license records](tickets/E05/HUD-032-define-fontsource-fontmetadata-pixel-policy-and-license-records.md) — P0, M, task
- [HUD-033: Implement FontRegistry loading, abort, deduplication, and resource ownership](tickets/E05/HUD-033-implement-fontregistry-loading-abort-deduplication-and-resource-ownership.md) — P0, L, task
- [HUD-034: Define canonical GlyphRun and TextBackend capability contracts](tickets/E05/HUD-034-define-canonical-glyphrun-and-textbackend-capability-contracts.md) — P0, L, task
- [HUD-035: Implement canonical text style, measurement, and cache keys](tickets/E05/HUD-035-implement-canonical-text-style-measurement-and-cache-keys.md) — P0, M, task
- [HUD-036: Implement basic LTR shaping, kerning, multiline layout, wrapping, and alignment](tickets/E05/HUD-036-implement-basic-ltr-shaping-kerning-multiline-layout-wrapping-and-alignment.md) — P0, XL, task
- [HUD-037: Implement fallback fonts, missing-glyph policy, and text diagnostics](tickets/E05/HUD-037-implement-fallback-fonts-missing-glyph-policy-and-text-diagnostics.md) — P1, L, task
- [HUD-038: Create the shared text-backend conformance and dirty-update harness](tickets/E05/HUD-038-create-the-shared-text-backend-conformance-and-dirty-update-harness.md) — P0, L, quality

## E06: Text rendering backends

Ship analytic, SDF, and bitmap text paths behind the same canonical text contract.

- Default milestone: **M2 — Typography and layout alpha**
- Tickets: **7**

- [HUD-039: Implement the Windfoil analytic text adapter behind its approved exposure level](tickets/E06/HUD-039-implement-the-windfoil-analytic-text-adapter-behind-its-approved-exposure-level.md) — P0, XL, task
- [HUD-040: Implement Windfoil glyph atlas growth, reuse, updates, and memory diagnostics](tickets/E06/HUD-040-implement-windfoil-glyph-atlas-growth-reuse-updates-and-memory-diagnostics.md) — P1, XL, task
- [HUD-041: Harden Windfoil failure, device-loss, minification, and performance behavior](tickets/E06/HUD-041-harden-windfoil-failure-device-loss-minification-and-performance-behavior.md) — P0, L, quality
- [HUD-042: Implement an isolated SDF text adapter as the compatibility baseline](tickets/E06/HUD-042-implement-an-isolated-sdf-text-adapter-as-the-compatibility-baseline.md) — P0, XL, task
- [HUD-043: Define SDF atlas lifecycle, capability truth, and fallback policy](tickets/E06/HUD-043-define-sdf-atlas-lifecycle-capability-truth-and-fallback-policy.md) — P1, L, quality
- [HUD-044: Implement bitmap-font manifests, prebuilt atlases, and runtime rasterization](tickets/E06/HUD-044-implement-bitmap-font-manifests-prebuilt-atlases-and-runtime-rasterization.md) — P0, XL, task
- [HUD-045: Enforce bitmap integer scaling, nearest filtering, and mixed-backend parity](tickets/E06/HUD-045-enforce-bitmap-integer-scaling-nearest-filtering-and-mixed-backend-parity.md) — P0, L, quality

## E07: Layout and clipping

Provide a deliberately small two-pass layout engine for absolute, stack, and fixed-grid HUD composition.

- Default milestone: **M2 — Typography and layout alpha**
- Tickets: **5**

- [HUD-046: Implement the two-pass layout box and measurement model](tickets/E07/HUD-046-implement-the-two-pass-layout-box-and-measurement-model.md) — P0, XL, task
- [HUD-047: Implement absolute layout, anchors, pivots, and safe-frame offsets](tickets/E07/HUD-047-implement-absolute-layout-anchors-pivots-and-safe-frame-offsets.md) — P0, L, task
- [HUD-048: Implement horizontal and vertical Stack layout with spacing and alignment](tickets/E07/HUD-048-implement-horizontal-and-vertical-stack-layout-with-spacing-and-alignment.md) — P0, L, task
- [HUD-049: Implement fixed Grid layout, content sizing, and min/max constraints](tickets/E07/HUD-049-implement-fixed-grid-layout-content-sizing-and-minmax-constraints.md) — P1, L, task
- [HUD-050: Integrate clipping propagation, layout diagnostics, and regression matrices](tickets/E07/HUD-050-integrate-clipping-propagation-layout-diagnostics-and-regression-matrices.md) — P0, L, quality

## E08: Pointer input and interaction

Map canvas pointer events into logical HUD space with deterministic hit testing and event propagation.

- Default milestone: **M3 — Interactive widget alpha**
- Tickets: **4**

- [HUD-051: Implement canvas pointer mapping and a deterministic hit-test index](tickets/E08/HUD-051-implement-canvas-pointer-mapping-and-a-deterministic-hit-test-index.md) — P0, XL, task
- [HUD-052: Implement pointer event propagation, hover/press/click, and capture](tickets/E08/HUD-052-implement-pointer-event-propagation-hoverpressclick-and-capture.md) — P0, XL, task
- [HUD-053: Implement pointerEvents policy, disabled/pass-through behavior, and interaction styles](tickets/E08/HUD-053-implement-pointerevents-policy-disabledpass-through-behavior-and-interaction-sty.md) — P1, L, task
- [HUD-054: Create deterministic input tests and interactive debug tooling](tickets/E08/HUD-054-create-deterministic-input-tests-and-interactive-debug-tooling.md) — P0, M, quality

## E09: Themes and game widgets

Deliver the first useful widget set as compositions of public primitives rather than special render paths.

- Default milestone: **M3 — Interactive widget alpha**
- Tickets: **8**

- [HUD-055: Implement serializable themes, token resolution, and state styles](tickets/E09/HUD-055-implement-serializable-themes-token-resolution-and-state-styles.md) — P0, L, task
- [HUD-056: Implement Panel, Label, and IconLabel compositions](tickets/E09/HUD-056-implement-panel-label-and-iconlabel-compositions.md) — P0, L, task
- [HUD-057: Implement LinearBar with segmented, delayed, and labeled variants](tickets/E09/HUD-057-implement-linearbar-with-segmented-delayed-and-labeled-variants.md) — P0, L, task
- [HUD-058: Implement RadialBar and Gauge with ticks, labels, and needle](tickets/E09/HUD-058-implement-radialbar-and-gauge-with-ticks-labels-and-needle.md) — P1, XL, task
- [HUD-059: Implement Crosshair and reticle compositions](tickets/E09/HUD-059-implement-crosshair-and-reticle-compositions.md) — P1, L, task
- [HUD-060: Implement Slot and InventoryGrid](tickets/E09/HUD-060-implement-slot-and-inventorygrid.md) — P0, XL, task
- [HUD-061: Implement Hotbar, selection frame, and quantity/shortcut badges](tickets/E09/HUD-061-implement-hotbar-selection-frame-and-quantityshortcut-badges.md) — P1, L, task
- [HUD-062: Build the complete canvas-only widget showcase and API consistency audit](tickets/E09/HUD-062-build-the-complete-canvas-only-widget-showcase-and-api-consistency-audit.md) — P0, L, quality

## E10: Quality, diagnostics, and performance

Turn correctness, compatibility, memory ownership, package integrity, and frame budgets into executable gates.

- Default milestone: **M4 — v0.1 release candidate**
- Tickets: **6**

- [HUD-063: Create the unit-test harness, deterministic clocks, and mock GPU/text boundaries](tickets/E10/HUD-063-create-the-unit-test-harness-deterministic-clocks-and-mock-gputext-boundaries.md) — P0, L, quality
- [HUD-064: Implement visual regression harness and browser/renderer scenario matrix](tickets/E10/HUD-064-implement-visual-regression-harness-and-browserrenderer-scenario-matrix.md) — P0, XL, quality
- [HUD-065: Implement benchmark runner, statistics, and enforceable performance budgets](tickets/E10/HUD-065-implement-benchmark-runner-statistics-and-enforceable-performance-budgets.md) — P0, XL, quality
- [HUD-066: Verify disposal, context/device loss, cancellation, and memory ownership](tickets/E10/HUD-066-verify-disposal-contextdevice-loss-cancellation-and-memory-ownership.md) — P0, XL, quality
- [HUD-067: Enforce SSR-safe import, tree shaking, bundle budgets, and packed-consumer integrity](tickets/E10/HUD-067-enforce-ssr-safe-import-tree-shaking-bundle-budgets-and-packed-consumer-integrit.md) — P0, L, quality
- [HUD-068: Publish the tested compatibility matrix and release QA report](tickets/E10/HUD-068-publish-the-tested-compatibility-matrix-and-release-qa-report.md) — P0, L, quality

## E11: Documentation and v0.1 release

Make the library installable, understandable, legally clean, and releasable through a repeatable process.

- Default milestone: **M4 — v0.1 release candidate**
- Tickets: **5**

- [HUD-069: Write public API reference and minimal getting-started paths](tickets/E11/HUD-069-write-public-api-reference-and-minimal-getting-started-paths.md) — P0, L, docs
- [HUD-070: Write typography, pixel-art, font-source, and license guides](tickets/E11/HUD-070-write-typography-pixel-art-font-source-and-license-guides.md) — P0, L, docs
- [HUD-071: Write widget recipes and document every playground lab](tickets/E11/HUD-071-write-widget-recipes-and-document-every-playground-lab.md) — P1, L, docs
- [HUD-072: Implement versioning, changelog, release automation, and provenance dry-run](tickets/E11/HUD-072-implement-versioning-changelog-release-automation-and-provenance-dry-run.md) — P0, L, release
- [HUD-073: Close the v0.1 release candidate and publish v0.1.0](tickets/E11/HUD-073-close-the-v0-1-release-candidate-and-publish-v0-1-0.md) — P0, L, release
