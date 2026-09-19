# Changelog

## Unreleased

- Toolchain pins: pnpm 12.0.0, Vitest 5.0.0, Vite 8.2.2, oxlint 1.80.0, oxfmt 0.65.0.
- Keep Three.js 0.185.1, TypeScript 7.0.2, and Playwright 1.62.1.
- Skip TypeScript 7.1-dev, Playwright 1.63 alpha, and unpublished Three.js r186.
- GitHub Pages deploys the playground demo (`PLAYGROUND_BASE=/threejs-hud-blueprint/`).

## 0.1.0

- Canvas-native Three.js HUD overlay with host-owned renderer and loop.
- Layout: two-pass box, absolute anchors, stack, grid.
- Input: pointer mapping, hit testing, capture, click.
- Widgets: panel, label, bars, gauge, crosshair, inventory, hotbar.
- Text backends on isolated experimental/compat subpaths: Windfoil (`@scope/three-hud/text/windfoil`, experimental native-WebGPU), SDF (`./text/sdf`), bitmap (`./text/bitmap`). The testing harness is `@scope/three-hud/testing` and is not a runtime HUD API.
- Quality gates: `validate:fast`, `validate:full`, `validate:release`.
- Known limitations and rollback: [KNOWN_LIMITATIONS.md](docs/api/KNOWN_LIMITATIONS.md).
