---
id: HUD-041
title: "Harden Windfoil failure, device-loss, minification, and performance behavior"
epic: E06
milestone: M2
type: quality
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-039
  - HUD-040
labels:
  - "area:quality"
  - "area:text"
  - "backend:windfoil"
  - "epic:E06"
  - "milestone:M2"
  - "priority:P0"
  - "size:L"
  - "type:quality"
---

# HUD-041: Harden Windfoil failure, device-loss, minification, and performance behavior

## Outcome

The analytic backend has explicit limits, graceful failure, device-loss behavior, and regression budgets instead of being treated as successful because one demo renders.

## Scope

- Handle shader compilation, buffer allocation, unsupported features, device loss, and restore/recreate policy.
- Define min/max glyph size and transform ranges from evidence.
- Add cold/warm benchmark budgets and warning thresholds.
- Expose fallback recommendation without silently mutating the selected backend.

## Acceptance criteria

- [x] Device loss invalidates resources and publishes one clear state transition.
- [x] The documented restore policy is tested or explicitly unsupported.
- [x] Out-of-range minification/transform conditions produce diagnostics.
- [x] Benchmark verification compares against a stored host/profile baseline.
- [x] Failure leaves the core HUD and alternate backends usable.

## Verification

- `pnpm run test -- windfoil-failure`
- `pnpm run benchmark:windfoil -- --verify`

## Evidence to attach

- Attach device-loss/failure traces and budget report.

## Out of scope

- Guaranteeing GPU recovery across all browsers.
- Hiding legal or visual limitations.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E06](../../EPICS.md#e06)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
