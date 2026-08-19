---
id: HUD-030
title: "Implement rectangular clip propagation, opacity, blend, and color policy"
epic: E04
milestone: M1
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-024
  - HUD-025
  - HUD-027
  - HUD-028
  - HUD-029
labels:
  - "area:clipping"
  - "area:render"
  - "epic:E04"
  - "milestone:M1"
  - "priority:P0"
  - "risk:high"
  - "size:XL"
  - "type:task"
---

# HUD-030: Implement rectangular clip propagation, opacity, blend, and color policy

## Outcome

Nested HUD content can be clipped and composited predictably across shapes, images, and every text backend without relying on arbitrary masks or leaking renderer state.

## Scope

- Intersect ancestor clip rectangles into an effective clip contract.
- Choose and document shader-clip, scissor, or hybrid implementation per backend based on evidence.
- Propagate authored and inherited opacity using premultiplied-alpha semantics.
- Define supported blend modes and color-space conversion policy.
- Add clip and blend fields to batch keys only when necessary.

## Acceptance criteria

- [x] Nested rectangular clips produce the same visible bounds across primitives and text backends.
- [x] Clip intersections with empty area skip draw work.
- [x] Opacity composition is numerically stable and deterministic.
- [x] Unsupported blend modes are rejected rather than approximated silently.
- [x] Host scissor state remains unchanged after HUD render.

## Verification

- `pnpm run test -- clipping blending color`
- `pnpm run visual:clipping`

## Evidence to attach

- Attach cross-backend clip comparison and renderer-state diff.

## Out of scope

- Rounded masks.
- Stencil hierarchies.
- Backdrop blur.
- Arbitrary compositing groups.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E04](../../EPICS.md#e04)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
