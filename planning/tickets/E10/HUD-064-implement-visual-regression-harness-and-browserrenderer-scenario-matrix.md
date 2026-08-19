---
id: HUD-064
title: "Implement visual regression harness and browser/renderer scenario matrix"
epic: E10
milestone: M4
type: quality
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-031
  - HUD-038
  - HUD-045
  - HUD-050
  - HUD-054
  - HUD-062
labels:
  - "area:quality"
  - "area:visual"
  - "epic:E10"
  - "milestone:M4"
  - "priority:P0"
  - "size:XL"
  - "type:quality"
---

# HUD-064: Implement visual regression harness and browser/renderer scenario matrix

## Outcome

Visual output is captured through deterministic routes/configurations with approved baselines for WebGL, approved WebGPU modes, text backends, DPR, scale, clipping, and interaction states.

## Scope

- Create Playwright scenario routing and screenshot metadata.
- Stabilize fonts, time, random seeds, canvas size, DPR, and animation state.
- Store baseline groups by renderer/backend profile.
- Generate an HTML diff report with metrics and scenario config.
- Define baseline approval and platform-difference policy.

## Acceptance criteria

- [x] Each release-critical scenario identifies renderer, active backend, Three.js version, browser, DPR, and font fixture.
- [x] A missing required profile fails rather than silently skipping.
- [x] Experimental profiles may report without blocking only when policy says so.
- [x] Baselines contain no licensed font binary.
- [x] Diff thresholds are documented per scenario class.

## Verification

- `pnpm run visual:all -- --verify`

## Evidence to attach

- Commit generated report index and approved baseline manifest.

## Out of scope

- Cross-platform visual identity without platform-specific baselines.
- Manual-only visual QA.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E10](../../EPICS.md#e10)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
