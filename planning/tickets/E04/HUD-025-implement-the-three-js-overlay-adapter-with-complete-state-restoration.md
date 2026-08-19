---
id: HUD-025
title: "Implement the Three.js overlay adapter with complete state restoration"
epic: E04
milestone: M1
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-007
  - HUD-016
  - HUD-024
labels:
  - "area:render"
  - "area:three"
  - "epic:E04"
  - "milestone:M1"
  - "priority:P0"
  - "size:XL"
  - "type:task"
---

# HUD-025: Implement the Three.js overlay adapter with complete state restoration

## Outcome

The production render adapter turns canonical draw batches into a Three.js overlay pass on the supported renderer matrix while preserving host state and reporting capability failure.

## Scope

- Promote only public APIs proven by the overlay spike.
- Own orthographic scene/camera, render objects, materials, and shared geometry.
- Snapshot/restore render target, viewport, scissor, scissor test, auto-clear flags, and other proven mutable state.
- Define color-space, tone-mapping, depth, and premultiplied-alpha policy.
- Expose an integration hook for custom host sequencing without owning the loop.

## Acceptance criteria

- [x] WebGL and approved WebGPU modes pass state-diff tests.
- [x] Unsupported renderer/backend combinations fail before allocating partial resources.
- [x] The adapter performs no full-canvas clear unless explicitly configured.
- [x] Renderer state is restored even when a batch throws.
- [x] Dispose releases all adapter-owned Three.js resources.

## Verification

- `pnpm run test -- three-overlay-adapter`
- `pnpm run visual:overlay`

## Evidence to attach

- Attach state-diff evidence for each supported renderer mode.

## Out of scope

- EffectComposer integration.
- Private renderer hooks.
- Replacing the host renderer.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E04](../../EPICS.md#e04)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
