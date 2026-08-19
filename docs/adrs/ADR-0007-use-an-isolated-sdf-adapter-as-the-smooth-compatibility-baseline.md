# ADR-0007: Use an isolated SDF adapter as the smooth compatibility baseline

Status: accepted

## Decision

v0.1 ships a first-party SDF _adapter contract_ on `@scope/three-hud/text/sdf`. It does **not** vendor Troika, msdf-atlas-gen, or another third-party renderer until a per-package license/provenance record exists.

The adapter:

- implements `TextBackend` against canonical `GlyphRun` values;
- targets WebGL as the compatibility baseline and declares WebGPU as encode-capable, not as a second raw GPU context;
- keeps optional future wrappers behind the same export.

## Consequences

- Widgets and `packages/three-hud/src/index.ts` must not import the SDF module.
- Shaping stays in `layoutText`; the adapter only encodes positioned glyphs.
- Visual quality of signed-distance edges is not a v0.1 release claim until a licensed rasterizer is recorded.
