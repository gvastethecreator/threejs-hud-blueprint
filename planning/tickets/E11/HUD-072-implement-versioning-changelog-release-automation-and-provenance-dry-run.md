---
id: HUD-072
title: "Implement versioning, changelog, release automation, and provenance dry-run"
epic: E11
milestone: M4
type: release
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-005
  - HUD-067
  - HUD-068
  - HUD-069
  - HUD-070
  - HUD-071
labels:
  - "area:packaging"
  - "area:release"
  - "epic:E11"
  - "milestone:M4"
  - "priority:P0"
  - "size:L"
  - "type:release"
---

# HUD-072: Implement versioning, changelog, release automation, and provenance dry-run

## Outcome

Releases are produced from a clean, validated commit through a repeatable dry-run-first workflow with semver policy, generated changelog, package provenance, and rollback instructions.

## Scope

- Define pre-1.0 compatibility and deprecation policy.
- Choose changeset/manual changelog workflow and document it.
- Create release workflow with build, test, package, provenance, and publish gates.
- Add dry-run and local tarball inspection.
- Document rollback/yank/deprecation response.

## Acceptance criteria

- [ ] Publish job cannot run without `validate:release` success.
- [ ] Dry run outputs package version, files, integrity, notices, and planned tag.
- [ ] No secret is printed in logs.
- [ ] Experimental subpaths are identified in changelog and docs.
- [ ] Release workflow is permission-minimal and pinned according to repository policy.

## Verification

- `pnpm run release:dry-run`
- `Validate workflow syntax and permissions.`

## Evidence to attach

- Attach dry-run manifest and release checklist.

## Out of scope

- Publishing before the user configures npm credentials and scope.
- Automated major-version migration.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E11](../../EPICS.md#e11)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
