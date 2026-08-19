# ADR-0015: Start with a narrow tested Three.js peer range

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-068

## Context

WebGPU/node/renderer APIs evolve and broad semver ranges can imply compatibility that was never tested.

## Decision

Pin development to one release and publish a narrow evidence-backed peer range for v0.1.

## Consequences

- Honest compatibility.
- Frequent upgrades may require releases.
- Adapter-localized churn.

## Verification gate

Widen only when matrix evidence covers the range.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
