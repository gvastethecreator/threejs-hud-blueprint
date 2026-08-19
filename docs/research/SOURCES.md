# Sources and Provenance Ledger

Accessed on **2026-08-19** unless otherwise noted.

## User-owned architecture references

- `gvastethecreator/codex-studio` — agent guide, validation tiers, architecture audits, GitHub/local issue protocol.
- `gvastethecreator/shader-boy-mini` — pnpm workspace, contract packages, visual/performance gates, dependency policy.
- `gvastethecreator/threejs-mugen` — typed module contracts, executable boundary checker, ADR/evidence style.
- `gvastethecreator/waveform-component` — package/playground boundary, SSR import test, packed external consumer, renderer-independent contracts.
- `gvastethecreator/canvas-core` — compact Vite/Vitest/oxlint/oxfmt tooling baseline.

## Rendering and typography references

- Windfoil: <https://github.com/texel-org/windfoil>
- Three.js WebGPU renderer: <https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer>
- Three.js r185 capability probe notes: `docs/research/THREEJS_R185_RENDERER_CAPABILITY_PROBE.md` (from `three@0.185.1` sources)
- Three.js storage buffer attribute: <https://threejs.org/docs/#api/en/core/StorageBufferAttribute>
- Three.js TSL/WGSL function docs: <https://threejs.org/docs/#api/en/nodes/TSL>
- Departure Mono: <https://github.com/rektdeckard/departure-mono>
- Google Fonts licensing FAQ: <https://developers.google.com/fonts/faq>
- MEK Type: <https://www.mek.gallery/mektype>

## Source-use policy

- References are used to understand architecture, public APIs, documented behavior, and license terms.
- No third-party font binaries are included.
- No third-party implementation is copied into this blueprint.
- Any later adapted code must be reviewed file by file and reflected in `THIRD_PARTY_NOTICES.md`.
- Compatibility claims must cite the exact dependency version and executable evidence used for the release.
