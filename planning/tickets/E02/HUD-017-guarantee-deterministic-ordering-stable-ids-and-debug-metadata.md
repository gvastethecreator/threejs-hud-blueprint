---
id: HUD-017
title: "Guarantee deterministic ordering, stable IDs, and debug metadata"
epic: E02
milestone: M1
type: task
priority: P1
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-013
  - HUD-015
  - HUD-016
labels:
  - "area:core"
  - "area:diagnostics"
  - "epic:E02"
  - "milestone:M1"
  - "priority:P1"
  - "size:M"
  - "type:task"
---

# HUD-017: Guarantee deterministic ordering, stable IDs, and debug metadata

## Outcome

Repeated runs produce stable traversal, layout, render, hit-test, and snapshot ordering, and every debug record can identify its source node without exposing internal object graphs.

## Scope

- Define node IDs, optional user keys, debug labels, insertion sequence, and render sequence.
- Specify tie-breaking for equal z-index and batch keys.
- Provide a serializable tree snapshot for diagnostics and tests.
- Avoid using random IDs in deterministic fixtures.

## Acceptance criteria

- [x] The same authored tree yields the same snapshot across runs.
- [x] Duplicate user keys are diagnosed within their documented scope.
- [x] Render and hit-test ordering share the same authoritative ordering rules.
- [x] Snapshots omit GPU objects, functions, and circular references.

## Verification

- `pnpm run test -- deterministic-order`

## Evidence to attach

- Commit canonical tree snapshot fixtures.

## Out of scope

- Persistent serialization format for authored HUD projects.
- Network synchronization.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E02](../../EPICS.md#e02)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
