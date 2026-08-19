# Changelog

## 0.1.0

- Canvas-native Three.js HUD overlay with host-owned renderer and loop.
- Layout: two-pass box, absolute anchors, stack, grid.
- Input: pointer mapping, hit testing, capture, click.
- Widgets: panel, label, bars, gauge, crosshair, inventory, hotbar.
- Text backends on isolated experimental/compat subpaths: Windfoil (`@scope/three-hud/text/windfoil`, experimental native-WebGPU), SDF (`./text/sdf`), bitmap (`./text/bitmap`). The testing harness is `@scope/three-hud/testing` and is not a runtime HUD API.
- Quality gates: `validate:fast`, `validate:full`, `validate:release`.
- Known limitations and rollback: [KNOWN_LIMITATIONS.md](docs/api/KNOWN_LIMITATIONS.md).
