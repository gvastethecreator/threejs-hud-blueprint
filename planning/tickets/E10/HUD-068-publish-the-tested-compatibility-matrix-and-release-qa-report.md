---
id: HUD-068
title: "Publish the tested compatibility matrix and release QA report"
epic: E10
milestone: M4
type: quality
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-006
  - HUD-041
  - HUD-043
  - HUD-045
  - HUD-064
  - HUD-065
  - HUD-066
  - HUD-067
labels:
  - "area:compatibility"
  - "area:release"
  - "epic:E10"
  - "milestone:M4"
  - "priority:P0"
  - "size:L"
  - "type:quality"
---

# HUD-068: Publish the tested compatibility matrix and release QA report

## Outcome

The release states exactly which Three.js version range, renderer/backend, browser profile, font format, text backend, and feature combinations were tested, supported, experimental, unsupported, or untested.

## Scope

- Generate matrix rows from capability records and executed evidence.
- Pin the initial Three.js development version and choose a narrow peer range.
- Separate WebGPURenderer identity from active WebGPU/WebGL2 backend.
- Include known limitations and fallback recommendations.
- Produce one release QA report linking every blocking gate.

## Acceptance criteria

- [x] No matrix cell says supported without a named passing scenario.
- [x] Experimental and untested are visually distinct from supported.
- [x] Font formats and complex-script limits are explicit.
- [x] The report records exact tool/browser/OS/GPU metadata without leaking secrets.
- [x] Release fails when a required evidence link is missing.

## Verification

- `pnpm run compatibility:report -- --verify`
- `pnpm run release:qa -- --verify`

## Evidence to attach

- Commit compatibility matrix and QA report.

## Out of scope

- Promising future browser support.
- Long-term support policy before real adoption.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E10](../../EPICS.md#e10)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
