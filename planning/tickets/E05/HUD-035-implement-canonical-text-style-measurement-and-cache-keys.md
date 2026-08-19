---
id: HUD-035
title: "Implement canonical text style, measurement, and cache keys"
epic: E05
milestone: M2
type: task
priority: P0
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-032
  - HUD-033
  - HUD-034
labels:
  - "area:performance"
  - "area:text"
  - "epic:E05"
  - "milestone:M2"
  - "priority:P0"
  - "size:M"
  - "type:task"
---

# HUD-035: Implement canonical text style, measurement, and cache keys

## Outcome

Text size and layout invalidation are derived from a normalized style contract and deterministic measurement cache rather than backend-specific objects or stringified arbitrary options.

## Scope

- Define font, size, letter spacing, line height, alignment, direction, wrapping, max lines, overflow, color, outline, shadow, and backend preference.
- Separate layout-affecting and paint-only style keys.
- Normalize defaults before cache lookup.
- Bound cache size and expose hit/miss/eviction diagnostics.

## Acceptance criteria

- [x] Changing color does not invalidate measurement.
- [x] Changing size, tracking, text, font, wrap width, or line height does invalidate measurement.
- [x] Equivalent normalized styles share a cache entry.
- [x] Cache keys are deterministic and do not include object identity.
- [x] Invalid finite values are diagnosed before reaching layout.

## Verification

- `pnpm run test -- text-style measurement-cache`

## Evidence to attach

- Attach cache-key and invalidation matrix.

## Out of scope

- CSS text-decoration model.
- Rich spans with mixed fonts in one label.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E05](../../EPICS.md#e05)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
