---
id: HUD-026
title: "Implement shared quad geometry, instance buffers, material cache, and resource pools"
epic: E04
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-024
  - HUD-025
labels:
  - "area:performance"
  - "area:render"
  - "epic:E04"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-026: Implement shared quad geometry, instance buffers, material cache, and resource pools

## Outcome

Rectangular and shader-defined primitives reuse bounded GPU resources and update instance data without allocating one Three.js mesh/material per HUD element.

## Scope

- Create shared unit-quad geometry and instance-buffer layouts.
- Implement growth policy, high-water diagnostics, reuse, and explicit pool disposal.
- Cache materials/pipelines by stable feature key.
- Separate static topology changes from per-frame instance updates.

## Acceptance criteria

- [x] A 100-primitive fixture does not create 100 materials or geometries.
- [x] Pool growth is bounded and reported.
- [x] Removing nodes returns slots for reuse without exposing stale data.
- [x] Material cache entries are reference-counted or disposed at HUD teardown.
- [x] No steady-state allocation occurs in a fixed scene after warm-up.

## Verification

- `pnpm run test -- render-pools`
- `pnpm run benchmark:allocations`

## Evidence to attach

- Attach resource counts before warm-up, after warm-up, and after dispose.

## Out of scope

- General mesh pooling for the game scene.
- Unbounded automatic shrinking every frame.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E04](../../EPICS.md#e04)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
