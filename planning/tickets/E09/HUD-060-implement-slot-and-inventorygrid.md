---
id: HUD-060
title: "Implement Slot and InventoryGrid"
epic: E09
milestone: M3
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-049
  - HUD-052
  - HUD-053
  - HUD-055
  - HUD-056
labels:
  - "area:inventory"
  - "area:widgets"
  - "epic:E09"
  - "milestone:M3"
  - "priority:P0"
  - "size:XL"
  - "type:task"
---

# HUD-060: Implement Slot and InventoryGrid

## Outcome

A fixed inventory can display item icon, frame, quantity, cooldown, rarity/state styling, selection, disabled/empty state, and pointer activation through reusable Slot widgets in Grid layout.

## Scope

- Define controlled slot data and event callbacks.
- Compose panel/image/label/radial overlay primitives.
- Implement grid data-to-slot reconciliation by stable key.
- Support selected, hovered, pressed, disabled, empty, and cooldown states.
- Virtualization is not required for the bounded v0.1 grid.

## Acceptance criteria

- [x] Updating one slot does not rebuild every slot.
- [x] Reordering by stable key preserves reusable slot instances.
- [x] Empty and missing-icon states are deterministic.
- [x] Quantity and cooldown overlays clip within the slot.
- [x] Click emits item identity but does not mutate host inventory data.

## Verification

- `pnpm run test -- slot inventory-grid`
- `pnpm run e2e -- inventory`

## Evidence to attach

- Attach reconciliation counts, event trace, and visual state matrix.

## Out of scope

- Drag and drop.
- Equipment rules.
- Unbounded virtualized inventories.
- Persistence.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E09](../../EPICS.md#e09)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
