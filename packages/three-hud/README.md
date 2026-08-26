# @scope/three-hud

Canvas-native retained HUD for Three.js 0.185.

The host owns the renderer, the animation loop, the game state, and the canvas size. The HUD draws after the game scene, then restores renderer state.

```ts
import { HUD, LinearBar, createHudOverlayAdapter } from "@scope/three-hud";
```

Experimental Windfoil text lives on `@scope/three-hud/text/windfoil`. It is native-WebGPU only.

Replace `@scope` before you publish. See [getting started](../../docs/api/GETTING_STARTED.md).
