---
id: HUD-037
title: "Implement fallback fonts, missing-glyph policy, and text diagnostics"
epic: E05
milestone: M2
type: task
priority: P1
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-033
  - HUD-036
labels:
  - "area:diagnostics"
  - "area:text"
  - "epic:E05"
  - "milestone:M2"
  - "priority:P1"
  - "size:L"
  - "type:task"
---

# HUD-037: Implement fallback fonts, missing-glyph policy, and text diagnostics

## Outcome

Missing glyphs and unsupported scripts resolve through an explicit fallback chain or visible replacement policy, with diagnostics that identify the affected code points and capability boundary.

## Scope

- Define ordered fallback handles and replacement glyph behavior.
- Split runs when fallback face changes.
- Deduplicate repeated missing-glyph diagnostics.
- Expose missing-glyph counters and affected ranges without logging full private text by default.

## Acceptance criteria

- [x] A missing glyph never indexes invalid atlas data.
- [x] Fallback runs preserve line layout and cluster mapping.
- [x] Privacy-safe diagnostics omit full text unless debug detail is enabled.
- [x] Fallback cycles are detected.
- [x] Backend capability rejection can trigger another compatible backend only under documented `auto` policy.

## Verification

- `pnpm run test -- text-fallback diagnostics`

## Evidence to attach

- Attach fallback-chain fixture reports.

## Out of scope

- Automatic remote font discovery.
- Emoji color-font rendering.
- Universal Unicode fallback bundle.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E05](../../EPICS.md#e05)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
