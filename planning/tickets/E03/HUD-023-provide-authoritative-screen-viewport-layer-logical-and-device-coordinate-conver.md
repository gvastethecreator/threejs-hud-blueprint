---
id: HUD-023
title: "Provide authoritative screen, viewport, layer, logical, and device coordinate conversions"
epic: E03
milestone: M1
type: task
priority: P0
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-018
  - HUD-020
  - HUD-022
labels:
  - "area:input"
  - "area:math"
  - "area:viewport"
  - "epic:E03"
  - "milestone:M1"
  - "priority:P0"
  - "size:M"
  - "type:task"
---

# HUD-023: Provide authoritative screen, viewport, layer, logical, and device coordinate conversions

## Outcome

Rendering, snapping, clipping, and pointer input use one conversion boundary rather than reimplementing coordinate math in each subsystem.

## Scope

- Define named coordinate-space value types or branded tuples.
- Implement forward/inverse conversions with viewport offsets, scale, zoom, safe frame, and DPR.
- Expose conversion results for debugging.
- Add round-trip and edge-boundary tests.

## Acceptance criteria

- [x] Input and rendering fixtures use the same conversion functions.
- [x] Conversions reject mismatched layer/HUD identities in development mode.
- [x] Device-space output reflects physical pixels, not CSS pixels.
- [x] Round trips remain within documented epsilon except intentional snapping.

## Verification

- `pnpm run test -- coordinate-spaces`

## Evidence to attach

- Commit the coordinate-space contract diagram and fixture table.

## Out of scope

- 3D raycasting.
- World-space projection.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E03](../../EPICS.md#e03)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
