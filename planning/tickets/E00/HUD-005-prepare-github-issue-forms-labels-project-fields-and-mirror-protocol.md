---
id: HUD-005
title: "Prepare GitHub issue forms, labels, Project fields, and mirror protocol"
epic: E00
milestone: M0
type: task
priority: P1
size: M
status: planned
github_issue: pending
sync: pending
blocked_by:
  - HUD-002
  - HUD-003
labels:
  - "area:github"
  - "area:project"
  - "epic:E00"
  - "milestone:M0"
  - "priority:P1"
  - "size:M"
  - "type:task"
---

# HUD-005: Prepare GitHub issue forms, labels, Project fields, and mirror protocol

## Outcome

The complete local backlog can be created in GitHub without losing IDs, dependencies, acceptance criteria, or evidence expectations, while GitHub remains the authority for live state.

## Scope

- Create issue forms for task, spike, bug, and compatibility report.
- Define label taxonomy, milestones, Project fields, status workflow, and dependency conventions.
- Create a dry-run-first `gh` bootstrap script for labels and issues.
- Document the sync protocol between GitHub live state and local expanded briefs/evidence.
- Prevent duplicate issue creation after partial failure by persisting remote URLs.

## Acceptance criteria

- [ ] Every seeded issue title begins with its stable `HUD-###` ID.
- [ ] Generated issue bodies contain Outcome, Scope, Acceptance criteria, Verification, Evidence, and Out of scope.
- [ ] The import script performs no writes without an explicit `--apply` flag.
- [ ] A failed Project insertion never causes a second Issue to be created.
- [ ] The ticket validator detects unknown dependencies and duplicate IDs.

## Verification

- `pnpm run tickets:validate`
- `pnpm run github:issues -- --dry-run`

## Evidence to attach

- Attach dry-run output for all issue titles and labels.

## Out of scope

- Creating the actual remote repository or Project without an explicit user request.
- Synchronizing GitHub comments verbatim into local files.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E00](../../EPICS.md#e00)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
