# ADR-0005: Use canonical GlyphRun records and pluggable text backends

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-034, HUD-038

## Context

Windfoil, SDF, and bitmap have different raster pipelines, but widgets should not own backend-specific layout or classes.

## Decision

Common font/layout code produces canonical glyph runs. Backends prepare/encode glyphs behind capability and lifecycle contracts.

## Consequences

- Backend replacement remains possible.
- Complex shaping can be added later.
- Adapters must accurately map or declare layout seams.

## Verification gate

Revisit after the SDF selection spike if canonical-run integration is impossible; do not leak third-party classes.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
