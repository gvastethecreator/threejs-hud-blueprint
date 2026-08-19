---
id: HUD-052
title: "Implement pointer event propagation, hover/press/click, and capture"
epic: E08
milestone: M3
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-051
labels:
  - "area:events"
  - "area:input"
  - "epic:E08"
  - "milestone:M3"
  - "priority:P0"
  - "size:XL"
  - "type:task"
---

# HUD-052: Implement pointer event propagation, hover/press/click, and capture

## Outcome

Interactive nodes receive deterministic capture/target/bubble pointer events and state transitions, including pointer capture and cancellation, without owning application state.

## Scope

- Define pointerenter/leave/move/down/up/click/cancel event objects.
- Implement capture, target, and bubble phases with stop controls.
- Track hover and pressed target per pointer.
- Implement explicit pointer capture and release.
- Define click movement/time threshold inputs rather than hardcoding browser assumptions.

## Acceptance criteria

- [ ] Parent and child event order matches the documented phase contract.
- [ ] Pointer capture continues delivery outside bounds until release/cancel.
- [ ] Removing a captured node emits or records deterministic cancellation.
- [ ] Click fires only when the configured gesture contract is met.
- [ ] Event objects expose logical coordinates and source layer.

## Verification

- `pnpm run test -- pointer-events`
- `Run event-order browser scenario.`

## Evidence to attach

- Attach event trace fixtures.

## Out of scope

- Keyboard focus.
- Gamepad navigation.
- Drag-and-drop inventory semantics.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E08](../../EPICS.md#e08)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
