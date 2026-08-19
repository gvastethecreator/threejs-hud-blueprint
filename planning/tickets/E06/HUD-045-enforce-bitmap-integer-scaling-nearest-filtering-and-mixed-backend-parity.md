---
id: HUD-045
title: "Enforce bitmap integer scaling, nearest filtering, and mixed-backend parity"
epic: E06
milestone: M2
type: quality
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-020
  - HUD-030
  - HUD-044
labels:
  - "area:quality"
  - "area:text"
  - "backend:bitmap"
  - "epic:E06"
  - "milestone:M2"
  - "priority:P0"
  - "size:L"
  - "type:quality"
---

# HUD-045: Enforce bitmap integer scaling, nearest filtering, and mixed-backend parity

## Outcome

Bitmap text remains physically crisp under the declared pixel policy, and smooth plus pixel text can coexist in one HUD without sharing an invalid scale or filtering assumption.

## Scope

- Bind nearest filtering and disable mipmaps where appropriate.
- Validate native size and integer multiplier against layer scale/DPR.
- Define warn, reject, or smooth-fallback policies for fractional presentation.
- Create mixed smooth/pixel layer scenarios and clip/opacity parity checks.

## Acceptance criteria

- [x] Pixel snapshots at allowed scales contain no interpolated edge colors beyond the authored atlas.
- [x] Fractional scale never silently claims pixel-perfect output.
- [x] Smooth text in another layer remains unaffected.
- [x] Glyph origins, advances, line height, and clip edges snap consistently.
- [x] The backend passes shared ownership/disposal cases.

## Verification

- `pnpm run visual:text-bitmap -- --verify`
- `pnpm run test -- bitmap-scale-policy`

## Evidence to attach

- Attach pixel histogram/diff report for each scale/DPR pair.

## Out of scope

- Subpixel LCD rendering.
- Automatically changing the host's DPR.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E06](../../EPICS.md#e06)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
