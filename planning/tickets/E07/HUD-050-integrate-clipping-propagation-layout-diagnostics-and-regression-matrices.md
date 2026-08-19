---
id: HUD-050
title: "Integrate clipping propagation, layout diagnostics, and regression matrices"
epic: E07
milestone: M2
type: quality
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-030
  - HUD-046
  - HUD-047
  - HUD-048
  - HUD-049
labels:
  - "area:layout"
  - "area:quality"
  - "epic:E07"
  - "milestone:M2"
  - "priority:P0"
  - "size:L"
  - "type:quality"
---

# HUD-050: Integrate clipping propagation, layout diagnostics, and regression matrices

## Outcome

Resolved layout boxes drive effective clips, hit bounds, and visual diagnostics consistently, and the complete layout matrix is protected by snapshots.

## Scope

- Compute content/padding/clip rectangles after layout.
- Propagate clip intersections into render and input stages.
- Add debug overlays for measured, resolved, content, and clip boxes.
- Create aspect, scale, text-change, visibility, overflow, and nested-layout scenarios.

## Acceptance criteria

- [x] Render clip and hit-test clip agree on visible interactive area.
- [x] Debug overlays do not alter layout or batch ordering.
- [x] Layout errors include a node path and relevant constraints.
- [x] Snapshot updates require explicit approval.
- [x] No scenario depends on DOM layout.

## Verification

- `pnpm run test:layout`
- `pnpm run visual:layout -- --verify`

## Evidence to attach

- Commit layout report HTML and JSON snapshots.

## Out of scope

- Arbitrary mask debugging.
- Browser devtools integration.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E07](../../EPICS.md#e07)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
