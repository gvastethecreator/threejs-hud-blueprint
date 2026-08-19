---
id: HUD-040
title: "Implement Windfoil glyph atlas growth, reuse, updates, and memory diagnostics"
epic: E06
milestone: M2
type: task
priority: P1
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-033
  - HUD-039
labels:
  - "area:performance"
  - "area:text"
  - "backend:windfoil"
  - "epic:E06"
  - "milestone:M2"
  - "priority:P1"
  - "size:XL"
  - "type:task"
---

# HUD-040: Implement Windfoil glyph atlas growth, reuse, updates, and memory diagnostics

## Outcome

The analytic backend can add glyphs on demand, reuse repeated glyph data, update instance runs, and report bounded CPU/GPU atlas memory without rebuilding every font on each label change.

## Scope

- Define per-font glyph cache identity and prepared-glyph states.
- Implement atlas growth/chunk policy compatible with Three.js buffer updates.
- Separate static curve/row data from dynamic glyph instances.
- Handle removed runs and reusable instance capacity.
- Expose bytes, counts, high-water marks, upload timings, and evictions if enabled.

## Acceptance criteria

- [x] Updating `99` to `100` prepares only genuinely missing glyphs.
- [x] Repeated glyph IDs reference shared curve/row data.
- [x] Atlas growth does not invalidate unrelated font handles.
- [x] Allocation failure yields a diagnostic without corrupting existing text.
- [x] Dispose returns backend-owned memory counters to zero.

## Verification

- `pnpm run test -- windfoil-atlas`
- `pnpm run benchmark:windfoil-dynamic`

## Evidence to attach

- Attach atlas growth timeline and memory report.

## Out of scope

- Persistent disk atlas cache.
- Cross-renderer GPU resource sharing.
- Automatic full atlas compaction every frame.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E06](../../EPICS.md#e06)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
