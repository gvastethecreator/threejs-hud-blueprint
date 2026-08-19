---
id: HUD-012
title: "Define the public core contracts, diagnostics, and error model"
epic: E02
milestone: M1
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-004
  - HUD-011
labels:
  - "area:api"
  - "area:core"
  - "epic:E02"
  - "milestone:M1"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-012: Define the public core contracts, diagnostics, and error model

## Outcome

The public API has stable, serializable contracts for HUD options, nodes, layers, capabilities, diagnostics, errors, resource handles, and lifecycle states before implementation classes spread ad hoc shapes.

## Scope

- Create discriminated TypeScript types and versioned diagnostic/error codes.
- Separate expected capability rejection from exceptional runtime failure.
- Define disposed-state behavior and idempotency.
- Keep public value objects free of Three.js implementation objects unless intentionally typed as host inputs.
- Add API contract tests and declaration snapshots.

## Acceptance criteria

- [x] Errors include machine-readable code, human message, optional cause, and safe detail metadata.
- [x] Diagnostics can be collected through a callback without mandatory console output.
- [x] Capability results explain unsupported backend choices.
- [x] Public interfaces compile under `exactOptionalPropertyTypes` and strict mode.
- [x] Declaration snapshots contain no accidental internal path exports.

## Verification

- `pnpm run test -- public-contracts`
- `pnpm run api:check`

## Evidence to attach

- Attach the generated public declaration report.

## Out of scope

- Finalizing every widget prop.
- Adding a global logger dependency.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E02](../../EPICS.md#e02)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
