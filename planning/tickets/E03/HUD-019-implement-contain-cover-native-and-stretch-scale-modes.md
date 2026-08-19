---
id: HUD-019
title: "Implement contain, cover, native, and stretch scale modes"
epic: E03
milestone: M1
type: task
priority: P0
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-018
labels:
  - "area:viewport"
  - "epic:E03"
  - "milestone:M1"
  - "priority:P0"
  - "size:M"
  - "type:task"
---

# HUD-019: Implement contain, cover, native, and stretch scale modes

## Outcome

The viewport offers the four continuous scale policies needed for common HUD and full-screen interface layouts with explicit letterbox/crop behavior.

## Scope

- Implement scale and offset formulas for contain, cover, native CSS-pixel, and stretch.
- Expose visible logical bounds after cover cropping or letterboxing.
- Document whether offsets may be fractional.
- Add aspect-ratio fixtures for landscape, portrait, square, and ultrawide.

## Acceptance criteria

- [x] Contain never crops the reference frame.
- [x] Cover always fills the host viewport.
- [x] Native maps one logical unit to one CSS pixel before DPR.
- [x] Stretch reports independent X/Y scale and diagnostics when used with text.
- [x] All formulas remain finite under valid inputs.

## Verification

- `pnpm run test -- scale-modes`
- `Run scaling-lab screenshot scenarios.`

## Evidence to attach

- Store the aspect-ratio matrix screenshots.

## Out of scope

- Responsive breakpoints.
- Automatic component rearrangement by aspect ratio.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E03](../../EPICS.md#e03)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
