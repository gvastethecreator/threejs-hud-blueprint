# ADR-0004: Use logical reference coordinates and independent layer scale policies

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-018 through HUD-023

## Context

Continuous UI, pixel UI, and reticles have incompatible scaling needs. Binding authored positions to framebuffer pixels makes resize and capture brittle.

## Decision

Each `HudLayer` owns reference size, scale mode, safe frame, zoom, DPR transform, and pixel policy.

## Consequences

- Smooth and pixel layers coexist.
- Coordinate transforms become a shared authority.
- Layer configuration is more explicit.

## Verification gate

Revisit scale modes only with visual/input evidence.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
