---
id: HUD-038
title: "Create the shared text-backend conformance and dirty-update harness"
epic: E05
milestone: M2
type: quality
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-014
  - HUD-034
  - HUD-035
  - HUD-036
  - HUD-037
labels:
  - "area:quality"
  - "area:text"
  - "epic:E05"
  - "milestone:M2"
  - "priority:P0"
  - "size:L"
  - "type:quality"
---

# HUD-038: Create the shared text-backend conformance and dirty-update harness

## Outcome

Every backend runs the same contract suite for font preparation, glyph runs, update categories, clipping, opacity, resource ownership, failures, and disposal.

## Scope

- Create a mock backend and backend test adapter interface.
- Define conformance cases for create, text change, paint-only change, layout change, font change, visibility, clipping, and teardown.
- Record backend-specific skips only when a capability declares them.
- Assert no widget-specific behavior inside backend tests.

## Acceptance criteria

- [x] A backend cannot pass by silently ignoring an unsupported required operation.
- [x] Paint-only updates avoid glyph re-layout where capabilities allow.
- [x] All prepared resources are released in the disposal case.
- [x] The same canonical glyph-run fixtures feed each backend.
- [x] Conformance output is machine-readable.

## Verification

- `pnpm run test:text-backends`

## Evidence to attach

- Commit generated conformance report JSON.

## Out of scope

- Pixel-perfect visual equivalence between fundamentally different raster methods.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E05](../../EPICS.md#e05)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
