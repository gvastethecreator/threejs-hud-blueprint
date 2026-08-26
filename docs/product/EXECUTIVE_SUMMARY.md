# Executive summary

Three HUD is a retained-mode, canvas-native HUD library for vanilla Three.js. It does not turn each control into HTML or CSS. It does not require React.

The package solves five problems:

1. **Stable design coordinates.** You author in 1920×1080 or another logical size. The HUD then scales to the viewport.
2. **Layers with different policies.** Smooth UI, pixel UI, and native reticles can share one tree.
3. **Swappable text.** Windfoil, SDF, and bitmap implement one contract. Widgets do not know the backend.
4. **Game vocabulary.** Bars, rings, gauges, crosshairs, slots, inventories, and hotbars.
5. **A publishable package.** SSR-safe import, tree-shaking, a packed external consumer, and visual plus performance evidence.

## Main decision

The workspace is small. v0.1 publishes one package. Text backends use subpath exports:

```text
@scope/three-hud
@scope/three-hud/text/windfoil
@scope/three-hud/text/sdf
@scope/three-hud/text/bitmap
```

The playground and fixtures live outside the package so the public API is the only consumer path.

## Windfoil

Windfoil is the highest-risk text path. It ships as an experimental adapter on native WebGPU. If that gate fails, SDF and bitmap still carry the product.

## In v0.1

- retained-mode tree and explicit lifecycle
- layers and reference resolution
- `contain`, `cover`, `native`, `stretch`, `integer`
- primitives, basic LTR text, layout, input, and themes
- Panel, Label, IconLabel, LinearBar, RadialBar, Gauge, Crosshair, Slot, InventoryGrid, and Hotbar
- diagnostics, visual regression, benchmarks, and package gates

## Out of v0.1

- full CSS or Flexbox
- React as a requirement
- world-space UI and XR
- keyboard, gamepad, and accessible focus
- IME and text fields
- complex shaping and full bidi
- drag and drop, a visual editor, or a package-owned animator
- fonts inside the npm package

## Current status

v0.1 code exists in this workspace. HUD-073 is closed locally. npm publish is blocked: the name is still `@scope/three-hud`, and registry auth is missing.

The next work is a quality review of the v0.1 implementation against acceptance criteria and evidence. Then replace `@scope` and run `pnpm run validate:release`.

## How work is organized

Live status belongs in GitHub Issues and [Project 15](https://github.com/users/gvastethecreator/projects/15). Architecture decisions live in `docs/adrs/`.
