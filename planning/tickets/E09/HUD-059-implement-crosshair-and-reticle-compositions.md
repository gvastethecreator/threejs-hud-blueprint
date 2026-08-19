---
id: HUD-059
title: "Implement Crosshair and reticle compositions"
epic: E09
milestone: M3
type: task
priority: P1
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-027
  - HUD-029
  - HUD-055
labels:
  - "area:reticle"
  - "area:widgets"
  - "epic:E09"
  - "milestone:M3"
  - "priority:P1"
  - "size:L"
  - "type:task"
---

# HUD-059: Implement Crosshair and reticle compositions

## Outcome

Games can construct center reticles with lines, dot, ring, brackets, spread, recoil offset, hit/target state, and native/pixel scaling without coupling to game-camera zoom.

## Scope

- Compose line, rect, and ring primitives.
- Define center anchor, gap, length, thickness, spread, rotation, recoil offset, and optional center dot/ring.
- Support host-driven state/style changes.
- Recommend native or dedicated layer behavior in docs.

## Acceptance criteria

- [ ] Crosshair remains centered across aspect and HUD zoom changes according to its selected layer policy.
- [ ] Spread/recoil updates affect transforms/instances only.
- [ ] One-pixel lines remain crisp when snapping is enabled.
- [ ] Target/hit state style changes do not create new materials per frame.

## Verification

- `pnpm run test -- crosshair`
- `pnpm run visual:widgets -- crosshair`

## Evidence to attach

- Attach spread/recoil sequence screenshots and allocation counts.

## Out of scope

- Ballistics.
- World target projection.
- Built-in hit confirmation timing.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E09](../../EPICS.md#e09)
- Milestone: [M3](../../MILESTONES.md#m3)

## Sync log

- Never synchronized.
