---
id: HUD-061
title: "Implement Hotbar, selection frame, and quantity/shortcut badges"
epic: E09
milestone: M3
type: task
priority: P1
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-048
  - HUD-052
  - HUD-053
  - HUD-055
  - HUD-060
labels:
  - "area:inventory"
  - "area:widgets"
  - "epic:E09"
  - "milestone:M3"
  - "priority:P1"
  - "size:L"
  - "type:task"
---

# HUD-061: Implement Hotbar, selection frame, and quantity/shortcut badges

## Outcome

A horizontal or vertical hotbar reuses Slot composition while adding controlled active index, selection frame, shortcut badge, quantity badge, and compact navigation visuals.

## Scope

- Compose Hotbar from Stack/Grid plus Slot.
- Define controlled active key/index and activation callback.
- Add selection frame and shortcut/quantity badge placements.
- Support horizontal/vertical orientation and reversed order.

## Acceptance criteria

- [x] Changing active slot updates only previous/new selection visuals.
- [x] Shortcut text can use pixel or smooth backend.
- [x] Hotbar does not own keyboard/gamepad listeners in v0.1.
- [x] Overflow follows documented clip policy.
- [x] Selection remains stable when data reorders by key.

## Verification

- `pnpm run test -- hotbar`
- `pnpm run visual:widgets -- hotbar`

## Evidence to attach

- Attach active-slot update counters and orientation screenshots.

## Out of scope

- Input binding system.
- Radial weapon wheel.
- Automatic gamepad navigation.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E09](../../EPICS.md#e09)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
