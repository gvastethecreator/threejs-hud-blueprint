---
id: HUD-036
title: "Implement basic LTR shaping, kerning, multiline layout, wrapping, and alignment"
epic: E05
milestone: M2
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-033
  - HUD-034
  - HUD-035
labels:
  - "area:layout"
  - "area:text"
  - "epic:E05"
  - "milestone:M2"
  - "priority:P0"
  - "size:XL"
  - "type:task"
---

# HUD-036: Implement basic LTR shaping, kerning, multiline layout, wrapping, and alignment

## Outcome

The built-in v0.1 text layout engine produces canonical glyph runs for common left-to-right UI text with kerning, explicit lines, wrapping, horizontal alignment, and deterministic metrics.

## Scope

- Map Unicode code points through the registered face adapter.
- Apply font advances and pair kerning.
- Implement newline handling, word/character wrap policy, line height, max lines, and overflow diagnostics.
- Implement left, center, and right line alignment.
- Preserve clusters so a future shaper can replace this stage.

## Acceptance criteria

- [x] Measure and layout agree on final bounds.
- [x] Spaces advance without requiring glyph outline data.
- [x] Wrapping never loops on a word wider than the constraint.
- [x] Empty strings and trailing newlines have documented metrics.
- [x] Unsupported complex shaping is diagnosed rather than rendered with a false correctness claim.

## Verification

- `pnpm run test -- basic-text-layout`

## Evidence to attach

- Commit glyph-run fixtures for counters, paragraphs, accents, whitespace, and overflow.

## Out of scope

- Arabic joining.
- Bidirectional reordering.
- Indic shaping.
- Ligature authoring beyond parser-provided basic substitutions.
- Text on path.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E05](../../EPICS.md#e05)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
