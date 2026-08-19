---
id: HUD-024
title: "Define draw commands, render queue ordering, and batch keys"
epic: E04
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-012
  - HUD-017
labels:
  - "area:architecture"
  - "area:render"
  - "epic:E04"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-024: Define draw commands, render queue ordering, and batch keys

## Outcome

All primitives and text backends emit a bounded canonical draw-command stream that can be sorted and batched without widgets knowing Three.js materials or meshes.

## Scope

- Define command kinds for shape instances, images, text drawables, and debug overlays.
- Define layer/order/z-index/sequence sorting and batch-key composition.
- Carry opacity, clip rectangle, texture/font resource handles, blend mode, and diagnostics metadata.
- Use reusable arrays/pools to avoid steady-state allocations.

## Acceptance criteria

- [x] Equal keys preserve deterministic authored order.
- [x] Changing only instance data does not rebuild unrelated batch topology.
- [x] Batch keys do not embed object identity that breaks deterministic snapshots.
- [x] Commands can be serialized into a debug report without GPU resources.

## Verification

- `pnpm run test -- render-queue`

## Evidence to attach

- Attach canonical command-stream snapshots.

## Out of scope

- A general render graph.
- Arbitrary user shaders in v0.1.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E04](../../EPICS.md#e04)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
