---
id: HUD-004
title: "Create typed module contracts and an executable boundary checker"
epic: E00
milestone: M0
type: task
priority: P0
size: L
status: planned
github_issue: pending
sync: pending
blocked_by:
  - HUD-001
labels:
  - "area:architecture"
  - "area:tooling"
  - "epic:E00"
  - "milestone:M0"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-004: Create typed module contracts and an executable boundary checker

## Outcome

Module dependency direction is explicit in both TypeScript metadata and a CI checker, preventing widgets, core contracts, and consumers from coupling to concrete text backends or application code.

## Scope

- Define versioned contract IDs, module roles, consumes/provides lists, allowed claims, blocked claims, and forbidden dependencies.
- Add a boundary manifest for contracts, core, viewport, layout, render, text core, backends, primitives, input, widgets, diagnostics, playground, and fixtures.
- Implement import-path checks and required-root checks without relying on TypeScript private internals.
- Add unit fixtures proving expected failures.

## Acceptance criteria

- [ ] `contracts/` imports no runtime module and no browser global.
- [ ] `widgets/` imports text contracts and primitives but no concrete backend.
- [ ] Text backends import neither widgets nor input.
- [ ] Package code imports no playground, fixture, e2e, planning, or docs code.
- [ ] The playground consumes only declared package exports.
- [ ] A deliberately invalid fixture fails with a precise boundary message.

## Verification

- `pnpm run architecture:verify`
- `pnpm run test -- boundary`

## Evidence to attach

- Attach the module-contract report and one expected-failure snapshot.

## Out of scope

- A general-purpose dependency-cruiser replacement.
- Semantic detection of every possible architectural violation.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E00](../../EPICS.md#e00)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
