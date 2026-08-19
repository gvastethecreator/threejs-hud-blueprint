---
id: HUD-008
title: "Port Windfoil font extraction and row-band preprocessing into an isolated TypeScript spike"
epic: E01
milestone: M0
type: spike
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-001
labels:
  - "area:research"
  - "area:text"
  - "backend:windfoil"
  - "epic:E01"
  - "milestone:M0"
  - "priority:P0"
  - "size:L"
  - "type:spike"
---

# HUD-008: Port Windfoil font extraction and row-band preprocessing into an isolated TypeScript spike

## Outcome

A clean, typed preprocessing spike can convert permitted TTF/OTF glyph outlines into deduplicated quadratic segments and row-band data without copying application plumbing from Windfoil.

## Scope

- Document provenance and Apache-2.0 obligations before adapting code.
- Load font bytes from `ArrayBuffer` through a parser adapter.
- Normalize line, quadratic, and cubic outline commands into quadratic segments.
- Build deterministic per-glyph bounds, advances, kerning access, and row-band tables.
- Serialize the result for fixtures and benchmark repeatability.

## Acceptance criteria

- [x] The same glyph input produces byte-identical atlas metadata across runs.
- [x] Blank glyphs remain measurable without allocating outline data.
- [x] Cubic-outline handling has fixture coverage and an explicit approximation policy.
- [x] Malformed or unsupported fonts fail through typed diagnostics.
- [x] No font file is committed to the public package without an approved license record.

## Verification

- `pnpm run test -- windfoil-preprocess`
- `Compare a small approved fixture corpus against recorded metadata hashes.`

## Evidence to attach

- Attach atlas statistics: glyph count, curve count, row bytes, preprocessing time.

## Risks

- The upstream algorithm includes a patent/novelty caution that must remain visible in legal documentation.

## Out of scope

- Complex-script shaping.
- Variable-font axis interpolation.
- Production cache eviction.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E01](../../EPICS.md#e01)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
