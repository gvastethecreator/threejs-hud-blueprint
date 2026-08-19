# ADR-0001: Use a retained semantic HUD tree

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-013, HUD-014

## Context

A canvas HUD needs persistent layout, hit testing, incremental updates, batching, and inspectable state. Using one Three.js Object3D per control would couple semantics to renderer objects and weaken batching.

## Decision

Use a lightweight retained `HudNode` tree separate from the small set of Three.js batch objects.

## Consequences

- Stable layout/input/debug model.
- Most nodes can batch.
- Requires explicit invalidation and resource mapping.

## Verification gate

Revisit only if measured complexity exceeds the benefits or a simpler immediate-mode facade can compile into the same retained internals.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
