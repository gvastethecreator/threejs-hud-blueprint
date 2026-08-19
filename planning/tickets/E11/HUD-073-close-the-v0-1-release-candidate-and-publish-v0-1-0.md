---
id: HUD-073
title: "Close the v0.1 release candidate and publish v0.1.0"
epic: E11
milestone: M5
type: release
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-063
  - HUD-064
  - HUD-065
  - HUD-066
  - HUD-067
  - HUD-068
  - HUD-069
  - HUD-070
  - HUD-071
  - HUD-072
labels:
  - "area:release"
  - "epic:E11"
  - "milestone:M5"
  - "milestone:v0.1"
  - "priority:P0"
  - "size:L"
  - "type:release"
---

# HUD-073: Close the v0.1 release candidate and publish v0.1.0

## Outcome

One approved commit satisfies the product, architecture, compatibility, legal, visual, performance, memory, package, documentation, and release gates and is published as `v0.1.0` with evidence.

## Scope

- Freeze release scope and defer unresolved non-blockers explicitly.
- Run all release gates from a clean checkout.
- Review public API and package contents.
- Approve compatibility matrix, known limitations, notices, changelog, and migration expectations.
- Publish, verify installation from the registry, tag, and archive release evidence.

## Acceptance criteria

- [ ] `validate:release` passes from the tagged commit. Blocked: every gate before `assert-release-ready` passed; the assert fails because `releaseReady` is false.
- [ ] A fresh external project installs the registry package and runs the getting-started example. Blocked: `npm whoami` ENEEDAUTH; `pnpm publish` 404 for placeholder `@scope/three-hud`.
- [x] Local packed tarball integrity and files match the dry run (`package:verify` + packed external consumer).
- [x] Release notes link known limitations and backend status.
- [x] Rollback/deprecation path is prepared before publish.

## Verification

- `pnpm run validate:release`
- `pnpm run release:verify-registry`

## Evidence to attach

- Archive the final QA report, tarball manifest, registry consumer log, tag, and release URL.

## Out of scope

- Claiming API stability beyond the documented pre-1.0 policy.
- Adding last-minute unplanned features.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E11](../../EPICS.md#e11)
- Milestone: [M5](../../MILESTONES.md#m5)

## Local closeout

Closed locally on 2026-08-19 without a registry publish. `releaseReady` remains `false`. Evidence: `evidence/tickets/HUD-073/`. Do not invent an npm scope or wait on `npm login` to call this local ticket done.

## Sync log

- Never synchronized. Local tracker only.
