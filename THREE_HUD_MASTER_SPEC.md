# Three HUD — Master Specification and Execution Program

**Generated:** 2026-08-19  
**Status:** product/architecture/ticket blueprint plus non-production package scaffold  
**Runtime claim:** no complete renderer, backend, widget, or v0.1 compatibility claim is made by this document.

## 1. Product definition

Three HUD is a retained-mode, canvas-native UI/HUD library for vanilla Three.js. It targets game and creative-tool interfaces rendered by Three.js rather than HTML/CSS overlays. The host retains authority over renderer, canvas, game state, and frame loop.

### v0.1 product surface

- logical reference coordinates and independent scale layers;
- retained nodes, dirty propagation, layout and clipping;
- batched canvas primitives;
- font registry and canonical glyph runs;
- analytic Windfoil, SDF, and bitmap text adapters behind one contract;
- pointer input, themes, bars, gauges, reticles, inventory and hotbar;
- visual, performance, memory, package, compatibility, legal and release evidence.

### Non-goals

- recreating CSS/Flexbox;
- requiring React;
- owning the host animation loop;
- text editing, IME, complete bidi/complex shaping;
- world-space/XR UI;
- bundled third-party fonts;
- publishing Windfoil as supported without its M0 gate.

## 2. Architecture invariants

1. The semantic HUD tree is not one Three.js `Object3D` per UI element.
2. Viewport/layout/text contracts remain renderer-independent.
3. Text core emits canonical `GlyphRun` records; concrete backends encode them.
4. Pixel fonts use a distinct native-size/integer-scale policy.
5. Widgets compose public primitives and never import a concrete backend.
6. The Three.js overlay adapter restores host state and disposes only owned resources.
7. Main package import performs no browser/GPU/font work.
8. One npm package is published in v0.1; optional implementations are subpath exports.
9. Compatibility and performance are generated claims backed by evidence.
10. No third-party font binary is included without per-file provenance and license approval.

## 3. Package and workspace shape

```text
three-hud/
├─ packages/three-hud/        # one publishable ESM package
├─ apps/playground/           # vanilla consumer and labs
├─ fixtures/external-consumer/# installs the packed tarball
├─ docs/                      # product, architecture, ADR, research, quality, operations
├─ planning/                  # 73 expanded tickets + GitHub import package
├─ scripts/                   # structural gates and release helpers
├─ e2e/                       # browser scenarios
├─ benchmarks/                # provisional budgets/scenarios
└─ evidence/                  # machine-readable claim manifests
```

### Planned public exports

```text
@scope/three-hud
@scope/three-hud/text/windfoil
@scope/three-hud/text/sdf
@scope/three-hud/text/bitmap
@scope/three-hud/testing
```

## 4. Evidence milestones

### M0 — Architecture proof

The workspace exists, project authorities are explicit, and the Windfoil/Three.js feasibility gate has a recorded verdict.
**Tickets:** 11

### M1 — Core alpha

A host can create, resize, update, render, and dispose a HUD containing batched primitives across supported scale modes.
**Tickets:** 20

### M2 — Typography and layout alpha

At least two text backends work through one contract, pixel text is crisp at integer scales, and stack/grid layout is stable.
**Tickets:** 19

### M3 — Interactive widget alpha

Pointer interaction and the initial game-widget set work in the canvas-only showcase without backend-specific widget code.
**Tickets:** 12

### M4 — v0.1 release candidate

Visual, performance, package, compatibility, disposal, documentation, and legal gates pass on a packed external consumer.
**Tickets:** 10

### M5 — v0.1.0

The approved release candidate is published with provenance, changelog, compatibility declaration, and rollback notes.
**Tickets:** 1

## 5. Ticket program

**Total:** 73 tickets. Dependency graph is required to remain acyclic.

