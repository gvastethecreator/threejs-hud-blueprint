---
id: HUD-049
title: "Implement fixed Grid layout, content sizing, and min/max constraints"
epic: E07
milestone: M2
type: task
priority: P1
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-046
  - HUD-048
labels:
  - "area:layout"
  - "area:widgets"
  - "epic:E07"
  - "milestone:M2"
  - "priority:P1"
  - "size:L"
  - "type:task"
---

# HUD-049: Implement fixed Grid layout, content sizing, and min/max constraints

## Outcome

Inventory and hotbar layouts can use a fixed row/column grid with cell size, gap, padding, span policy, and bounded content sizing.

## Scope

- Implement explicit rows/columns, fixed or auto-derived cell size, gaps, and traversal order.
- Support min/max width/height across layout nodes.
- Define overflow behavior when children exceed cells.
- Decide whether spans are included or deferred; do not leave ambiguous partial support.

## Acceptance criteria

- [x] A grid produces stable cell rectangles across resize and integer scale.
- [x] Content size derives from rows, columns, cells, gaps, and padding.
- [x] Overflow/extra children follow the documented policy.
- [x] Min/max constraints clamp before final pivot/anchor placement.
- [x] Inventory-sized fixture has no cumulative pixel drift.

## Verification

- `pnpm run test -- grid-layout constraints`

## Evidence to attach

- Attach grid fixture table and pixel-alignment screenshots.

## Out of scope

- Masonry.
- Auto-placement heuristics matching CSS Grid.
- Subgrid.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E07](../../EPICS.md#e07)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
