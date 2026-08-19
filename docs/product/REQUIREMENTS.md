# Requirements and Traceability

Requirement IDs are durable within v0.1. Ticket references identify the primary implementation/evidence work; they are not permission to duplicate the requirement in ticket prose.

## Functional requirements

| ID       | Requirement                                                                                                                | Primary tickets                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `FR-001` | The host can create a HUD with a supplied supported Three.js renderer.                                                     | HUD-006, HUD-012, HUD-016, HUD-025          |
| `FR-002` | HUD initialization exposes pending, ready, failed, suspended, and disposed lifecycle states.                               | HUD-012, HUD-016                            |
| `FR-003` | The host retains ownership of the animation loop and calls update/render explicitly.                                       | HUD-007, HUD-016                            |
| `FR-004` | Resize accepts logical size, drawing-buffer size, DPR, viewport, and scissor inputs without taking canvas ownership.       | HUD-016, HUD-022                            |
| `FR-005` | Dispose is idempotent and releases every HUD-owned resource exactly once.                                                  | HUD-016, HUD-066                            |
| `FR-006` | Expected capability rejection and runtime failure are distinguishable through typed diagnostics.                           | HUD-006, HUD-012                            |
| `FR-010` | The HUD exposes a retained parent/child node tree with safe reparenting and traversal.                                     | HUD-013                                     |
| `FR-011` | Nodes support 2D translation, scale, rotation, pivot, local bounds, and derived world bounds.                              | HUD-013                                     |
| `FR-012` | Visibility and opacity propagate through ancestors without overwriting authored child values.                              | HUD-013                                     |
| `FR-013` | Traversal, render order, hit order, IDs, and debug snapshots are deterministic.                                            | HUD-017, HUD-024                            |
| `FR-014` | Changes invalidate bounded transform/layout/text/geometry/style/hit/queue/resource stages.                                 | HUD-014                                     |
| `FR-015` | Multiple ordered layers can coexist under one HUD.                                                                         | HUD-015                                     |
| `FR-020` | Each layer owns an independent logical reference resolution and viewport transform.                                        | HUD-018                                     |
| `FR-021` | Continuous scale modes include contain, cover, native, and stretch.                                                        | HUD-019                                     |
| `FR-022` | Pixel-oriented layers support an explicit integer scale and downscale fallback.                                            | HUD-020                                     |
| `FR-023` | DPR-aware snapping maps selected logical coordinates to physical-pixel boundaries.                                         | HUD-020                                     |
| `FR-024` | Layers expose safe, visible, content, letterbox, and crop rectangles.                                                      | HUD-021                                     |
| `FR-025` | HUD zoom is independent from the game camera and renderer DPR.                                                             | HUD-021                                     |
| `FR-026` | Split-screen and supplied viewport/scissor rectangles are supported.                                                       | HUD-022                                     |
| `FR-027` | Screen, viewport, layer, logical, and device coordinate conversions share one authority.                                   | HUD-023                                     |
| `FR-030` | The HUD renders as a Three.js overlay after the host scene.                                                                | HUD-007, HUD-025                            |
| `FR-031` | The overlay restores every host renderer state it mutates.                                                                 | HUD-007, HUD-025                            |
| `FR-032` | Primitives and text emit canonical draw commands into a deterministic batchable queue.                                     | HUD-024                                     |
| `FR-033` | The renderer reuses shared quad geometry, instance buffers, materials, and resource pools.                                 | HUD-026                                     |
| `FR-034` | The package provides Rect, RoundedRect, and Line primitives.                                                               | HUD-027                                     |
| `FR-035` | The package provides Image and NineSlice primitives with explicit texture ownership.                                       | HUD-028                                     |
| `FR-036` | The package provides Arc, Ring, segmented progress, and tick primitives.                                                   | HUD-029                                     |
| `FR-037` | Nested rectangular clipping works across shapes, images, and text.                                                         | HUD-030                                     |
| `FR-038` | Opacity, supported blending, and color-space behavior are explicit and consistent.                                         | HUD-030                                     |
| `FR-040` | Fonts can be supplied by URL, ArrayBuffer, bytes, or validated preprocessed asset.                                         | HUD-032                                     |
| `FR-041` | Font metadata can express pixel-native size, allowed scales, backend preference, provenance, and license.                  | HUD-032                                     |
| `FR-042` | FontRegistry deduplicates concurrent loads and suppresses stale async completion.                                          | HUD-033                                     |
| `FR-043` | Text layout produces backend-neutral immutable or mutation-safe GlyphRun records.                                          | HUD-034                                     |
| `FR-044` | Text styles normalize layout-affecting and paint-only properties into deterministic keys.                                  | HUD-035                                     |
| `FR-045` | The built-in text path supports common LTR mapping, advances, kerning, explicit lines, wrapping, and horizontal alignment. | HUD-036                                     |
| `FR-046` | Fallback chains and missing-glyph diagnostics are explicit and cycle-safe.                                                 | HUD-037                                     |
| `FR-047` | Backends declare availability, renderer support, limits, and rejection reasons.                                            | HUD-034, HUD-038                            |
| `FR-048` | A Windfoil analytic backend is available only at the exposure level approved by the M0 gate.                               | HUD-011, HUD-039, HUD-040, HUD-041          |
| `FR-049` | An isolated SDF backend provides the smooth compatibility baseline.                                                        | HUD-042, HUD-043                            |
| `FR-050` | A bitmap backend supports manifests, runtime rasterization, nearest filtering, and integer-scale policy.                   | HUD-044, HUD-045                            |
| `FR-051` | Smooth and pixel text backends can coexist in independent layers.                                                          | HUD-045, HUD-062                            |
| `FR-055` | Layout uses a deterministic measurement pass and final layout pass.                                                        | HUD-046                                     |
| `FR-056` | Absolute layout supports anchors, pivots, offsets, and safe-frame targets.                                                 | HUD-047                                     |
| `FR-057` | Stack supports row/column direction, gap, padding, margin, and alignment.                                                  | HUD-048                                     |
| `FR-058` | Grid supports fixed rows/columns, cell size, gap, content sizing, and min/max constraints.                                 | HUD-049                                     |
| `FR-059` | Layout boxes feed rendering clips, hit bounds, and debug diagnostics.                                                      | HUD-050                                     |
| `FR-060` | Pointer events from the canvas map through the authoritative viewport/layer transforms.                                    | HUD-051                                     |
| `FR-061` | Hit testing respects layer/order/z-index, bounds, clips, visibility, and pointer policy.                                   | HUD-051, HUD-053                            |
| `FR-062` | Pointer events support capture, target, and bubble phases.                                                                 | HUD-052                                     |
| `FR-063` | Pointer capture and cancellation are deterministic when nodes move or are removed.                                         | HUD-052, HUD-054                            |
| `FR-064` | Pointer policies include auto, none, box-only, and box-none.                                                               | HUD-053                                     |
| `FR-070` | Themes and state styles are serializable plain objects with typed token references.                                        | HUD-055                                     |
| `FR-071` | Panel, Label, and IconLabel are public compositions.                                                                       | HUD-056                                     |
| `FR-072` | LinearBar supports orientation, normalized values, segments, delayed value, and label.                                     | HUD-057                                     |
| `FR-073` | RadialBar and Gauge support sweep, direction, segments/ticks, labels, and needle.                                          | HUD-058                                     |
| `FR-074` | Crosshair supports line/ring/dot composition and host-driven spread/recoil/state.                                          | HUD-059                                     |
| `FR-075` | Slot and InventoryGrid support controlled item data, states, quantity, cooldown, and pointer activation.                   | HUD-060                                     |
| `FR-076` | Hotbar supports controlled active selection, badges, orientation, and stable-key reconciliation.                           | HUD-061                                     |
| `FR-077` | The complete canvas-only showcase uses public package exports.                                                             | HUD-062                                     |
| `FR-080` | Diagnostics expose batches, draw calls, allocations, glyph/atlas state, invalidation, and resource counts.                 | HUD-014, HUD-026, HUD-040, HUD-065, HUD-066 |
| `FR-081` | Debug snapshots and overlays are deterministic, serializable, bounded, and non-interactive.                                | HUD-017, HUD-050, HUD-054                   |

