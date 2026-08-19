---
id: HUD-055
title: "Implement serializable themes, token resolution, and state styles"
epic: E09
milestone: M3
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-012
  - HUD-014
  - HUD-052
labels:
  - "area:theme"
  - "area:widgets"
  - "epic:E09"
  - "milestone:M3"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-055: Implement serializable themes, token resolution, and state styles

## Outcome

Widgets and primitives can resolve colors, typography, spacing, radii, strokes, and interaction-state overrides from plain serializable theme objects without CSS or a runtime styling framework.

## Scope

- Define token namespaces and typed references.
- Implement theme inheritance/override and state-style merge rules.
- Normalize colors into the render color contract.
- Detect missing/cyclic token references.
- Keep theme change invalidation bounded to affected style/layout properties.

## Acceptance criteria

- [x] A theme can be JSON-serialized after excluding functions/resources.
- [x] Missing tokens produce actionable diagnostics.
- [x] Hover/pressed/disabled/selected overrides resolve in a documented precedence order.
- [x] Changing a paint token does not force full layout.
- [x] Widgets accept direct style overrides without mutating the shared theme.

## Verification

- `pnpm run test -- themes tokens`

## Evidence to attach

- Attach resolved-theme snapshots for default and pixel themes.

## Out of scope

- CSS selectors.
- Arbitrary expression language.
- Runtime design editor.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E09](../../EPICS.md#e09)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
