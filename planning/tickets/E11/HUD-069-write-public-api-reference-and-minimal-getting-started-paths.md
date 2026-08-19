---
id: HUD-069
title: "Write public API reference and minimal getting-started paths"
epic: E11
milestone: M4
type: docs
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-012
  - HUD-016
  - HUD-023
  - HUD-025
  - HUD-034
  - HUD-055
labels:
  - "area:api"
  - "area:docs"
  - "epic:E11"
  - "milestone:M4"
  - "priority:P0"
  - "size:L"
  - "type:docs"
---

# HUD-069: Write public API reference and minimal getting-started paths

## Outcome

A vanilla Three.js user can install the package, create a HUD, register a font/backend, add a layer and widget, resize, update, render, and dispose it without reading source code.

## Scope

- Document installation, peer dependency, renderer initialization, host loop integration, resize, font registration, layer creation, widget usage, diagnostics, and disposal.
- Provide WebGL baseline and approved WebGPU examples.
- Generate API pages from declarations where practical, with curated conceptual guidance.
- Keep examples executable in the external consumer.

## Acceptance criteria

- [x] Every getting-started import exists in the packed export map.
- [x] Examples include complete cleanup.
- [x] No example uses deep imports or HTML/CSS for the HUD itself.
- [x] Unsupported Windfoil conditions show capability handling.
- [x] Docs build/check links every public symbol included in examples.

## Verification

- `pnpm run docs:check`
- `pnpm run examples:verify`
- `pnpm run test:consumer`

## Evidence to attach

- Attach example build log and link report.

## Out of scope

- A full documentation website design.
- React examples in v0.1 core docs.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E11](../../EPICS.md#e11)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
