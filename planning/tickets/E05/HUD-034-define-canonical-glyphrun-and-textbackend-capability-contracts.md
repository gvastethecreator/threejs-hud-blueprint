---
id: HUD-034
title: "Define canonical GlyphRun and TextBackend capability contracts"
epic: E05
milestone: M2
type: task
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-012
  - HUD-032
labels:
  - "area:api"
  - "area:text"
  - "epic:E05"
  - "milestone:M2"
  - "priority:P0"
  - "size:L"
  - "type:task"
---

# HUD-034: Define canonical GlyphRun and TextBackend capability contracts

## Outcome

Text layout produces backend-neutral glyph runs and each backend advertises precise rendering capabilities, supported renderer modes, limits, and rejection reasons.

## Scope

- Define glyph IDs, clusters, positions, advances, line records, bounds, direction, and font handle references.
- Define backend attach/prepare/create/update/encode/release/dispose lifecycle.
- Define capabilities for renderer backend, scaling, outlines, effects, dynamic glyphs, clipping, and pixel-perfect behavior.
- Keep shaping ownership outside concrete raster backends.

## Acceptance criteria

- [x] Widgets can use text without importing a backend module.
- [x] Backend selection can reject a font/style combination before creating a drawable.
- [x] Glyph runs are immutable snapshots or mutation-safe value objects.
- [x] Capabilities distinguish unavailable, unsupported, experimental, and ready.
- [x] Contract tests are shared by Windfoil, SDF, bitmap, and mock backends.

## Verification

- `pnpm run test -- text-backend-contract`
- `pnpm run architecture:verify`

## Evidence to attach

- Attach the capability comparison generated from backend fixtures.

## Out of scope

- Full shaping implementation.
- Backend-specific classes in the main public API.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E05](../../EPICS.md#e05)
- Milestone: [M2](../../MILESTONES.md#m2)

## Sync log

- Never synchronized.
