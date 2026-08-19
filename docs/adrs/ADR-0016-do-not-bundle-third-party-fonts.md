# ADR-0016: Do not bundle third-party fonts

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-032, HUD-070

## Context

Font sources have per-family/per-file licenses, and package users need their own visual identity.

## Decision

Ship no third-party font binary by default. Examples use host-supplied approved fixtures and per-font records.

## Consequences

- Smaller/legal-clean package.
- Getting-started must explain font assets.
- Synthetic/mock fixtures needed for tests.

## Verification gate

A future optional sample package requires a separate license review and ADR.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
