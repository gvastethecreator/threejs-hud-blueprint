---
id: HUD-058
title: "Implement RadialBar and Gauge with ticks, labels, and needle"
epic: E09
milestone: M3
type: task
priority: P1
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-029
  - HUD-036
  - HUD-055
  - HUD-056
labels:
  - "area:radial"
  - "area:widgets"
  - "epic:E09"
  - "milestone:M3"
  - "priority:P1"
  - "size:XL"
  - "type:task"
---

# HUD-058: Implement RadialBar and Gauge with ticks, labels, and needle

## Outcome

Cooldowns, resource rings, speedometers, and gauges can be composed from the ring primitive plus optional ticks, labels, and a needle under one angle convention.

## Scope

- Implement RadialBar value mapping, track, fill, segments, caps, and center content.
- Implement Gauge ranges, ticks, major ticks, needle, value label, and optional min/max labels.
- Reuse public primitives and text.
- Bound tick/segment counts and batch fragmentation.

## Acceptance criteria

- [ ] RadialBar and Gauge use the same angle/direction convention as Ring.
- [ ] Needle value clamping and overrange policy are explicit.
- [ ] Tick labels can use any registered text backend.
- [ ] Value-only needle/fill updates avoid full layout.
- [ ] Full-circle and partial-sweep scenarios pass visual tests.

## Verification

- `pnpm run test -- radial-bar gauge`
- `pnpm run visual:widgets -- radial`

## Evidence to attach

- Attach radial reference sheet and update counters.

## Out of scope

- Physics-based needle motion.
- Text on curved paths.
- 3D gauges.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E09](../../EPICS.md#e09)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
