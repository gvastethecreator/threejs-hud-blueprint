# @scope/three-hud

Canvas-native retained HUD for Three.js 0.185. The host owns the renderer, animation loop, game state, and canvas size. The HUD draws after the game scene and restores renderer state.

```ts
import { HUD, LinearBar, createHudOverlayAdapter } from "@scope/three-hud";
```

Experimental Windfoil text lives on `@scope/three-hud/text/windfoil` and is native-WebGPU only.

Replace `@scope` before publication. See [getting started](../../docs/api/GETTING_STARTED.md).
