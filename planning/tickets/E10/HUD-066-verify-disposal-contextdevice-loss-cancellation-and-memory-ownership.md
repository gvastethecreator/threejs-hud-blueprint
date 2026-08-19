---
id: HUD-066
title: "Verify disposal, context/device loss, cancellation, and memory ownership"
epic: E10
milestone: M4
type: quality
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-016
  - HUD-025
  - HUD-026
  - HUD-033
  - HUD-039
  - HUD-042
  - HUD-044
labels:
  - "area:quality"
  - "area:resources"
  - "epic:E10"
  - "milestone:M4"
  - "priority:P0"
  - "risk:high"
  - "size:XL"
  - "type:quality"
---

# HUD-066: Verify disposal, context/device loss, cancellation, and memory ownership

## Outcome

Every owned CPU, Three.js, texture, font, worker, shader, and GPU resource has one owner and survives failure/cancellation without leak, double-dispose, or stale publication.

## Scope

- Create resource ledgers and lifecycle assertions in development/testing.
- Test repeated create/dispose cycles and partial initialization failure.
- Test WebGL context loss and approved WebGPU device-loss behavior where automation permits.
- Test aborted font/backend work and late completion.
- Document borrowed versus owned resources in public API.

## Acceptance criteria

- [x] Resource counters return to baseline after repeated cycles.
- [x] Borrowed renderer/textures are not disposed.
- [x] Owned resources dispose exactly once.
- [x] Context/device loss produces visible state and no infinite retry loop.
- [x] Late async callbacks cannot recreate disposed resources.

## Verification

- `pnpm run test:resources`
- `pnpm run e2e -- context-loss`

## Evidence to attach

- Attach resource ledger and repeated-cycle reports.

## Out of scope

- Proving browser-driver memory reclamation immediately after GC.
- Recovering a destroyed host renderer without host cooperation.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E10](../../EPICS.md#e10)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
