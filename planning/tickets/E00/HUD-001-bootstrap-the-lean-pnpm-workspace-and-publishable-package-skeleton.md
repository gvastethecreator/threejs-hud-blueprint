---
id: HUD-001
title: "Bootstrap the lean pnpm workspace and publishable package skeleton"
epic: E00
milestone: M0
type: task
priority: P0
size: M
status: planned
github_issue: pending
sync: pending
blocked_by: []
labels:
  - "area:packaging"
  - "area:tooling"
  - "epic:E00"
  - "milestone:M0"
  - "priority:P0"
  - "size:M"
  - "type:task"
---

# HUD-001: Bootstrap the lean pnpm workspace and publishable package skeleton

## Outcome

A clone-ready pnpm workspace exists with one publishable `@scope/three-hud` package, one vanilla playground consumer, one packed external-consumer fixture, and no application-only dependencies in the library package.

## Scope

- Create root workspace, shared TypeScript configuration, package folders, playground, fixtures, scripts, docs, planning, and GitHub metadata.
- Configure `packages/three-hud` as ESM with `sideEffects: false`, generated declarations, and narrow subpath exports.
- Keep Three.js as a peer dependency and development dependency rather than bundling it.
- Use a placeholder npm scope that is explicitly marked for replacement before release.

## Acceptance criteria

- [ ] Root package is private and declares the pinned package manager.
- [ ] The public package includes only `dist`, license, README, and notices in its packed file list.
- [ ] The playground depends on the package by workspace name and does not deep-import package source.
- [ ] The external consumer is outside workspace resolution during its tarball test.
- [ ] No React dependency exists in the public package or vanilla playground.

## Verification

- `pnpm install` succeeds on the documented Node and pnpm baseline.
- `pnpm run workspace:check` verifies required roots and package metadata.
- `pnpm --filter @scope/three-hud pack --dry-run` lists only approved publication files.

## Evidence to attach

- Attach the packed-file manifest and the final workspace tree.

## Out of scope

- Choosing the final product name or npm organization.
- Implementing renderer or widget behavior.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E00](../../EPICS.md#e00)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
