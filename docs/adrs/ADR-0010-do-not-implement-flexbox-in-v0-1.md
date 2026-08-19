# ADR-0010: Do not implement Flexbox in v0.1

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-046 through HUD-050

## Context

Flexbox/CSS layout semantics would dominate a simple HUD project's complexity.

## Decision

Implement fixed/auto/fill box measurement, absolute anchors, Stack, and fixed Grid only.

## Consequences

- Small predictable model.
- Covers core game HUD needs.
- Some complex menus need manual composition.

## Verification gate

Revisit through an optional Yoga adapter after public layout contracts stabilize.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
