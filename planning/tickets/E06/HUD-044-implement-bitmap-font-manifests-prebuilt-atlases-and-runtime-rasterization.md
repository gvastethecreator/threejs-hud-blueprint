---
id: HUD-044
title: "Implement bitmap-font manifests, prebuilt atlases, and runtime rasterization"
epic: E06
milestone: M2
type: task
priority: P0
size: XL
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-032
  - HUD-033
  - HUD-034
  - HUD-038
labels:
  - "area:pixel"
  - "area:text"
  - "backend:bitmap"
  - "epic:E06"
  - "milestone:M2"
  - "priority:P0"
  - "size:XL"
  - "type:task"
---

# HUD-044: Implement bitmap-font manifests, prebuilt atlases, and runtime rasterization

## Outcome

Pixel-oriented fonts can render through a compact bitmap backend using either a licensed prebuilt atlas or a runtime-rasterized approved font at a declared native pixel size.

## Scope

- Define manifest version, texture pages, glyph rectangles, bearings, advance, kerning, line metrics, source hash, native size, and license record.
- Load prebuilt atlas images through explicit resource ownership.
- Provide an optional browser runtime rasterizer that produces the same manifest shape.
- Use canonical glyph runs and image batches.
- Keep rasterization out of module scope and outside SSR import.

## Acceptance criteria

- [x] A manifest validates before any GPU allocation.
- [x] Runtime and prebuilt paths produce compatible metrics for the same fixture.
- [x] Blank glyphs and missing glyphs behave consistently.
- [x] Multiple atlas pages are either supported or explicitly capped in v0.1.
- [x] No font is redistributed by the package.

## Verification

- `pnpm run test:text-bitmap`
- `pnpm run bitmap:manifest -- --verify`

## Evidence to attach

- Attach generated manifest and hash report using non-font synthetic fixtures.

## Out of scope

- Signed-distance bitmap generation.
- Color emoji atlases.
- A font-editor UI.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E06](../../EPICS.md#e06)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
