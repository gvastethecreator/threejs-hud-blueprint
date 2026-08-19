---
id: HUD-043
title: "Define SDF atlas lifecycle, capability truth, and fallback policy"
epic: E06
milestone: M2
type: quality
priority: P1
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-042
labels:
  - "area:resources"
  - "area:text"
  - "backend:sdf"
  - "epic:E06"
  - "milestone:M2"
  - "priority:P1"
  - "size:L"
  - "type:quality"
---

# HUD-043: Define SDF atlas lifecycle, capability truth, and fallback policy

## Outcome

SDF font preparation, worker/atlas readiness, fallback fonts, and disposal are observable and do not introduce hidden global state or overstate shaping support.

## Scope

- Normalize async readiness into FontRegistry/backend states.
- Track atlas/font resources per HUD or documented shared cache.
- Define worker ownership and teardown if the selected implementation uses one.
- Map its actual shaping/fallback behavior to capability records and tests.

## Acceptance criteria

- [x] Late worker/font completion cannot publish into a disposed HUD.
- [x] Shared caches have a documented owner and test reset path.
- [x] Capability tests use real scripts rather than README claims alone.
- [x] Fallback behavior does not recursively reselect the same failed backend.
- [x] All third-party notices are included in the correct package path.

## Verification

- `pnpm run test -- sdf-lifecycle sdf-capabilities`

## Evidence to attach

- Attach worker/resource traces and script capability samples.

## Out of scope

- Reimplementing complex shaping.
- A global immortal worker.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E06](../../EPICS.md#e06)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
