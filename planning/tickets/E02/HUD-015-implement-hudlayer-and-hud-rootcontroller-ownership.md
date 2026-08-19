---
id: HUD-015
title: "Implement HudLayer and HUD root/controller ownership"
epic: E02
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-013
  - HUD-014
labels:
  - "area:core"
  - "area:layers"
  - "epic:E02"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-015: Implement HudLayer and HUD root/controller ownership

## Outcome

A HUD owns ordered layers, each with an independent viewport/scaling policy and root node, while the host owns the renderer and frame loop.

## Scope

- Create, insert, reorder, enable, disable, and remove layers.
- Give each layer a stable ID, order, reference frame, scale policy, pixel-snap policy, safe insets, and root.
- Prevent a node or layer from being owned by multiple HUDs.
- Expose deterministic layer traversal and diagnostics.

## Acceptance criteria

- [x] Smooth, pixel, and native layers can coexist with distinct transforms.
- [x] Layer removal detaches or disposes content according to an explicit option.
- [x] Equal layer order resolves through stable insertion order.
- [x] Disabled layers perform no layout, input, or draw work.
- [x] Layer IDs are unique within a HUD.

## Verification

- `pnpm run test -- hud-layer`

## Evidence to attach

- Attach the layer ordering and ownership test report.

## Out of scope

- Nested render targets per layer.
- World-space layers.
- Layer-specific animation loops.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E02](../../EPICS.md#e02)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
