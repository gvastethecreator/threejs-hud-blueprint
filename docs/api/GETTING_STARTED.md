# Getting started

Install the package with Three.js 0.185 as a peer:

```bash
pnpm add @scope/three-hud three@0.185.1
```

The host owns the renderer, the canvas layout, and the animation loop. Three HUD draws an overlay after the game scene. The imports below are public package exports.

```ts
import * as THREE from "three";
import {
  HUD,
  LinearBar,
  createHudOverlayAdapter,
  probeRendererCapabilities,
} from "@scope/three-hud";

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
const overlay = createHudOverlayAdapter({ renderer });
const hud = new HUD({
  referenceSize: { width: 1920, height: 1080 },
  rendererAdapter: overlay,
});
const layer = hud.createLayer({ id: "ui", scaleMode: "contain" });
const health = new LinearBar({ width: 320, height: 28, value: 80, label: "HP" });
health.setPosition(32, 32);
layer.add(health);
await hud.initialize();

const caps = await probeRendererCapabilities(renderer);
if (!caps.windfoil.supported) {
  // Keep SDF or bitmap. Do not import @scope/three-hud/text/windfoil on this device.
}

let frameId = 0;
function frame(dt: number): void {
  frameId = requestAnimationFrame(() => frame(1 / 60));
  health.setValue(80);
  const info = hud.update(dt);
  renderer.render(scene, camera);
  hud.render(info);
}
frameId = requestAnimationFrame(() => frame(1 / 60));

function shutdown(): void {
  cancelAnimationFrame(frameId);
  hud.dispose();
  renderer.dispose();
}
addEventListener("beforeunload", shutdown);
```

WebGPU is opt-in through the host `WebGPURenderer`. The main entry never selects Windfoil for you.

## Playground

Run this command:

```bash
pnpm --filter @three-hud/playground dev --host 127.0.0.1 --port 4174
```

Then open `http://127.0.0.1:4174/`. Add `/?webgpu=1` for the WebGPU renderer path.

The hosted demo is this playground at `https://gvastethecreator.github.io/threejs-hud-blueprint/` after GitHub Pages is enabled.

Playground keys:

- The maze walks a wireframe tour until you take over.
- Press `P` to pause or resume the tour.
- Press `W` `A` `S` `D` to move. Press `Q` `E` to turn. Hold `Shift` to sprint.
- Click the canvas to lock look. This also pauses the tour.
- Press `1` through `6` to activate a hotbar slot.
- Press `I` to invert the monochrome HUD. `T` is the torch hotbar mark, not invert.
- Press `F` to switch the `ui` font and the `pixel` font.

Start a black-and-white HUD with `createMonochromeTheme()`:

```ts
import { LinearBar, MONOCHROME_THEME, createMonochromeTheme, themeColor } from "@scope/three-hud";

const theme = MONOCHROME_THEME;
const ink = themeColor(theme, "text");
const track = themeColor(theme, "track");
const health = new LinearBar({
  width: 280,
  height: 20,
  value: 80,
  fill: track,
  label: "HP",
});
health.fillNode.fill = ink;

const inverted = createMonochromeTheme({ invert: true, font: "pixel", size: 14 });
```

See [widget recipes](WIDGETS.md) and [known limitations](KNOWN_LIMITATIONS.md).
