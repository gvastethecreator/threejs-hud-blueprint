---
id: HUD-042
title: "Implement an isolated SDF text adapter as the compatibility baseline"
epic: E06
milestone: M2
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-034
  - HUD-038
labels:
  - "area:text"
  - "backend:sdf"
  - "epic:E06"
  - "milestone:M2"
  - "priority:P0"
  - "risk:high"
  - "size:XL"
  - "type:task"
---

# HUD-042: Implement an isolated SDF text adapter as the compatibility baseline

## Outcome

A separately imported SDF backend provides the stable WebGL-oriented baseline through the same contract, initially wrapping a proven implementation without leaking its classes into public widgets or core types.

## Scope

- Select and record the initial SDF implementation after a focused compatibility/license spike.
- Keep the external renderer optional and lazy.
- Map canonical glyph runs or, where impossible, document the adapter-owned layout seam without changing widgets.
- Implement clip, opacity, color, transform, readiness, and disposal.
- Expose exact shaping and renderer capabilities.

## Acceptance criteria

- [x] The main entry does not import the optional SDF dependency.
- [x] Widgets compile and behave without referencing adapter classes.
- [x] WebGL baseline scenarios render multiline text, counters, clipping, and opacity.
- [x] Unsupported WebGPURenderer modes are declared precisely.
- [x] A future native SDF backend can replace the adapter behind the same export.

## Verification

- `pnpm run test:text-sdf`
- `pnpm run visual:text-sdf`
- `pnpm run bundle:report`

## Evidence to attach

- Attach selection ADR, conformance report, and bundle graph.

## Risks

- The chosen SDF library may not map cleanly to canonical glyph runs or WebGPU.

## Out of scope

- Claiming full Unicode parity without tests.
- Forking a third-party renderer in v0.1.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E06](../../EPICS.md#e06)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
