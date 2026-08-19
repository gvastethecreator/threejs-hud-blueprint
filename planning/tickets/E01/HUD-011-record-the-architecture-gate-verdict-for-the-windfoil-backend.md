---
id: HUD-011
title: "Record the architecture gate verdict for the Windfoil backend"
epic: E01
milestone: M0
type: decision
priority: P0
size: S
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-006
  - HUD-007
  - HUD-008
  - HUD-009
  - HUD-010
labels:
  - "area:architecture"
  - "backend:windfoil"
  - "epic:E01"
  - "milestone:M0"
  - "priority:P0"
  - "size:S"
  - "type:decision"
---

# HUD-011: Record the architecture gate verdict for the Windfoil backend

## Outcome

An ADR records one bounded verdict—production candidate, experimental adapter, or blocked research—based on evidence rather than enthusiasm, and the rest of the roadmap is adjusted accordingly.

## Scope

- Summarize public API stability, visual findings, performance, memory, device-loss behavior, legal caution, and maintenance risk.
- Choose the v0.1 exposure level and fallback behavior.
- Record conditions that would trigger re-evaluation.
- Update compatibility, package exports, tickets, and user-facing claims to match the verdict.

## Acceptance criteria

- [x] The decision names the exact supported renderer/backend combination.
- [x] A blocked or experimental verdict does not block SDF/bitmap delivery.
- [x] The main package never auto-selects a backend that the verdict does not approve.
- [x] Open risks and deferred work are linked to explicit future backlog items.

## Verification

- `Review ADR links and run `pnpm run docs:check`.`

## Evidence to attach

- Link all spike reports used by the decision.

## Out of scope

- Resolving the upstream algorithm's patent status.
- Committing to long-term API compatibility before v1.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E01](../../EPICS.md#e01)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
