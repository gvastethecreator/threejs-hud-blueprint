---
id: HUD-031
title: "Create the primitive regression suite and initial draw-call budgets"
epic: E04
milestone: M1
type: quality
priority: P0
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-025
  - HUD-026
  - HUD-027
  - HUD-028
  - HUD-029
  - HUD-030
labels:
  - "area:primitives"
  - "area:quality"
  - "epic:E04"
  - "milestone:M1"
  - "priority:P0"
  - "size:M"
  - "type:quality"
---

# HUD-031: Create the primitive regression suite and initial draw-call budgets

## Outcome

Every primitive has deterministic visual scenarios and the core-alpha showcase stays within explicit draw-call, material, geometry, and allocation budgets.

## Scope

- Create scenarios for size extremes, opacity, clipping, z-order, scale modes, DPR, texture filtering, and radial edge cases.
- Record renderer info and library diagnostics with each screenshot.
- Set provisional budgets based on measured batches, not arbitrary element count.
- Separate approved renderer/backend baselines.

## Acceptance criteria

- [x] Every public primitive appears in at least one positive and one edge-case scenario.
- [x] A visual change requires explicit baseline approval.
- [x] The showcase reports draw calls, batches, geometries, materials, instance bytes, and allocations.
- [x] Budget verification fails with a readable delta.

## Verification

- `pnpm run visual:primitives -- --verify`
- `pnpm run render:budget -- --verify`

## Evidence to attach

- Commit visual report HTML and metrics JSON.

## Out of scope

- Performance claims for untested hardware.
- Photographic image quality testing.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E04](../../EPICS.md#e04)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
