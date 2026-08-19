---
id: HUD-032
title: "Define FontSource, FontMetadata, pixel policy, and license records"
epic: E05
milestone: M2
type: task
priority: P0
size: M
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-006
  - HUD-012
labels:
  - "area:fonts"
  - "area:legal"
  - "area:text"
  - "epic:E05"
  - "milestone:M2"
  - "priority:P0"
  - "size:M"
  - "type:task"
---

# HUD-032: Define FontSource, FontMetadata, pixel policy, and license records

## Outcome

Fonts enter the library through one explicit, non-CSS resource contract that supports URL, ArrayBuffer, typed bytes, preprocessed assets, pixel metadata, and per-font license/provenance records.

## Scope

- Define supported source variants and cache identity rules.
- Define family, style, weight, stretch, units-per-em, pixel-native size, allowed scales, fallback, and backend preferences.
- Add optional license identifier, source, author, notice, and redistribution permission metadata.
- Do not make Google Fonts or any gallery a privileged runtime dependency.

## Acceptance criteria

- [x] Equivalent byte sources can share a caller-provided cache key.
- [x] Pixel fonts can request crisp bitmap mode or smooth outline mode explicitly.
- [x] Departure Mono's 11-pixel recommendation can be represented without hardcoding that font.
- [x] A redistribution build can enumerate every bundled font license.
- [x] No font binary is included in the package by default.

## Verification

- `pnpm run test -- font-contracts`
- `pnpm run licenses:fonts -- --verify`

## Evidence to attach

- Attach example metadata records using placeholder fixture names.

## Out of scope

- A universal font license validator.
- Downloading Google Fonts CSS at runtime.
- Bundling sample commercial fonts.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E05](../../EPICS.md#e05)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
