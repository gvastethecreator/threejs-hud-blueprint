---
id: HUD-028
title: "Implement Image and NineSlice primitives"
epic: E04
milestone: M1
type: task
priority: P1
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-026
  - HUD-027
labels:
  - "area:assets"
  - "area:primitives"
  - "epic:E04"
  - "milestone:M1"
  - "priority:P1"
  - "size:L"
  - "type:task"
---

# HUD-028: Implement Image and NineSlice primitives

## Outcome

HUDs can draw icons, item artwork, sprites, and scalable panel skins with explicit texture ownership, filtering, UV, tint, and nine-slice policies.

## Scope

- Accept Three.js textures through borrowed or owned resource handles.
- Support UV rectangles, tint, opacity, nearest/linear filtering policy, and aspect modes.
- Implement nine-slice borders without duplicating textures.
- Define async image readiness and placeholder behavior.

## Acceptance criteria

- [x] Borrowed textures are never disposed by the HUD.
- [x] Owned textures are disposed exactly once.
- [x] Nine-slice corners preserve authored size under supported scaling.
- [x] Nearest filtering is retained for pixel-art assets.
- [x] Texture load failure produces a diagnostic and stable placeholder/no-draw result.

## Verification

- `pnpm run test -- image nine-slice`
- `Run image ownership and visual scenarios.`

## Evidence to attach

- Attach texture ownership counters and nine-slice screenshots.

## Out of scope

- A general asset loader.
- Texture atlasing pipeline.
- Animated sprites.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E04](../../EPICS.md#e04)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
