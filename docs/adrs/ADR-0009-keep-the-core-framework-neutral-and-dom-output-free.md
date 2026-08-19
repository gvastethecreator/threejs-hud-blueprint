# ADR-0009: Keep the core framework-neutral and DOM-output-free

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-001, HUD-062, HUD-067

## Context

The user wants canvas-native HUDs and vanilla Three.js integration. React/DOM requirements would narrow adoption and hide package side effects.

## Decision

No React runtime/peer in v0.1. HUD visuals are Three.js canvas output. DOM is used only by explicit host adapters/lab controls.

## Consequences

- Vanilla-first package.
- SSR-safe imports.
- React adapter can exist later without changing core.

## Verification gate

Core policy is durable; optional adapter may be added post-v0.1.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
