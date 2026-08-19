# ADR-0012: Make resource ownership and disposal explicit

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-016, HUD-028, HUD-033, HUD-066

## Context

Three.js textures/materials/buffers, font caches, workers, and async loads can leak or be double-disposed without clear owners.

## Decision

Every resource is owned, borrowed, or shared-owned. Async generations suppress stale publication. Dispose is idempotent and measured.

## Consequences

- Reliable integration/tests.
- More verbose resource records.
- Enables device/context-loss behavior.

## Verification gate

Ownership categories are durable; specific cache strategies may evolve.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
