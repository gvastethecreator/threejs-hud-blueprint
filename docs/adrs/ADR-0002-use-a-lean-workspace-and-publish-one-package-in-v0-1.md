# ADR-0002: Use a lean workspace and publish one package in v0.1

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-001, HUD-067

## Context

Reference projects show the value of separate consumers and package gates, but publishing many adapter packages before real use would increase release and versioning complexity.

## Decision

Use pnpm workspace boundaries with one publishable `packages/three-hud`; expose optional backends through subpath exports.

## Consequences

- Playground/fixtures prove boundaries.
- One version and changelog in v0.1.
- Adapters can split later under measured criteria.

## Verification gate

Revisit when independent versioning, peer dependencies, bundle installation, or release cadence require a split.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
