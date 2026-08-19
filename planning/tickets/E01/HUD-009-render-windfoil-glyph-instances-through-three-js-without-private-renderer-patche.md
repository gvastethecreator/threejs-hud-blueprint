---
id: HUD-009
title: "Render Windfoil glyph instances through Three.js without private renderer patches"
epic: E01
milestone: M0
type: spike
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-007
  - HUD-008
labels:
  - "area:text"
  - "backend:webgpu"
  - "backend:windfoil"
  - "epic:E01"
  - "milestone:M0"
  - "priority:P0"
  - "risk:high"
  - "size:XL"
  - "type:spike"
---

# HUD-009: Render Windfoil glyph instances through Three.js without private renderer patches

## Outcome

Windfoil coverage renders as a normal Three.js HUD draw using public WebGPU/TSL or supported native-shader extension points, with storage data, instancing, blending, and camera transforms under library ownership.

## Scope

- Map Windfoil curve, row, glyph-instance, and uniform data into supported Three.js buffer/node abstractions.
- Render multiple fonts, sizes, colors, and repeated glyphs in one or bounded draw calls.
- Keep the spike behind an adapter boundary so failure does not contaminate core APIs.
- Record every Three.js API touched and classify it as public, addon, provisional, or private.
- Measure shader compilation, first glyph upload, warm draw, and dynamic update costs.

## Acceptance criteria

- [x] The spike uses no source patch, monkey patch, private symbol, or copied renderer implementation.
- [x] Pan and zoom preserve expected edge quality within the test range.
- [x] Repeated glyphs reuse atlas data rather than duplicating curve storage.
- [x] Premultiplied-alpha composition matches the overlay's blend contract.
- [x] A capability rejection is clean when the active backend is WebGL2.

## Verification

- `Run the `windfoil-three-spike` lab and browser scenario.`
- `Run the spike benchmark report command.`

## Evidence to attach

- Record API inventory, screenshots at the zoom matrix, draw calls, buffer bytes, CPU/GPU timings, and failure modes.

## Risks

- The necessary native WGSL/storage bindings may not be expressible through stable Three.js APIs.

## Out of scope

- Making Windfoil the default backend.
- Supporting WebGL with translated WGSL.
- General vector-path rendering.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E01](../../EPICS.md#e01)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
