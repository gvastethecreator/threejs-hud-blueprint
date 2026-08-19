---
id: HUD-006
title: "Implement a renderer capability probe and compatibility report"
epic: E01
milestone: M0
type: spike
priority: P0
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-001
labels:
  - "area:renderer"
  - "backend:webgl"
  - "backend:webgpu"
  - "epic:E01"
  - "milestone:M0"
  - "priority:P0"
  - "size:M"
  - "type:spike"
---

# HUD-006: Implement a renderer capability probe and compatibility report

## Outcome

The library can distinguish WebGLRenderer, WebGPURenderer on a WebGPU backend, and WebGPURenderer on its WebGL2 fallback before selecting text or shape features.

## Scope

- Define a serializable capability report with renderer kind, active backend, storage-buffer support, native WGSL support, instancing, derivatives, texture limits, and DPR.
- Initialize WebGPURenderer before capability resolution when required.
- Avoid relying solely on `isWebGPURenderer`, because it may target a WebGL2 fallback.
- Expose explicit unsupported reasons rather than boolean-only failure.

## Acceptance criteria

- [x] A forced WebGL2 WebGPURenderer does not advertise Windfoil support.
- [x] An uninitialized renderer produces an actionable pending state rather than a false production claim.
- [x] The report can be logged as JSON without renderer objects or circular references.
- [x] Unit tests cover mocked WebGL, native WebGPU, fallback, and unavailable states.

## Verification

- `pnpm run test -- renderer-capabilities`
- `Capture capability reports from the browser lab.`

## Evidence to attach

- Store JSON reports for each tested renderer mode.

## Risks

- Three.js backend feature names may change across releases.

## Out of scope

- Browser support marketing claims.
- Selecting the final Three.js peer range.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E01](../../EPICS.md#e01)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
- 2026-08-19: local implementation closed with unit, validate:fast, SSR import, packed-entry consumer, and playground browser reports. GitHub issue remains pending (HUD-005 dry-run).
