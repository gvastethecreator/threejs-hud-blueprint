# Changelog

## Unreleased

- Toolchain pins: pnpm 11.22.0, Vitest 4.1.11, oxlint 1.79.0, oxfmt 0.64.0.
- Keep Three.js 0.185.1, TypeScript 7.0.2, Vite 8.2.1, and Playwright 1.62.1 (already latest stable).
- Skip Vitest 5 RC, pnpm 12 RC, TypeScript 7.1-dev, Playwright 1.63 alpha, and unpublished Three.js r186.

## 0.1.0

- Canvas-native Three.js HUD overlay with host-owned renderer and loop.
- Layout: two-pass box, absolute anchors, stack, grid.
- Input: pointer mapping, hit testing, capture, click.
- Widgets: panel, label, bars, gauge, crosshair, inventory, hotbar.
- Text backends on isolated experimental/compat subpaths: Windfoil (`@scope/three-hud/text/windfoil`, experimental native-WebGPU), SDF (`./text/sdf`), bitmap (`./text/bitmap`). The testing harness is `@scope/three-hud/testing` and is not a runtime HUD API.
- Quality gates: `validate:fast`, `validate:full`, `validate:release`.
- Known limitations and rollback: [KNOWN_LIMITATIONS.md](docs/api/KNOWN_LIMITATIONS.md).
