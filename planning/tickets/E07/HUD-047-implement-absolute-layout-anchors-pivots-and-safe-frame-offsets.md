---
id: HUD-047
title: "Implement absolute layout, anchors, pivots, and safe-frame offsets"
epic: E07
milestone: M2
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-021
  - HUD-023
  - HUD-046
labels:
  - "area:layout"
  - "area:viewport"
  - "epic:E07"
  - "milestone:M2"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-047: Implement absolute layout, anchors, pivots, and safe-frame offsets

## Outcome

Screen-corner, edge, center, and custom-anchor placement works against the layer reference/safe frame with explicit pivot and offset semantics.

## Scope

- Define anchor presets and normalized custom anchors.
- Apply node pivot after size resolution.
- Support absolute offsets and optional margins.
- Resolve against reference, visible, or safe frame by explicit target.

## Acceptance criteria

- [ ] All nine common anchor presets match reference fixtures.
- [ ] Changing content size preserves the anchored edge according to pivot.
- [ ] Safe-frame anchoring responds to inset changes.
- [ ] Custom anchors outside 0–1 are either allowed/documented or rejected consistently.

## Verification

- `pnpm run test -- absolute-layout anchors`
- `Run anchor grid visual scenario.`

## Evidence to attach

- Attach anchor reference sheet across aspect ratios.

## Out of scope

- Constraint solving between arbitrary siblings.
- CSS position fixed/sticky semantics.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E07](../../EPICS.md#e07)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
