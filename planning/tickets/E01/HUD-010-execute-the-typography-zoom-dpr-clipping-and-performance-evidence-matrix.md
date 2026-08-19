---
id: HUD-010
title: "Execute the typography zoom, DPR, clipping, and performance evidence matrix"
epic: E01
milestone: M0
type: spike
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-009
labels:
  - "area:quality"
  - "area:text"
  - "backend:windfoil"
  - "epic:E01"
  - "milestone:M0"
  - "priority:P0"
  - "size:L"
  - "type:spike"
---

# HUD-010: Execute the typography zoom, DPR, clipping, and performance evidence matrix

## Outcome

The risky analytic backend is evaluated under the actual HUD conditions that matter: tiny text, extreme zoom, fractional transforms, multiple DPR values, nested clipping, color blending, and dynamic glyph changes.

## Scope

- Define fixed test strings covering straight edges, curves, counters, punctuation, accents, repeated glyphs, and blank glyphs.
- Capture at DPR 1, 1.25, 1.5, 2, and 3 where the environment supports them.
- Capture design zoom from 0.25× to 16× and at least one minification stress case.
- Test pixel snapping off/on, fractional translation, opacity, and clip intersections.
- Compare against the selected SDF baseline without treating visual difference alone as failure.

## Acceptance criteria

- [x] Every scenario has a stable ID, configuration JSON, screenshot, and metric record.
- [x] Known artifacts are classified rather than silently accepted.
- [x] The report separates cold preprocessing/upload from warm-frame cost.
- [x] The matrix includes at least one low-glyph dynamic counter and one 2,000-glyph static panel.
- [x] No test depends on a proprietary or unredistributable font.

## Verification

- `pnpm run visual:windfoil`
- `pnpm run benchmark:windfoil -- --verify`

## Evidence to attach

- Commit the generated matrix report, not raw font binaries.

## Out of scope

- Claiming universal browser or GPU quality from one machine.
- Benchmarking unrelated Three.js scene complexity.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E01](../../EPICS.md#e01)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- 2026-08-19: matrix JSON + vitest/benchmark:windfoil --verify.
