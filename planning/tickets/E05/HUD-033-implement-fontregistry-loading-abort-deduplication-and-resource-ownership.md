---
id: HUD-033
title: "Implement FontRegistry loading, abort, deduplication, and resource ownership"
epic: E05
milestone: M2
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-016
  - HUD-032
labels:
  - "area:resources"
  - "area:text"
  - "epic:E05"
  - "milestone:M2"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-033: Implement FontRegistry loading, abort, deduplication, and resource ownership

## Outcome

Fonts load once per canonical key, expose stable handles and state snapshots, support cancellation/stale-result suppression, and release backend resources according to explicit ownership.

## Scope

- Implement register, preload, resolve, get state, unregister, and dispose.
- Deduplicate concurrent requests.
- Use generation/epoch checks to ignore stale async completion.
- Separate parsed face data from backend-specific prepared resources.
- Allow borrowed preprocessed resources without taking ownership unless declared.

## Acceptance criteria

- [x] Two concurrent registrations of the same key perform one load.
- [x] Abort leaves no partially published font handle.
- [x] Late completion after unregister/dispose cannot repopulate the registry.
- [x] Backend resources release only after the last owning handle is gone.
- [x] State changes are observable without exposing mutable internal maps.

## Verification

- `pnpm run test -- font-registry`

## Evidence to attach

- Attach lifecycle event traces for success, dedupe, abort, stale, and dispose.

## Out of scope

- Network retry policy.
- Persistent IndexedDB font cache.
- Automatic system-font lookup.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E05](../../EPICS.md#e05)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
