---
id: HUD-048
title: "Implement horizontal and vertical Stack layout with spacing and alignment"
epic: E07
milestone: M2
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-046
labels:
  - "area:layout"
  - "epic:E07"
  - "milestone:M2"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-048: Implement horizontal and vertical Stack layout with spacing and alignment

## Outcome

HUD panels can arrange children in a predictable row or column with padding, margin, gap, cross-axis alignment, and fixed/auto/fill child sizes.

## Scope

- Implement row/column direction, gap, container padding, child margin, start/center/end/stretch alignment, and visibility policy.
- Define remaining-space behavior for fill children.
- Keep source order authoritative; no wrapping in v0.1.
- Propagate child layout invalidation efficiently.

## Acceptance criteria

- [x] Hidden/collapsed policy is explicit and tested.
- [x] Gap is applied only between participating children.
- [x] Stretch respects child min/max constraints.
- [x] Multiple fill children divide remaining space through one documented rule.
- [x] Stack layout snapshots are deterministic.

## Verification

- `pnpm run test -- stack-layout`

## Evidence to attach

- Attach row/column matrix screenshots and layout JSON.

## Out of scope

- Flex wrap.
- Order property independent from tree order.
- Complex flex grow/shrink weights.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E07](../../EPICS.md#e07)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
