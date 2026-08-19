---
id: HUD-007
title: "Prove a state-safe Three.js HUD overlay pass on WebGL and WebGPU"
epic: E01
milestone: M0
type: spike
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-006
labels:
  - "area:renderer"
  - "epic:E01"
  - "milestone:M0"
  - "priority:P0"
  - "size:L"
  - "type:spike"
---

# HUD-007: Prove a state-safe Three.js HUD overlay pass on WebGL and WebGPU

## Outcome

A minimal orthographic HUD scene can render after an arbitrary game scene without clearing its color output, corrupting its viewport/scissor/render-target state, or owning the host animation loop.

## Scope

- Render one translucent quad and one textured quad in a separate scene/camera.
- Snapshot and restore the renderer state that the overlay mutates.
- Test color-space and tone-mapping behavior for unlit UI colors.
- Support an explicit `clearDepth` policy and a no-depth overlay mode.
- Keep host-driven `resize`, `update`, and `render` calls.

## Acceptance criteria

- [x] The game scene remains visible beneath the HUD.
- [x] A non-default viewport, scissor, render target, auto-clear configuration, and pixel ratio are restored after the overlay.
- [x] The overlay works in a standard WebGLRenderer and native WebGPURenderer lab.
- [x] No package module calls `setAnimationLoop` or `requestAnimationFrame`.
- [x] Disposal removes all overlay-owned Three.js resources.

## Verification

- `Run the `overlay-state` Playwright scenario in WebGL and WebGPU modes.`
- `Compare renderer-state snapshots before and after HUD render.`

## Evidence to attach

- Before/after screenshots and state diff JSON.

## Risks

- Renderer APIs may not expose enough state uniformly; this can constrain the supported integration contract.

## Out of scope

- Post-processing-composer integration.
- World-space or XR UI.
- Multiple canvases owned by one HUD.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E01](../../EPICS.md#e01)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
