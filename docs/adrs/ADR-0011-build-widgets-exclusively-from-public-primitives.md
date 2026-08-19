# ADR-0011: Build widgets exclusively from public primitives

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-055 through HUD-062

## Context

Special widget renderers create inconsistent APIs and block reuse.

## Decision

Panel, bars, gauges, crosshair, inventory, and hotbar are compositions of retained layout, primitives, text, themes, and input.

## Consequences

- Uniform lifecycle/theming.
- Renderer remains small.
- May require improving a primitive first.

## Verification gate

A bypass requires a new ADR and reusable canonical capability.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
