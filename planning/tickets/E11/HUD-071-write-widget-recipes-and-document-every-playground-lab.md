---
id: HUD-071
title: "Write widget recipes and document every playground lab"
epic: E11
milestone: M4
type: docs
priority: P1
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-062
  - HUD-064
  - HUD-065
labels:
  - "area:docs"
  - "area:playground"
  - "epic:E11"
  - "milestone:M4"
  - "priority:P1"
  - "size:L"
  - "type:docs"
---

# HUD-071: Write widget recipes and document every playground lab

## Outcome

The showcase and labs become reusable recipes for bars, cooldowns, gauges, crosshairs, inventory, hotbars, themes, backend comparison, scaling, diagnostics, and performance profiling.

## Scope

- Document lab route/config IDs and expected outputs.
- Write focused recipes that use composition and host-controlled state.
- Explain which lab controls may use host DOM while the HUD output remains canvas-native.
- Link each recipe to relevant API, diagnostics, and performance notes.

## Acceptance criteria

- [ ] Every initial widget has at least one runnable recipe.
- [ ] Recipes do not duplicate internal implementation.
- [ ] Performance lab documents interpretation and environment caveats.
- [ ] Scaling and typography labs expose copyable configuration.
- [ ] Broken route/config links fail docs validation.

## Verification

- `pnpm run examples:verify`
- `pnpm run e2e -- labs`

## Evidence to attach

- Attach lab route manifest and recipe build report.

## Out of scope

- A complete game tutorial.
- A visual authoring editor.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E11](../../EPICS.md#e11)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