| ID                                                                                                                          | Epic | Milestone | Priority | Size | Type     | Blocked by                                                                               | Title                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------- | ---- | --------- | -------- | ---- | -------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [HUD-001](planning/tickets/E00/HUD-001-bootstrap-the-lean-pnpm-workspace-and-publishable-package-skeleton.md)               | E00  | M0        | P0       | M    | task     | —                                                                                        | Bootstrap the lean pnpm workspace and publishable package skeleton                         |
| [HUD-002](planning/tickets/E00/HUD-002-establish-source-of-truth-documents-and-the-agent-operating-guide.md)                | E00  | M0        | P0       | M    | docs     | HUD-001                                                                                  | Establish source-of-truth documents and the agent operating guide                          |
| [HUD-003](planning/tickets/E00/HUD-003-define-fast-full-and-release-quality-command-matrices.md)                            | E00  | M0        | P0       | M    | task     | HUD-001                                                                                  | Define fast, full, and release quality command matrices                                    |
| [HUD-004](planning/tickets/E00/HUD-004-create-typed-module-contracts-and-an-executable-boundary-checker.md)                 | E00  | M0        | P0       | L    | task     | HUD-001                                                                                  | Create typed module contracts and an executable boundary checker                           |
| [HUD-005](planning/tickets/E00/HUD-005-prepare-github-issue-forms-labels-project-fields-and-mirror-protocol.md)             | E00  | M0        | P1       | M    | task     | HUD-002, HUD-003                                                                         | Prepare GitHub issue forms, labels, Project fields, and mirror protocol                    |
| [HUD-006](planning/tickets/E01/HUD-006-implement-a-renderer-capability-probe-and-compatibility-report.md)                   | E01  | M0        | P0       | M    | spike    | HUD-001                                                                                  | Implement a renderer capability probe and compatibility report                             |
| [HUD-007](planning/tickets/E01/HUD-007-prove-a-state-safe-three-js-hud-overlay-pass-on-webgl-and-webgpu.md)                 | E01  | M0        | P0       | L    | spike    | HUD-006                                                                                  | Prove a state-safe Three.js HUD overlay pass on WebGL and WebGPU                           |
| [HUD-008](planning/tickets/E01/HUD-008-port-windfoil-font-extraction-and-row-band-preprocessing-into-an-isolated-typesc.md) | E01  | M0        | P0       | L    | spike    | HUD-001                                                                                  | Port Windfoil font extraction and row-band preprocessing into an isolated TypeScript spike |
| [HUD-009](planning/tickets/E01/HUD-009-render-windfoil-glyph-instances-through-three-js-without-private-renderer-patche.md) | E01  | M0        | P0       | XL   | spike    | HUD-007, HUD-008                                                                         | Render Windfoil glyph instances through Three.js without private renderer patches          |
| [HUD-010](planning/tickets/E01/HUD-010-execute-the-typography-zoom-dpr-clipping-and-performance-evidence-matrix.md)         | E01  | M0        | P0       | L    | spike    | HUD-009                                                                                  | Execute the typography zoom, DPR, clipping, and performance evidence matrix                |
| [HUD-011](planning/tickets/E01/HUD-011-record-the-architecture-gate-verdict-for-the-windfoil-backend.md)                    | E01  | M0        | P0       | S    | decision | HUD-006, HUD-007, HUD-008, HUD-009, HUD-010                                              | Record the architecture gate verdict for the Windfoil backend                              |
| [HUD-012](planning/tickets/E02/HUD-012-define-the-public-core-contracts-diagnostics-and-error-model.md)                     | E02  | M1        | P0       | L    | task     | HUD-004, HUD-011                                                                         | Define the public core contracts, diagnostics, and error model                             |
| [HUD-013](planning/tickets/E02/HUD-013-implement-the-retained-hudnode-tree-local-transforms-and-world-bounds.md)            | E02  | M1        | P0       | L    | task     | HUD-012                                                                                  | Implement the retained HudNode tree, local transforms, and world bounds                    |
| [HUD-014](planning/tickets/E02/HUD-014-implement-dirty-flags-and-bounded-invalidation-propagation.md)                       | E02  | M1        | P0       | L    | task     | HUD-013                                                                                  | Implement dirty flags and bounded invalidation propagation                                 |
| [HUD-015](planning/tickets/E02/HUD-015-implement-hudlayer-and-hud-rootcontroller-ownership.md)                              | E02  | M1        | P0       | L    | task     | HUD-013, HUD-014                                                                         | Implement HudLayer and HUD root/controller ownership                                       |
| [HUD-016](planning/tickets/E02/HUD-016-implement-hud-initialize-update-render-resize-and-dispose-semantics.md)              | E02  | M1        | P0       | XL   | task     | HUD-007, HUD-012, HUD-015                                                                | Implement HUD initialize, update, render, resize, and dispose semantics                    |
| [HUD-017](planning/tickets/E02/HUD-017-guarantee-deterministic-ordering-stable-ids-and-debug-metadata.md)                   | E02  | M1        | P1       | M    | task     | HUD-013, HUD-015, HUD-016                                                                | Guarantee deterministic ordering, stable IDs, and debug metadata                           |
| [HUD-018](planning/tickets/E03/HUD-018-implement-logical-reference-resolution-and-viewport-transforms.md)                   | E03  | M1        | P0       | L    | task     | HUD-012, HUD-015                                                                         | Implement logical reference resolution and viewport transforms                             |
| [HUD-019](planning/tickets/E03/HUD-019-implement-contain-cover-native-and-stretch-scale-modes.md)                           | E03  | M1        | P0       | M    | task     | HUD-018                                                                                  | Implement contain, cover, native, and stretch scale modes                                  |
| [HUD-020](planning/tickets/E03/HUD-020-implement-integer-scaling-and-device-pixel-snapping.md)                              | E03  | M1        | P0       | L    | task     | HUD-018, HUD-019                                                                         | Implement integer scaling and device-pixel snapping                                        |
| [HUD-021](planning/tickets/E03/HUD-021-add-safe-insets-letterbox-bounds-and-independent-hud-zoom.md)                        | E03  | M1        | P1       | M    | task     | HUD-018, HUD-019                                                                         | Add safe insets, letterbox bounds, and independent HUD zoom                                |
| [HUD-022](planning/tickets/E03/HUD-022-synchronize-css-size-drawing-buffer-size-dpr-and-multi-viewport-state.md)            | E03  | M1        | P0       | L    | task     | HUD-006, HUD-018                                                                         | Synchronize CSS size, drawing-buffer size, DPR, and multi-viewport state                   |
| [HUD-023](planning/tickets/E03/HUD-023-provide-authoritative-screen-viewport-layer-logical-and-device-coordinate-conver.md) | E03  | M1        | P0       | M    | task     | HUD-018, HUD-020, HUD-022                                                                | Provide authoritative screen, viewport, layer, logical, and device coordinate conversions  |
| [HUD-024](planning/tickets/E04/HUD-024-define-draw-commands-render-queue-ordering-and-batch-keys.md)                        | E04  | M1        | P0       | L    | task     | HUD-012, HUD-017                                                                         | Define draw commands, render queue ordering, and batch keys                                |
| [HUD-025](planning/tickets/E04/HUD-025-implement-the-three-js-overlay-adapter-with-complete-state-restoration.md)           | E04  | M1        | P0       | XL   | task     | HUD-007, HUD-016, HUD-024                                                                | Implement the Three.js overlay adapter with complete state restoration                     |
| [HUD-026](planning/tickets/E04/HUD-026-implement-shared-quad-geometry-instance-buffers-material-cache-and-resource-pool.md) | E04  | M1        | P0       | L    | task     | HUD-024, HUD-025                                                                         | Implement shared quad geometry, instance buffers, material cache, and resource pools       |
| [HUD-027](planning/tickets/E04/HUD-027-implement-rect-roundedrect-and-line-primitives.md)                                   | E04  | M1        | P0       | L    | task     | HUD-014, HUD-026                                                                         | Implement Rect, RoundedRect, and Line primitives                                           |
| [HUD-028](planning/tickets/E04/HUD-028-implement-image-and-nineslice-primitives.md)                                         | E04  | M1        | P1       | L    | task     | HUD-026, HUD-027                                                                         | Implement Image and NineSlice primitives                                                   |
| [HUD-029](planning/tickets/E04/HUD-029-implement-arc-ring-segmented-progress-and-tick-geometry.md)                          | E04  | M1        | P1       | L    | task     | HUD-026, HUD-027                                                                         | Implement Arc, Ring, segmented progress, and tick geometry                                 |
| [HUD-030](planning/tickets/E04/HUD-030-implement-rectangular-clip-propagation-opacity-blend-and-color-policy.md)            | E04  | M1        | P0       | XL   | task     | HUD-024, HUD-025, HUD-027, HUD-028, HUD-029                                              | Implement rectangular clip propagation, opacity, blend, and color policy                   |
| [HUD-031](planning/tickets/E04/HUD-031-create-the-primitive-regression-suite-and-initial-draw-call-budgets.md)              | E04  | M1        | P0       | M    | quality  | HUD-025, HUD-026, HUD-027, HUD-028, HUD-029, HUD-030                                     | Create the primitive regression suite and initial draw-call budgets                        |
| [HUD-032](planning/tickets/E05/HUD-032-define-fontsource-fontmetadata-pixel-policy-and-license-records.md)                  | E05  | M2        | P0       | M    | task     | HUD-006, HUD-012                                                                         | Define FontSource, FontMetadata, pixel policy, and license records                         |
| [HUD-033](planning/tickets/E05/HUD-033-implement-fontregistry-loading-abort-deduplication-and-resource-ownership.md)        | E05  | M2        | P0       | L    | task     | HUD-016, HUD-032                                                                         | Implement FontRegistry loading, abort, deduplication, and resource ownership               |
| [HUD-034](planning/tickets/E05/HUD-034-define-canonical-glyphrun-and-textbackend-capability-contracts.md)                   | E05  | M2        | P0       | L    | task     | HUD-012, HUD-032                                                                         | Define canonical GlyphRun and TextBackend capability contracts                             |
| [HUD-035](planning/tickets/E05/HUD-035-implement-canonical-text-style-measurement-and-cache-keys.md)                        | E05  | M2        | P0       | M    | task     | HUD-032, HUD-033, HUD-034                                                                | Implement canonical text style, measurement, and cache keys                                |
| [HUD-036](planning/tickets/E05/HUD-036-implement-basic-ltr-shaping-kerning-multiline-layout-wrapping-and-alignment.md)      | E05  | M2        | P0       | XL   | task     | HUD-033, HUD-034, HUD-035                                                                | Implement basic LTR shaping, kerning, multiline layout, wrapping, and alignment            |
| [HUD-037](planning/tickets/E05/HUD-037-implement-fallback-fonts-missing-glyph-policy-and-text-diagnostics.md)               | E05  | M2        | P1       | L    | task     | HUD-033, HUD-036                                                                         | Implement fallback fonts, missing-glyph policy, and text diagnostics                       |
| [HUD-038](planning/tickets/E05/HUD-038-create-the-shared-text-backend-conformance-and-dirty-update-harness.md)              | E05  | M2        | P0       | L    | quality  | HUD-014, HUD-034, HUD-035, HUD-036, HUD-037                                              | Create the shared text-backend conformance and dirty-update harness                        |
| [HUD-039](planning/tickets/E06/HUD-039-implement-the-windfoil-analytic-text-adapter-behind-its-approved-exposure-level.md)  | E06  | M2        | P0       | XL   | task     | HUD-011, HUD-034, HUD-038                                                                | Implement the Windfoil analytic text adapter behind its approved exposure level            |
| [HUD-040](planning/tickets/E06/HUD-040-implement-windfoil-glyph-atlas-growth-reuse-updates-and-memory-diagnostics.md)       | E06  | M2        | P1       | XL   | task     | HUD-033, HUD-039                                                                         | Implement Windfoil glyph atlas growth, reuse, updates, and memory diagnostics              |
| [HUD-041](planning/tickets/E06/HUD-041-harden-windfoil-failure-device-loss-minification-and-performance-behavior.md)        | E06  | M2        | P0       | L    | quality  | HUD-039, HUD-040                                                                         | Harden Windfoil failure, device-loss, minification, and performance behavior               |
| [HUD-042](planning/tickets/E06/HUD-042-implement-an-isolated-sdf-text-adapter-as-the-compatibility-baseline.md)             | E06  | M2        | P0       | XL   | task     | HUD-034, HUD-038                                                                         | Implement an isolated SDF text adapter as the compatibility baseline                       |
| [HUD-043](planning/tickets/E06/HUD-043-define-sdf-atlas-lifecycle-capability-truth-and-fallback-policy.md)                  | E06  | M2        | P1       | L    | quality  | HUD-042                                                                                  | Define SDF atlas lifecycle, capability truth, and fallback policy                          |
| [HUD-044](planning/tickets/E06/HUD-044-implement-bitmap-font-manifests-prebuilt-atlases-and-runtime-rasterization.md)       | E06  | M2        | P0       | XL   | task     | HUD-032, HUD-033, HUD-034, HUD-038                                                       | Implement bitmap-font manifests, prebuilt atlases, and runtime rasterization               |
| [HUD-045](planning/tickets/E06/HUD-045-enforce-bitmap-integer-scaling-nearest-filtering-and-mixed-backend-parity.md)        | E06  | M2        | P0       | L    | quality  | HUD-020, HUD-030, HUD-044                                                                | Enforce bitmap integer scaling, nearest filtering, and mixed-backend parity                |
| [HUD-046](planning/tickets/E07/HUD-046-implement-the-two-pass-layout-box-and-measurement-model.md)                          | E07  | M2        | P0       | XL   | task     | HUD-014, HUD-018, HUD-035, HUD-038                                                       | Implement the two-pass layout box and measurement model                                    |
| [HUD-047](planning/tickets/E07/HUD-047-implement-absolute-layout-anchors-pivots-and-safe-frame-offsets.md)                  | E07  | M2        | P0       | L    | task     | HUD-021, HUD-023, HUD-046                                                                | Implement absolute layout, anchors, pivots, and safe-frame offsets                         |
| [HUD-048](planning/tickets/E07/HUD-048-implement-horizontal-and-vertical-stack-layout-with-spacing-and-alignment.md)        | E07  | M2        | P0       | L    | task     | HUD-046                                                                                  | Implement horizontal and vertical Stack layout with spacing and alignment                  |
| [HUD-049](planning/tickets/E07/HUD-049-implement-fixed-grid-layout-content-sizing-and-minmax-constraints.md)                | E07  | M2        | P1       | L    | task     | HUD-046, HUD-048                                                                         | Implement fixed Grid layout, content sizing, and min/max constraints                       |
| [HUD-050](planning/tickets/E07/HUD-050-integrate-clipping-propagation-layout-diagnostics-and-regression-matrices.md)        | E07  | M2        | P0       | L    | quality  | HUD-030, HUD-046, HUD-047, HUD-048, HUD-049                                              | Integrate clipping propagation, layout diagnostics, and regression matrices                |
| [HUD-051](planning/tickets/E08/HUD-051-implement-canvas-pointer-mapping-and-a-deterministic-hit-test-index.md)              | E08  | M3        | P0       | XL   | task     | HUD-017, HUD-023, HUD-050                                                                | Implement canvas pointer mapping and a deterministic hit-test index                        |
| [HUD-052](planning/tickets/E08/HUD-052-implement-pointer-event-propagation-hoverpressclick-and-capture.md)                  | E08  | M3        | P0       | XL   | task     | HUD-051                                                                                  | Implement pointer event propagation, hover/press/click, and capture                        |
| [HUD-053](planning/tickets/E08/HUD-053-implement-pointerevents-policy-disabledpass-through-behavior-and-interaction-sty.md) | E08  | M3        | P1       | L    | task     | HUD-052, HUD-055                                                                         | Implement pointerEvents policy, disabled/pass-through behavior, and interaction styles     |
| [HUD-054](planning/tickets/E08/HUD-054-create-deterministic-input-tests-and-interactive-debug-tooling.md)                   | E08  | M3        | P0       | M    | quality  | HUD-051, HUD-052, HUD-053                                                                | Create deterministic input tests and interactive debug tooling                             |
| [HUD-055](planning/tickets/E09/HUD-055-implement-serializable-themes-token-resolution-and-state-styles.md)                  | E09  | M3        | P0       | L    | task     | HUD-012, HUD-014, HUD-052                                                                | Implement serializable themes, token resolution, and state styles                          |
| [HUD-056](planning/tickets/E09/HUD-056-implement-panel-label-and-iconlabel-compositions.md)                                 | E09  | M3        | P0       | L    | task     | HUD-027, HUD-028, HUD-036, HUD-048, HUD-055                                              | Implement Panel, Label, and IconLabel compositions                                         |
| [HUD-057](planning/tickets/E09/HUD-057-implement-linearbar-with-segmented-delayed-and-labeled-variants.md)                  | E09  | M3        | P0       | L    | task     | HUD-027, HUD-030, HUD-055, HUD-056                                                       | Implement LinearBar with segmented, delayed, and labeled variants                          |
| [HUD-058](planning/tickets/E09/HUD-058-implement-radialbar-and-gauge-with-ticks-labels-and-needle.md)                       | E09  | M3        | P1       | XL   | task     | HUD-029, HUD-036, HUD-055, HUD-056                                                       | Implement RadialBar and Gauge with ticks, labels, and needle                               |
| [HUD-059](planning/tickets/E09/HUD-059-implement-crosshair-and-reticle-compositions.md)                                     | E09  | M3        | P1       | L    | task     | HUD-027, HUD-029, HUD-055                                                                | Implement Crosshair and reticle compositions                                               |
| [HUD-060](planning/tickets/E09/HUD-060-implement-slot-and-inventorygrid.md)                                                 | E09  | M3        | P0       | XL   | task     | HUD-049, HUD-052, HUD-053, HUD-055, HUD-056                                              | Implement Slot and InventoryGrid                                                           |
| [HUD-061](planning/tickets/E09/HUD-061-implement-hotbar-selection-frame-and-quantityshortcut-badges.md)                     | E09  | M3        | P1       | L    | task     | HUD-048, HUD-052, HUD-053, HUD-055, HUD-060                                              | Implement Hotbar, selection frame, and quantity/shortcut badges                            |
| [HUD-062](planning/tickets/E09/HUD-062-build-the-complete-canvas-only-widget-showcase-and-api-consistency-audit.md)         | E09  | M3        | P0       | L    | quality  | HUD-056, HUD-057, HUD-058, HUD-059, HUD-060, HUD-061                                     | Build the complete canvas-only widget showcase and API consistency audit                   |
| [HUD-063](planning/tickets/E10/HUD-063-create-the-unit-test-harness-deterministic-clocks-and-mock-gputext-boundaries.md)    | E10  | M4        | P0       | L    | quality  | HUD-003, HUD-012, HUD-024, HUD-034                                                       | Create the unit-test harness, deterministic clocks, and mock GPU/text boundaries           |
| [HUD-064](planning/tickets/E10/HUD-064-implement-visual-regression-harness-and-browserrenderer-scenario-matrix.md)          | E10  | M4        | P0       | XL   | quality  | HUD-031, HUD-038, HUD-045, HUD-050, HUD-054, HUD-062                                     | Implement visual regression harness and browser/renderer scenario matrix                   |
| [HUD-065](planning/tickets/E10/HUD-065-implement-benchmark-runner-statistics-and-enforceable-performance-budgets.md)        | E10  | M4        | P0       | XL   | quality  | HUD-014, HUD-026, HUD-031, HUD-038, HUD-041, HUD-062                                     | Implement benchmark runner, statistics, and enforceable performance budgets                |
| [HUD-066](planning/tickets/E10/HUD-066-verify-disposal-contextdevice-loss-cancellation-and-memory-ownership.md)             | E10  | M4        | P0       | XL   | quality  | HUD-016, HUD-025, HUD-026, HUD-033, HUD-039, HUD-042, HUD-044                            | Verify disposal, context/device loss, cancellation, and memory ownership                   |
| [HUD-067](planning/tickets/E10/HUD-067-enforce-ssr-safe-import-tree-shaking-bundle-budgets-and-packed-consumer-integrit.md) | E10  | M4        | P0       | L    | quality  | HUD-001, HUD-003, HUD-039, HUD-042, HUD-044                                              | Enforce SSR-safe import, tree shaking, bundle budgets, and packed-consumer integrity       |
| [HUD-068](planning/tickets/E10/HUD-068-publish-the-tested-compatibility-matrix-and-release-qa-report.md)                    | E10  | M4        | P0       | L    | quality  | HUD-006, HUD-041, HUD-043, HUD-045, HUD-064, HUD-065, HUD-066, HUD-067                   | Publish the tested compatibility matrix and release QA report                              |
| [HUD-069](planning/tickets/E11/HUD-069-write-public-api-reference-and-minimal-getting-started-paths.md)                     | E11  | M4        | P0       | L    | docs     | HUD-012, HUD-016, HUD-023, HUD-025, HUD-034, HUD-055                                     | Write public API reference and minimal getting-started paths                               |
| [HUD-070](planning/tickets/E11/HUD-070-write-typography-pixel-art-font-source-and-license-guides.md)                        | E11  | M4        | P0       | L    | docs     | HUD-032, HUD-037, HUD-039, HUD-042, HUD-044, HUD-045, HUD-068                            | Write typography, pixel-art, font-source, and license guides                               |
| [HUD-071](planning/tickets/E11/HUD-071-write-widget-recipes-and-document-every-playground-lab.md)                           | E11  | M4        | P1       | L    | docs     | HUD-062, HUD-064, HUD-065                                                                | Write widget recipes and document every playground lab                                     |
| [HUD-072](planning/tickets/E11/HUD-072-implement-versioning-changelog-release-automation-and-provenance-dry-run.md)         | E11  | M4        | P0       | L    | release  | HUD-005, HUD-067, HUD-068, HUD-069, HUD-070, HUD-071                                     | Implement versioning, changelog, release automation, and provenance dry-run                |
| [HUD-073](planning/tickets/E11/HUD-073-close-the-v0-1-release-candidate-and-publish-v0-1-0.md)                              | E11  | M5        | P0       | L    | release  | HUD-063, HUD-064, HUD-065, HUD-066, HUD-067, HUD-068, HUD-069, HUD-070, HUD-071, HUD-072 | Close the v0.1 release candidate and publish v0.1.0                                        |

## 6. Verification model

```bash
pnpm run validate:structure
pnpm run validate:fast
pnpm run validate:full
pnpm run validate:release
```

`validate:release` is intentionally blocked until visual, performance, memory, legal, package and runtime tickets implement their evidence gates and `release-status.json` authorizes publication.

## 7. Navigation

- [Product specification](docs/product/PRODUCT_SPEC.md)
- [Requirements traceability](docs/product/REQUIREMENTS.md)
- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Public API proposal](docs/architecture/PUBLIC_API.md)
- [Module contracts](docs/architecture/MODULE_CONTRACTS.md)
- [Windfoil research](docs/research/WINDFOIL_RESEARCH.md)
- [Quality gates](docs/quality/QUALITY_GATES.md)
- [GitHub operating model](docs/operations/GITHUB_PROJECT.md)
- [Interactive explorer](architecture-explorer.html)
- [Expanded ticket directory](planning/tickets/)
