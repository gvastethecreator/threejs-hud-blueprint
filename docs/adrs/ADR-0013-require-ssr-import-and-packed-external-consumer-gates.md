# ADR-0013: Require SSR import and packed external-consumer gates

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-001, HUD-067, HUD-073

## Context

A library can pass inside a workspace while publishing broken exports, declarations, peers, or import-time browser work.

## Decision

Pack the actual tarball, install it outside workspace resolution, run Node import, TypeScript consumer, browser build, and package-file checks.

## Consequences

- Publication integrity is executable.
- Release pipeline is slower.
- Catches accidental optional backend inclusion.

## Verification gate

Durable package rule.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
