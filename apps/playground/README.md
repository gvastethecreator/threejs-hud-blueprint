# Playground

This app is a vanilla Vite host for `@scope/three-hud`. Import public package names only. Do not import package source paths.

## Run

```bash
pnpm --filter @three-hud/playground dev --host 127.0.0.1 --port 4174
```

Open `http://127.0.0.1:4174/`. You get a host 3D maze and a canvas HUD (bars, gauge, inventory, hotbar, labels).

Open `http://127.0.0.1:4174/?webgpu=1` for the WebGPU renderer path.

## Controls

- Click the canvas to lock look.
- Press `W` `A` `S` `D` to move. Press `Q` `E` to turn. Hold `Shift` to sprint.
- Press `1` through `6` to activate a hotbar slot.

## Note

Dev Vite maps the public package name to `packages/three-hud/src`. That alias is for local labs. Packed-consumer proof is `fixtures/external-consumer`, not this alias.
