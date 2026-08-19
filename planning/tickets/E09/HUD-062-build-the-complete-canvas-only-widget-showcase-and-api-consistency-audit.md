---
id: HUD-062
title: "Build the complete canvas-only widget showcase and API consistency audit"
epic: E09
milestone: M3
type: quality
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-056
  - HUD-057
  - HUD-058
  - HUD-059
  - HUD-060
  - HUD-061
labels:
  - "area:quality"
  - "area:showcase"
  - "area:widgets"
  - "epic:E09"
  - "milestone:M3"
  - "priority:P0"
  - "size:L"
  - "type:quality"
---

# HUD-062: Build the complete canvas-only widget showcase and API consistency audit

## Outcome

One vertical demo proves the full product proposition—smooth text, pixel text, bars, radial UI, crosshair, inventory, hotbar, themes, scaling, and pointer interaction rendered inside the Three.js canvas.

## Scope

- Create a game-like scene plus HUD, not isolated component thumbnails only.
- Expose lab controls outside the package; all showcased HUD content remains canvas-native.
- Switch renderer/text backend/theme/scale/DPR scenarios where supported.
- Audit naming, value semantics, state props, events, disposal, and theme overrides across widgets.

## Acceptance criteria

- [x] The showcase uses only public package exports.
- [x] No HUD element is implemented with HTML/CSS.
- [x] All initial widgets work in at least one smooth and one pixel-oriented theme.
- [x] Backend switching does not require widget reconstruction beyond documented font/backend changes.
- [x] The showcase meets the current render and allocation budgets.

## Verification

- `pnpm run e2e -- showcase`
- `pnpm run visual:showcase -- --verify`
- `pnpm run render:budget -- --verify`

## Evidence to attach

- Commit showcase screenshots, metrics, and public-import audit.

## Out of scope

- A polished game.
- A visual HUD editor.
- Marketing website.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E09](../../EPICS.md#e09)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
