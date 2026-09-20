# Playground

This app is a vanilla Vite host for `@scope/three-hud`. Import public package names only. Do not import package source paths.

## Run

```bash
pnpm --filter @three-hud/playground dev --host 127.0.0.1 --port 4174
```

Open `http://127.0.0.1:4174/`. Five views share one Three.js renderer and canvas:

- Playground: scene, live node selection, health position/width controls, damage, healing, and cooldown.
- Components: twelve specimens, category/search filters, and four state profiles.
- In game: maze navigation, equipment, minimap, inventory, and contextual feedback.
- Scale & type: a 640 × 360 reference, five scale modes, zoom, DPR, formats, and UI/pixel text.
- Render contracts: order, partial clipping, opacity, DPR, simulation time, and a bound checker texture.

The shell and inspector use HTML. All HUD visuals and specimens use public package nodes rendered by the Three.js overlay. No Canvas 2D HUD or DOM HUD overlay is used. Both palettes are monochrome. The supplied review archive is a design reference, not a source of runtime test results.

Export preset writes `three-hud-playground/v1` JSON. Import validates the schema and ranges before applying health, position, width, palette, and inventory. PNG captures the shared canvas. Contract export records the current queue and buffer settings; it does not certify pixel correctness or GPU timing.

Open `http://127.0.0.1:4174/?webgpu=1` for the WebGPU renderer path.

GitHub Pages serves this playground at `https://gvastethecreator.github.io/threejs-hud-blueprint/` after the repo is public and the Pages workflow can run. Set `PLAYGROUND_BASE=/threejs-hud-blueprint/` when you build for that URL.

## Controls

The canvas is the default workspace. Open **Controls** for node editing, state actions, appearance, and exports. Preset, renderer diagnostics, and help expand separately. Close the panel with its close button or Escape; values stay in place.

- The playground starts paused. Continue runs the maze tour. In game starts the simulation. Wireframe world changes the monochrome scene treatment.
- Press `P` to pause or resume the tour.
- Press `W` `A` `S` `D` to take over move. Press `Q` `E` to turn. Hold `Shift` to sprint.
- In game, click outside the interactive HUD to lock look. Escape releases it. HUD clicks select or activate their nodes.
- Press `B` to open the inventory and `Space` to pause. Gameplay keys do not run while editing inspector fields. Losing focus clears held keys.
- Press `1` through `6` to activate a hotbar slot.
- Press `I` to invert the monochrome HUD (black paper or white paper). `T` is the torch hotbar mark, not invert.
- Press `F` to switch the built-in filtered `ui` atlas and the `pixel` nearest 5×7 atlas. The type lab uses these same paths and does not claim external font shaping or Windfoil output.

The default HUD and catalog use the nearest-filtered 5×7 bitmap atlas. Font sizes follow 7-pixel steps (7, 14, 21, 28) and are quantized to whole device-pixel texels after viewport scaling and DPR. The type lab keeps an explicitly labeled filtered sample for comparison.

Use `MONOCHROME_THEME` from `@scope/three-hud` as the starter HUD skin.

`/?webgpu=1` uses WebGPURenderer. The HUD overlay reports `overlay-limited` and does not submit `ShaderMaterial`. Windfoil spike shaders and custom overlay shaders stay off.

## Note

Dev Vite maps the public package name `@scope/three-hud` to `packages/three-hud/src`. That alias is lab-only. Packed-consumer proof is `fixtures/external-consumer`, not this alias.
