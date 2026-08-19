---
id: HUD-053
title: "Implement pointerEvents policy, disabled/pass-through behavior, and interaction styles"
epic: E08
milestone: M3
type: task
priority: P1
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-052
  - HUD-055
labels:
  - "area:input"
  - "area:theme"
  - "epic:E08"
  - "milestone:M3"
  - "priority:P1"
  - "size:L"
  - "type:task"
---

# HUD-053: Implement pointerEvents policy, disabled/pass-through behavior, and interaction styles

## Outcome

Containers and widgets can opt out, intercept only their box, allow child-only interaction, or pass through entirely, while disabled/hovered/pressed/selected states feed theme resolution.

## Scope

- Define `auto`, `none`, `box-only`, and `box-none` semantics.
- Define disabled behavior and whether disabled nodes block underlying hits.
- Publish interaction state changes without creating a global store.
- Connect states to style resolution through a small observable contract.

## Acceptance criteria

- [x] Each pointerEvents mode has nested-parent/child fixtures.
- [x] Disabled behavior is consistent across hit testing and widget visuals.
- [x] Pass-through nodes do not receive synthetic hover.
- [x] State changes invalidate style only, unless widget geometry genuinely changes.

## Verification

- `pnpm run test -- pointer-policy interaction-state`

## Evidence to attach

- Attach policy matrix and nested fixture traces.

## Out of scope

- ARIA semantics.
- Focus rings.
- Keyboard/gamepad selection.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E08](../../EPICS.md#e08)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
