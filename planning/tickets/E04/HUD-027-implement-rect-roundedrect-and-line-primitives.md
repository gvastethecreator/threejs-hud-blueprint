---
id: HUD-027
title: "Implement Rect, RoundedRect, and Line primitives"
epic: E04
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-014
  - HUD-026
labels:
  - "area:primitives"
  - "area:render"
  - "epic:E04"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-027: Implement Rect, RoundedRect, and Line primitives

## Outcome

The public primitive set can draw filled/stroked rectangles, rounded rectangles, and axis-aligned or arbitrary two-point lines through the shared batch pipeline.

## Scope

- Define public props, bounds, style invalidation, and draw-command encoding.
- Use shader distance fields for radius and border where supported.
- Handle per-corner radius policy or explicitly limit v0.1 to uniform radius.
- Define line alignment and physical-pixel behavior.

## Acceptance criteria

- [x] Zero-size and negative-size inputs have documented behavior.
- [x] Border stays inside, centered, or outside according to one consistent policy.
- [x] Rounded corners remain stable under non-uniform stretch or diagnose unsupported usage.
- [x] One-pixel lines are crisp under pixel snapping.
- [x] Primitives participate in clipping, opacity, z-order, and hit bounds.

## Verification

- `pnpm run test -- rect rounded-rect line`
- `Run primitive visual scenarios.`

## Evidence to attach

- Attach visual matrix across scale and DPR.

## Out of scope

- Arbitrary paths.
- Dashed polylines.
- Boolean shape operations.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E04](../../EPICS.md#e04)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
