---
id: HUD-013
title: "Implement the retained HudNode tree, local transforms, and world bounds"
epic: E02
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-012
labels:
  - "area:core"
  - "area:tree"
  - "epic:E02"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-013: Implement the retained HudNode tree, local transforms, and world bounds

## Outcome

A deterministic retained tree supports parent/child ownership, visibility, opacity, 2D transform composition, local bounds, world bounds, and safe reparenting without renderer knowledge.

## Scope

- Implement add, insert, remove, clear, parent lookup, traversal, and ancestry guards.
- Use explicit 2D translation, scale, rotation, pivot, and local bounds.
- Propagate visibility and opacity without mutating child-authored values.
- Reject cycles and cross-HUD ownership mistakes with typed errors.
- Keep traversal allocation-free in steady state.

## Acceptance criteria

- [x] Reparenting updates both old and new parents exactly once.
- [x] World transforms and axis-aligned bounds match reference fixtures.
- [x] Invisible ancestors suppress descendants without destroying them.
- [x] A node cannot be added to itself or its descendant.
- [x] Tree mutation during traversal follows a documented rule and has tests.

## Verification

- `pnpm run test -- hud-node`

## Evidence to attach

- Store transform/bounds fixture snapshots.

## Out of scope

- 3D transforms.
- Physics or animation ownership.
- Layout calculation.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E02](../../EPICS.md#e02)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
