---
id: HUD-018
title: "Implement logical reference resolution and viewport transforms"
epic: E03
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-012
  - HUD-015
labels:
  - "area:math"
  - "area:viewport"
  - "epic:E03"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-018: Implement logical reference resolution and viewport transforms

## Outcome

Each layer maps a logical design coordinate system into a host viewport through a pure, inspectable transform that does not depend on camera distance or game-scene units.

## Scope

- Define reference width/height, viewport rectangle, logical bounds, scale, offset, and inverse transform.
- Use a top-left logical origin with documented Y direction.
- Keep transform computation pure and unit tested.
- Feed the result to the orthographic camera/render adapter without duplicating math.

## Acceptance criteria

- [x] The logical center maps to the viewport center for the default policy.
- [x] Forward and inverse transforms round-trip within tolerance.
- [x] Zero or negative dimensions yield typed diagnostics rather than NaN propagation.
- [x] Viewport transforms are serializable for evidence.

## Verification

- `pnpm run test -- viewport-transform`

## Evidence to attach

- Attach the transform fixture table.

## Out of scope

- Perspective HUD layout.
- World camera coupling.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E03](../../EPICS.md#e03)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
