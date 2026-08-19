---
id: HUD-022
title: "Synchronize CSS size, drawing-buffer size, DPR, and multi-viewport state"
epic: E03
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-006
  - HUD-018
labels:
  - "area:renderer"
  - "area:viewport"
  - "epic:E03"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-022: Synchronize CSS size, drawing-buffer size, DPR, and multi-viewport state

## Outcome

The HUD distinguishes logical canvas size from physical drawing-buffer size and can render into a supplied viewport/scissor without resizing or taking ownership of the host canvas.

## Scope

- Read or accept host CSS size, drawing-buffer size, pixel ratio, viewport, and scissor.
- Support explicit split-screen viewport inputs.
- Avoid cumulative DPR transforms.
- Define update behavior when renderer size changes between frames.
- Keep optional ResizeObserver integration in an adapter package path.

## Acceptance criteria

- [x] A renderer pixel-ratio change updates physical snapping and backend uniforms.
- [x] Rendering one HUD viewport does not overwrite a sibling viewport's state.
- [x] The core never calls renderer `setSize` unless an explicit helper is invoked.
- [x] Viewport/scissor values are restored after rendering.

## Verification

- `pnpm run test -- drawing-buffer multi-viewport`
- `Run split-screen browser scenario.`

## Evidence to attach

- Attach viewport state snapshots and split-screen screenshot.

## Out of scope

- Automatic canvas layout.
- Multiple renderers sharing one HUD tree.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E03](../../EPICS.md#e03)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
