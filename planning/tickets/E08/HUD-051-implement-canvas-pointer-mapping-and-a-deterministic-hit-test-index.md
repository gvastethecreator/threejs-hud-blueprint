---
id: HUD-051
title: "Implement canvas pointer mapping and a deterministic hit-test index"
epic: E08
milestone: M3
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-017
  - HUD-023
  - HUD-050
labels:
  - "area:input"
  - "area:viewport"
  - "epic:E08"
  - "milestone:M3"
  - "priority:P0"
  - "size:XL"
  - "type:task"
---

# HUD-051: Implement canvas pointer mapping and a deterministic hit-test index

## Outcome

Pointer positions from the host canvas map into the correct layer/logical space and resolve the highest eligible interactive node through bounds and clip-aware hit testing.

## Scope

- Provide an explicit canvas pointer adapter and a core pointer-input method.
- Map client coordinates through canvas bounds, viewport, layer transform, zoom, and DPR.
- Build/update a hit-test index only when relevant bounds/order/interaction state changes.
- Respect effective clip, visibility, opacity policy, and layer order.

## Acceptance criteria

- [x] The topmost eligible node wins under the same order contract as rendering.
- [x] Split-screen viewport offsets map correctly.
- [x] Clipped-out regions do not receive hits.
- [x] A stationary pointer can recompute hover after layout changes.
- [x] The adapter removes all DOM listeners on disconnect/dispose.

## Verification

- `pnpm run test -- pointer-mapping hit-test`
- `Run pointer grid browser scenario.`

## Evidence to attach

- Attach hit-test trace and visual debug screenshot.

## Out of scope

- 3D raycasting.
- Alpha-mask hit testing.
- Touch gestures beyond pointer events.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E08](../../EPICS.md#e08)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
