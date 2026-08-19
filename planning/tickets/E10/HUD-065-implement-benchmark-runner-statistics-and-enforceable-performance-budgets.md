---
id: HUD-065
title: "Implement benchmark runner, statistics, and enforceable performance budgets"
epic: E10
milestone: M4
type: quality
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-014
  - HUD-026
  - HUD-031
  - HUD-038
  - HUD-041
  - HUD-062
labels:
  - "area:performance"
  - "area:quality"
  - "epic:E10"
  - "milestone:M4"
  - "priority:P0"
  - "size:XL"
  - "type:quality"
---

# HUD-065: Implement benchmark runner, statistics, and enforceable performance budgets

## Outcome

Cold initialization, font preparation, layout, updates, command generation, uploads, draw calls, allocations, and memory are measured in reproducible scenarios with report and verify modes.

## Scope

- Define static 2,000-glyph, dynamic counter, 100-primitive, inventory, resize, theme change, and mixed-backend scenarios.
- Separate CPU phases and collect GPU timing only when reliable/available.
- Use warm-up, sample count, median, p95, and regression tolerance.
- Record environment metadata and baseline profile.
- Expose library stats without requiring renderer internals.

## Acceptance criteria

- [x] Value-only bar/counter updates have their own budget.
- [x] No-allocation steady-state is verified for fixed scenes where promised.
- [x] Draw-call and buffer-byte budgets fail with deltas.
- [x] Results from a mismatched environment cannot overwrite an approved baseline accidentally.
- [x] Report mode remains useful when GPU timers are unavailable.

## Verification

- `pnpm run benchmark:smoke`
- `pnpm run benchmark:full -- --verify`

## Evidence to attach

- Commit budgets JSON schema and example report.

## Out of scope

- Universal FPS guarantees.
- Benchmarking the host game scene.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E10](../../EPICS.md#e10)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
