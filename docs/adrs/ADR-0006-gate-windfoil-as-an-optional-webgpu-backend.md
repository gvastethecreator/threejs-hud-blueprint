# ADR-0006: Gate Windfoil as an optional WebGPU backend

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-006 through HUD-011
- **Verdict:** experimental adapter

## Context

Windfoil is promising but its Three.js integration, minification behavior, performance, legal caution, and public API stability must be proven.

## Decision

v0.1 exposes Windfoil only as an **experimental adapter** on `@scope/three-hud/text/windfoil`.

Exact supported combination:

- Three.js `0.185.x`
- `WebGPURenderer` with an initialized **native WebGPU** backend
- storage buffers and native WGSL available

WebGLRenderer and WebGPURenderer-on-WebGL2 must not advertise Windfoil. The main package entry never auto-selects Windfoil. SDF and bitmap delivery are independent and are not blocked.

Re-evaluate toward production only after HUD-039–HUD-041 (runtime adapter, atlas, device-loss) and HUD-068 (compatibility matrix) pass on more than one GPU. Re-evaluate toward blocked if a private Three.js patch becomes required.

Open risks: upstream patent/novelty caution; simplified coverage shader in the HUD-009 spike; minification-risk class in the HUD-010 matrix.

## Consequences

- Core release is not blocked by analytic text.
- No silent WebGL fallback claim.
- Hosts must import the subpath and inspect capability reports.

## Verification gate

HUD-011 records this verdict. Evidence: HUD-006 reports, HUD-007 overlay, HUD-008 preprocess, HUD-009 spike tests, HUD-010 matrix JSON.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- This ADR does not resolve upstream patent status.
