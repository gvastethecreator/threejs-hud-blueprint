---
id: HUD-039
title: "Implement the Windfoil analytic text adapter behind its approved exposure level"
epic: E06
milestone: M2
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-011
  - HUD-034
  - HUD-038
labels:
  - "area:text"
  - "backend:windfoil"
  - "epic:E06"
  - "milestone:M2"
  - "priority:P0"
  - "risk:high"
  - "size:XL"
  - "type:task"
---

# HUD-039: Implement the Windfoil analytic text adapter behind its approved exposure level

## Outcome

The approved Windfoil-derived implementation is available only through `@scope/three-hud/text/windfoil`, implements the canonical backend contract, and remains absent from the main bundle unless explicitly imported.

## Scope

- Promote the accepted preprocessing and rendering spike into typed modules.
- Preserve Apache-2.0 notices and provenance.
- Map canonical glyph runs, styles, clip, opacity, and transforms to analytic instances.
- Expose style controls only when evidence supports them.
- Return explicit capability diagnostics on non-WebGPU backends.

## Acceptance criteria

- [x] Importing the main package does not load Windfoil code, WGSL, parser, or notices at runtime.
- [x] The adapter passes shared conformance cases approved by its capability record.
- [x] The package export is marked experimental if the gate verdict requires it.
- [x] No private Three.js API is used.
- [x] The adapter can be disposed and reattached only according to its documented lifecycle.

## Verification

- `pnpm run test:text-windfoil`
- `pnpm run visual:windfoil`
- `pnpm run bundle:report`

## Evidence to attach

- Attach subpath bundle graph and conformance report.

## Risks

- Three.js node/shader APIs and the upstream algorithm can change.

## Out of scope

- WebGL translation.
- General SVG/path API.
- Patent warranty.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E06](../../EPICS.md#e06)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
