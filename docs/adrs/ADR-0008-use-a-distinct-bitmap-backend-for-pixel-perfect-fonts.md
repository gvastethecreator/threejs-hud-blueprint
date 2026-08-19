# ADR-0008: Use a distinct bitmap backend for pixel-perfect fonts

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-044, HUD-045

## Context

Pixel fonts should not be forced through continuous antialiasing and fractional scale.

## Decision

Use manifest/runtime-rasterized bitmap glyphs, nearest filtering, native-size metadata, integer layer policy, and physical-pixel snapping.

## Consequences

- Honest crispness guarantees.
- Requires appropriate low reference resolution.
- Same outline can still choose smooth mode.

## Verification gate

Revisit atlas page/format limits after real fonts and icons are measured.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
