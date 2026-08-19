---
id: HUD-029
title: "Implement Arc, Ring, segmented progress, and tick geometry"
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
  - "area:primitives"
  - "area:radial"
  - "epic:E04"
  - "milestone:M1"
  - "priority:P1"
  - "size:L"
  - "type:task"
---

# HUD-029: Implement Arc, Ring, segmented progress, and tick geometry

## Outcome

Circular bars, gauges, cooldowns, and reticles can be composed from a shader-driven ring primitive with bounded segment and tick options.

## Scope

- Define start angle, sweep, direction, inner/outer radius, caps, value range, segments, gap, and tick parameters.
- Use one quad per ring instance where the approved renderer supports the shader.
- Normalize angles and handle full-circle seams.
- Expose conservative bounds for layout and hit testing.

## Acceptance criteria

- [x] Zero, partial, and full progress render without seam flashes.
- [x] Clockwise and counter-clockwise modes agree on angle convention.
- [x] Segment count and tick count are capped with diagnostics.
- [x] Inner radius cannot exceed outer radius without a typed validation result.
- [x] Ring instances batch when material features match.

## Verification

- `pnpm run test -- ring arc`
- `Run radial primitive visual scenarios.`

## Evidence to attach

- Attach angle/segment/cap reference sheet.

## Out of scope

- Arbitrary spiral paths.
- 3D tubes.
- Text following an arc.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E04](../../EPICS.md#e04)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
