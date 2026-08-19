---
id: HUD-057
title: "Implement LinearBar with segmented, delayed, and labeled variants"
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
  - HUD-030
  - HUD-055
  - HUD-056
labels:
  - "area:bars"
  - "area:widgets"
  - "epic:E09"
  - "milestone:M3"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-057: Implement LinearBar with segmented, delayed, and labeled variants

## Outcome

Health, stamina, mana, loading, and ammunition bars can be represented through one compositional widget with normalized value, orientation, segments, label, and optional independently controlled delayed value.

## Scope

- Define min/max/value normalization and invalid-range diagnostics.
- Compose track, fill, border, segment overlay, delayed fill, and label.
- Support horizontal/vertical and reverse direction.
- Expose value updates as instance/style changes rather than geometry rebuild where possible.

## Acceptance criteria

- [ ] Out-of-range values follow documented clamp/overflow policy.
- [ ] Value-only updates do not remeasure unchanged labels unless label text changes.
- [ ] Segment gaps remain stable under supported scale modes.
- [ ] Delayed value is host-controlled; the widget owns no tween loop.
- [ ] Zero and full values render without negative or excess bounds.

## Verification

- `pnpm run test -- linear-bar`
- `pnpm run visual:widgets -- linear-bar`

## Evidence to attach

- Attach update invalidation counts and visual matrix.

## Out of scope

- A built-in animation engine.
- Nonlinear path bars.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E09](../../EPICS.md#e09)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
