---
id: HUD-056
title: "Implement Panel, Label, and IconLabel compositions"
epic: E09
milestone: M3
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-027
  - HUD-028
  - HUD-036
  - HUD-048
  - HUD-055
labels:
  - "area:widgets"
  - "epic:E09"
  - "milestone:M3"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-056: Implement Panel, Label, and IconLabel compositions

## Outcome

The foundational content widgets compose panel backgrounds, borders, nine-slice skins, images, and text while exposing predictable layout and theme APIs.

## Scope

- Implement Panel as a layout container over rectangle/nine-slice primitives.
- Implement Label over canonical text.
- Implement IconLabel with image/icon, text, gap, alignment, and optional value.
- Support disabled/hovered state only where interactive.

## Acceptance criteria

- [ ] Widgets introduce no custom renderer path.
- [ ] Label backend can be changed without changing widget props.
- [ ] Panel padding participates in child layout.
- [ ] IconLabel intrinsic size includes icon, gap, and text.
- [ ] All owned child primitives are disposed with the widget.

## Verification

- `pnpm run test -- panel label icon-label`
- `Run widget base visual scenarios.`

## Evidence to attach

- Attach composition tree and screenshots for smooth/pixel themes.

## Out of scope

- Buttons with keyboard semantics.
- Rich text spans.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E09](../../EPICS.md#e09)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
