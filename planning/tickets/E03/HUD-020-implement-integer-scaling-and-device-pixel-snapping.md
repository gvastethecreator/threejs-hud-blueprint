---
id: HUD-020
title: "Implement integer scaling and device-pixel snapping"
epic: E03
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-018
  - HUD-019
labels:
  - "area:pixel"
  - "area:viewport"
  - "epic:E03"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-020: Implement integer scaling and device-pixel snapping

## Outcome

Pixel-art layers can select a documented integer scale and snap origins, lines, glyph advances, and clip bounds to physical pixels without affecting smooth layers.

## Scope

- Define integer scale selection, minimum scale, downscale policy, and fallback when the viewport is smaller than the reference.
- Implement logical-to-device snapping helpers with DPR awareness.
- Make snapping opt-in per layer and overridable per node where safe.
- Expose the effective scale and snap delta in diagnostics.

## Acceptance criteria

- [x] Integer mode never silently uses a fractional scale.
- [x] The chosen downscale fallback is explicit and tested.
- [x] Snapped points map to whole physical pixels for tested DPR values.
- [x] Smooth layers remain unsnapped unless requested.
- [x] Nested transforms do not accumulate repeated rounding drift.

## Verification

- `pnpm run test -- integer-scale pixel-snap`
- `Run pixel-grid visual scenarios at DPR 1–3.`

## Evidence to attach

- Attach pixel-diff outputs for the snap matrix.

## Out of scope

- Subpixel font hinting.
- Automatic pixel-font detection from outlines.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E03](../../EPICS.md#e03)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
