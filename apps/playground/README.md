# Playground

This app is a vanilla Vite host for `@scope/three-hud`. Import public package names only. Do not import package source paths.

## Run

```bash
pnpm --filter @three-hud/playground dev --host 127.0.0.1 --port 4174
```

Open `http://127.0.0.1:4174/`. You get a host 3D maze and a canvas HUD (bars, gauge, inventory, hotbar, labels).

Open `http://127.0.0.1:4174/?webgpu=1` for the WebGPU renderer path.

## Controls

- The maze starts in a black-and-white wireframe tour. It walks the open cells on its own.
- Press `P` to pause or resume the tour.
- Press `W` `A` `S` `D` to take over move. Press `Q` `E` to turn. Hold `Shift` to sprint.
- Click the canvas to lock look. This also pauses the tour. The hint and status name this before lock.
- Press `1` through `6` to activate a hotbar slot.
- Press `I` to invert the monochrome HUD (black paper or white paper). `T` is the torch hotbar mark, not invert.
- Press `F` to switch the `ui` (SDF) font and the `pixel` (nearest 5×7) font.

Use `MONOCHROME_THEME` from `@scope/three-hud` as the starter HUD skin.

`/?webgpu=1` uses WebGPURenderer. The HUD overlay reports `overlay-limited` and does not submit `ShaderMaterial`. Windfoil spike shaders and custom overlay shaders stay off.

## Note

Dev Vite maps the public package name `@scope/three-hud` to `packages/three-hud/src`. That alias is lab-only. Packed-consumer proof is `fixtures/external-consumer`, not this alias.
