---
id: HUD-003
title: "Define fast, full, and release quality command matrices"
epic: E00
milestone: M0
type: task
priority: P0
size: M
status: planned
github_issue: pending
sync: pending
blocked_by:
  - HUD-001
labels:
  - "area:quality"
  - "area:tooling"
  - "epic:E00"
  - "milestone:M0"
  - "priority:P0"
  - "size:M"
  - "type:task"
---

# HUD-003: Define fast, full, and release quality command matrices

## Outcome

The repository exposes predictable `validate:fast`, `validate:full`, and `validate:release` gates modelled on the strongest verification patterns in the reference projects, without inheriting their application-specific complexity.

## Scope

- Create root scripts for format, lint, typecheck, unit tests, boundaries, docs, visual tests, benchmarks, build, package checks, and release validation.
- Define which gate runs per ticket, pull request, milestone closeout, and release.
- Separate report commands from `--verify` budget commands where evidence is useful.
- Capture command output under ignored `artifacts/validation/` when requested.

## Acceptance criteria

- [ ] `validate:fast` avoids browser and package-install tests and is suitable for iteration.
- [ ] `validate:full` adds visual, benchmark-smoke, build, SSR import, and packed-consumer checks.
- [ ] `validate:release` adds compatibility, license/notices, package contents, provenance dry-run, and release-size budgets.
- [ ] Every ticket can name one focused command and one closeout gate.

## Verification

- `Run the command graph linter.`
- `Confirm that no root validation script recursively invokes itself.`

## Evidence to attach

- Commit a generated command dependency graph.

## Out of scope

- Guaranteeing CI duration before measurements exist.
- Adding unrelated app deployment workflows.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E00](../../EPICS.md#e00)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
