# ADR-0003: Keep renderer, frame loop, and game state host-owned

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-007, HUD-016

## Context

Libraries that create loops or mutate host state are difficult to compose with games, post-processing, WebGPU initialization, and application lifecycle.

## Decision

The host supplies renderer and calls `resize`, `update`, `render`, and `dispose`. The HUD never owns gameplay state or a hidden loop.

## Consequences

- Predictable integration.
- Explicit async readiness.
- More responsibility in getting-started examples.

## Verification gate

Revisit only through optional adapters; core ownership does not change.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
