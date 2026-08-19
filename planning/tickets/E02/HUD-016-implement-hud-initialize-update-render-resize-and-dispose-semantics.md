---
id: HUD-016
title: "Implement HUD initialize, update, render, resize, and dispose semantics"
epic: E02
milestone: M1
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-007
  - HUD-012
  - HUD-015
labels:
  - "area:core"
  - "area:lifecycle"
  - "epic:E02"
  - "milestone:M1"
  - "priority:P0"
  - "size:XL"
  - "type:task"
---

# HUD-016: Implement HUD initialize, update, render, resize, and dispose semantics

## Outcome

The host can explicitly initialize, resize, update, render, suspend, resume, and dispose the HUD with no hidden loop, global listener, or ambiguous async state.

## Scope

- Define lifecycle states and legal transitions.
- Allow async backend/font initialization without making steady-state update/render async.
- Separate logical update from draw encoding.
- Make resize host-driven; optional DOM adapters live outside core.
- Ensure partial initialization failures release already-created resources.

## Acceptance criteria

- [x] Calling render before readiness yields the documented diagnostic or no-op policy.
- [x] Repeated dispose is safe and does not double-destroy resources.
- [x] No callback publishes into a disposed or superseded HUD epoch.
- [x] Suspend stops update/render work without discarding resources.
- [x] Initialization and disposal are covered under success, cancellation, and failure paths.

## Verification

- `pnpm run test -- hud-lifecycle`
- `Run the lifecycle browser scenario.`

## Evidence to attach

- Attach lifecycle transition snapshots and resource counters.

## Out of scope

- Owning the game's clock.
- Automatically pausing when the tab is hidden.
- Recovering arbitrary host renderer destruction.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E02](../../EPICS.md#e02)
- Milestone: [M1](../../MILESTONES.md#m1)

## Sync log

- Never synchronized.
