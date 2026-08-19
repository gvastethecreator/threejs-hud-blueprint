---
id: HUD-063
title: "Create the unit-test harness, deterministic clocks, and mock GPU/text boundaries"
epic: E10
milestone: M4
type: quality
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-003
  - HUD-012
  - HUD-024
  - HUD-034
labels:
  - "area:quality"
  - "area:testing"
  - "epic:E10"
  - "milestone:M4"
  - "priority:P0"
  - "size:L"
  - "type:quality"
---

# HUD-063: Create the unit-test harness, deterministic clocks, and mock GPU/text boundaries

## Outcome

Pure math, tree, layout, input, widgets, and lifecycle behavior can be tested without a real GPU, while renderer/backend integration remains covered by focused browser tests.

## Scope

- Create deterministic time, ID, viewport, renderer-state, resource, and text-backend mocks.
- Define test factories and canonical fixtures.
- Separate pure unit tests from browser integration tests.
- Add coverage thresholds focused on critical contracts rather than chasing line count alone.

## Acceptance criteria

- [ ] Unit tests do not require browser WebGPU.
- [ ] Mocks enforce lifecycle and ownership mistakes rather than accepting everything.
- [ ] Time-dependent widget/input tests use an injected deterministic clock.
- [ ] Test helpers are available only through `./testing` or internal test paths.
- [ ] Coverage reports distinguish package code from playground code.

## Verification

- `pnpm run test:unit`
- `pnpm run test:coverage`

## Evidence to attach

- Attach coverage summary and mock contract documentation.

## Out of scope

- Mocking Three.js internals in place of real integration tests.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E10](../../EPICS.md#e10)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
