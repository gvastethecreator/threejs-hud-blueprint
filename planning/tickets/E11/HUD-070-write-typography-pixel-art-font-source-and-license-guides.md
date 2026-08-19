---
id: HUD-070
title: "Write typography, pixel-art, font-source, and license guides"
epic: E11
milestone: M4
type: docs
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-032
  - HUD-037
  - HUD-039
  - HUD-042
  - HUD-044
  - HUD-045
  - HUD-068
labels:
  - "area:docs"
  - "area:legal"
  - "area:text"
  - "epic:E11"
  - "milestone:M4"
  - "priority:P0"
  - "size:L"
  - "type:docs"
---

# HUD-070: Write typography, pixel-art, font-source, and license guides

## Outcome

Users understand when to choose analytic, SDF, bitmap, or auto mode; how to self-host Google Fonts or other licensed fonts; and why pixel-perfect presentation requires native-size and integer-scale discipline.

## Scope

- Document backend trade-offs and actual compatibility.
- Document TTF/OTF baseline, Google Fonts repository/self-host workflow, URL/CORS considerations, and unsupported formats.
- Document pixel metadata, native sizes, nearest filtering, integer layers, and smooth-outline alternative.
- Document Departure Mono as an external example without bundling it.
- Document per-font license review for MEK and other galleries.

## Acceptance criteria

- [x] Guide never implies all fonts from a gallery share one license.
- [x] No downloadable font binary is included.
- [x] Windfoil legal caution and Apache notice obligations remain visible.
- [x] Pixel guide includes a failure/troubleshooting matrix.
- [x] Every backend claim matches the generated compatibility matrix.

## Verification

- `pnpm run docs:check`
- `pnpm run licenses:verify`

## Evidence to attach

- Attach source/license inventory report.

## Out of scope

- Legal advice.
- Redistributing third-party fonts.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E11](../../EPICS.md#e11)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
