# Getting started

Install the package with Three.js 0.185 as a peer:

```bash
pnpm add @scope/three-hud three@0.185.1
```

The host owns the renderer and animation loop. Three HUD only draws an overlay after the game scene.

```ts
import * as THREE from "three";
import { HUD, LinearBar, createHudOverlayAdapter } from "@scope/three-hud";

const renderer = new THREE.WebGLRenderer({ antialias: true });
const overlay = createHudOverlayAdapter({ renderer });
const hud = new HUD({
  referenceSize: { width: 1920, height: 1080 },
  rendererAdapter: overlay,
});
const layer = hud.createLayer({ id: "ui", scaleMode: "contain" });
const health = new LinearBar({ width: 320, height: 28, value: 80 });
health.setPosition(32, 32);
layer.add(health);
await hud.initialize();

function frame(dt: number): void {
  health.setValue(80);
  const info = hud.update(dt);
  renderer.render(scene, camera);
  hud.render(info);
  requestAnimationFrame(() => frame(1 / 60));
}
```

Windfoil, SDF, and bitmap text backends stay on explicit subpaths. The main entry never auto-selects Windfoil.

Playground: `pnpm --filter @three-hud/playground dev --host 127.0.0.1 --port 4174`
