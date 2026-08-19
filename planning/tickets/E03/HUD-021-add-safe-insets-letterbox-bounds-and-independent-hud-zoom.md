---
id: HUD-021
title: "Add safe insets, letterbox bounds, and independent HUD zoom"
epic: E03
milestone: M1
type: task
priority: P1
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-018
  - HUD-019
labels:
  - "area:accessibility"
  - "area:viewport"
  - "epic:E03"
  - "milestone:M1"
  - "priority:P1"
  - "size:M"
  - "type:task"
---

# HUD-021: Add safe insets, letterbox bounds, and independent HUD zoom

## Outcome

Layouts can target a safe logical frame, inspect letterbox/crop regions, and apply user HUD scaling independently from the game camera or browser DPR.

## Scope

- Support explicit logical safe insets and an optional host safe-area adapter.
- Expose content, safe, and visible rectangles.
- Apply HUD zoom around a documented anchor.
- Define clamping and diagnostics for invalid zoom.

## Acceptance criteria

- [x] Safe-frame anchors resolve against the safe rectangle when configured.
- [x] HUD zoom changes layout/render scale without changing host renderer pixel ratio.
- [x] Letterbox rectangles are available to debug overlays.
- [x] Zoom changes invalidate only required viewport/layout/render stages.

## Verification

- `pnpm run test -- safe-frame hud-zoom`

## Evidence to attach

- Capture safe-frame and zoom lab screenshots.

## Out of scope

- Reading CSS environment variables in core.
- User preference persistence.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E03](../../EPICS.md#e03)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