## Non-functional requirements

| ID        | Requirement                                                                                               | Primary tickets                                      |
| --------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `NFR-001` | HUD visuals are rendered inside the Three.js canvas; no DOM element represents a HUD control.             | HUD-062, HUD-069                                     |
| `NFR-002` | React is not a runtime or peer dependency of the v0.1 package.                                            | HUD-001, HUD-067                                     |
| `NFR-003` | The package is strict TypeScript, ESM, and declaration-producing.                                         | HUD-001, HUD-012                                     |
| `NFR-004` | Main-module import performs no browser, GPU, worker, network, or font side effect.                        | HUD-016, HUD-044, HUD-067                            |
| `NFR-005` | Three.js remains a peer dependency and is not bundled.                                                    | HUD-001, HUD-067                                     |
| `NFR-006` | Optional text backends are absent unless their subpath is imported.                                       | HUD-039, HUD-042, HUD-044, HUD-067                   |
| `NFR-007` | Fixed warm scenes perform no package-owned steady-state allocations where promised.                       | HUD-014, HUD-026, HUD-065                            |
| `NFR-008` | Value-only widget updates avoid unrelated layout, geometry, and backend reconstruction.                   | HUD-014, HUD-057, HUD-058, HUD-059, HUD-060, HUD-061 |
| `NFR-009` | Every resource has explicit owned or borrowed semantics and idempotent cleanup.                           | HUD-016, HUD-028, HUD-033, HUD-066                   |
| `NFR-010` | Deterministic fixtures do not depend on random IDs, ambient time, or uncontrolled font/network state.     | HUD-017, HUD-063, HUD-064                            |
| `NFR-011` | Visual claims are protected by renderer/backend-specific deterministic baselines.                         | HUD-031, HUD-045, HUD-050, HUD-064                   |
| `NFR-012` | Compatibility claims are generated from named passing evidence.                                           | HUD-006, HUD-068                                     |
| `NFR-013` | Production code does not patch or import private Three.js renderer internals.                             | HUD-009, HUD-025, HUD-039                            |
| `NFR-014` | No third-party font binary is shipped by default.                                                         | HUD-032, HUD-070                                     |
| `NFR-015` | Diagnostics omit full private text and secrets by default.                                                | HUD-012, HUD-037, HUD-068                            |
| `NFR-016` | Untrusted counts, sizes, buffers, segments, ticks, glyphs, and atlas growth are validated and bounded.    | HUD-008, HUD-026, HUD-029, HUD-040, HUD-044, HUD-065 |
| `NFR-017` | Accessibility limitations are documented; v0.1 does not claim DOM accessibility parity.                   | HUD-069, HUD-071                                     |
| `NFR-018` | Complex shaping and bidi correctness are not claimed without implementation and tests.                    | HUD-036, HUD-037, HUD-043, HUD-068                   |
| `NFR-019` | The packed tarball is tested in an isolated external consumer.                                            | HUD-001, HUD-067, HUD-073                            |
| `NFR-020` | Third-party licenses, provenance, modifications, and notices are auditable.                               | HUD-008, HUD-032, HUD-039, HUD-042, HUD-070, HUD-072 |
| `NFR-021` | The initial Three.js peer range is narrow and evidence-backed.                                            | HUD-068                                              |
| `NFR-022` | Performance budgets use report and verify modes with environment metadata.                                | HUD-031, HUD-041, HUD-065                            |
| `NFR-023` | Public failures use stable codes and safe detail metadata.                                                | HUD-012                                              |
| `NFR-024` | Every backend implements a shared conformance suite and every release-critical path has browser evidence. | HUD-038, HUD-064                                     |
| `NFR-025` | Public examples and documentation compile against generated declarations and packed exports.              | HUD-067, HUD-069, HUD-071, HUD-073                   |

## Scope rule

A ticket may satisfy only part of a requirement. A requirement is release-complete only when its implementation, focused tests, cross-module evidence, documentation, and compatibility declaration all agree.

## Deferred requirements

The following are intentionally unnumbered until promoted into a post-v0.1 product spec:

- complex shaping and full bidirectional text;
- keyboard/gamepad focus and navigation;
- DOM accessibility mirror;
- world-space and XR UI;
- drag-and-drop inventory;
- visual editor and serialization;
- Yoga/Flexbox adapter;
- React integration;
- general vector-path rendering;
- worker/offscreen preprocessing.
