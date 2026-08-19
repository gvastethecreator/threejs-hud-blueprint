---
id: HUD-046
title: "Implement the two-pass layout box and measurement model"
epic: E07
milestone: M2
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-014
  - HUD-018
  - HUD-035
  - HUD-038
labels:
  - "area:core"
  - "area:layout"
  - "epic:E07"
  - "milestone:M2"
  - "priority:P0"
  - "size:XL"
  - "type:task"
---

# HUD-046: Implement the two-pass layout box and measurement model

## Outcome

Nodes resolve content measurement and final layout through a small deterministic two-pass model that supports fixed, auto, and fill dimensions without recreating browser Flexbox.

## Scope

- Define layout inputs, measured size, resolved box, content box, and overflow flags.
- Separate intrinsic measurement from parent constraint resolution.
- Integrate text and primitive intrinsic sizes.
- Detect cycles/non-convergence and produce typed diagnostics.
- Cache measurement by constraints and dirty state.

## Acceptance criteria

- [x] A content-sized label measures before its parent stack resolves.
- [x] Fixed dimensions do not trigger unnecessary intrinsic measurement.
- [x] Fill is valid only inside a container that defines remaining space.
- [x] Repeated layout without changes performs no recomputation.
- [x] Cycle/non-convergence fixtures fail deterministically.

## Verification

- `pnpm run test -- layout-measure`

## Evidence to attach

- Attach layout phase trace fixtures.

## Out of scope

- CSS min-content/max-content algorithms.
- Percentage chains with indefinite sizes.
- Baseline alignment across rich text.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E07](../../EPICS.md#e07)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
