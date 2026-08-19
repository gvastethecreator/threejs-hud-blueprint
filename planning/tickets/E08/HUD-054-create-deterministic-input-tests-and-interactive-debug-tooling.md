---
id: HUD-054
title: "Create deterministic input tests and interactive debug tooling"
epic: E08
milestone: M3
type: quality
priority: P0
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-051
  - HUD-052
  - HUD-053
labels:
  - "area:input"
  - "area:quality"
  - "epic:E08"
  - "milestone:M3"
  - "priority:P0"
  - "size:M"
  - "type:quality"
---

# HUD-054: Create deterministic input tests and interactive debug tooling

## Outcome

Pointer behavior can be inspected and reproduced through scripted event sequences, hit-region overlays, target paths, and state logs rather than manual clicking alone.

## Scope

- Create a synthetic pointer driver independent of browser event timing.
- Add debug overlays for hit boxes, effective clips, hovered path, pressed target, and captured target.
- Create resize-during-gesture, node-removal, overlap, clipping, and split-screen scenarios.
- Keep debug output serializable and bounded.

## Acceptance criteria

- [ ] The same scripted sequence yields the same event trace.
- [ ] Debug overlays do not intercept pointer input.
- [ ] At least one browser E2E case verifies real event adapter wiring.
- [ ] Input diagnostics contain no unbounded event history.

## Verification

- `pnpm run test:input`
- `pnpm run e2e -- input`

## Evidence to attach

- Commit event traces and input debug screenshots.

## Out of scope

- A general record/replay system for the game.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E08](../../EPICS.md#e08)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
