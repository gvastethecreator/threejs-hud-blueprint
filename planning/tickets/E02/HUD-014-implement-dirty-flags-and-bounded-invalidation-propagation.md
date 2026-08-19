---
id: HUD-014
title: "Implement dirty flags and bounded invalidation propagation"
epic: E02
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-013
labels:
  - "area:core"
  - "area:performance"
  - "epic:E02"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-014: Implement dirty flags and bounded invalidation propagation

## Outcome

Property changes invalidate only the necessary transform, layout, text, geometry, style, hit-test, or render-queue work, enabling efficient value updates and predictable debugging.

## Scope

- Define dirty-bit categories and propagation directions.
- Coalesce repeated writes before the next update.
- Expose read-only debug reasons without retaining unbounded histories.
- Separate subtree layout invalidation from value-only material/instance updates.
- Add instrumentation counters for recomputation.

## Acceptance criteria

- [x] Changing a bar value does not invalidate unrelated text layout or parent structure.
- [x] Changing a font size invalidates measurement, layout, glyph drawable, and hit bounds.
- [x] Changing opacity does not rebuild geometry.
- [x] Dirty flags clear only after the owning stage succeeds.
- [x] Tests assert recomputation counts for representative changes.

## Verification

- `pnpm run test -- invalidation`

## Evidence to attach

- Attach the invalidation matrix and recomputation counter output.

## Out of scope

- Automatic dependency tracking proxies.
- A general reactive state library.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E02](../../EPICS.md#e02)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
