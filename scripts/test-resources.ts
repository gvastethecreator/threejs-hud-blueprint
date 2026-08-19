import { HUD } from "../packages/three-hud/src/core/HUD.ts";
import {
  createMockRenderer,
  createMockTextBackend,
} from "../packages/three-hud/src/testing/mocks.ts";

const hud = new HUD({ referenceSize: { width: 64, height: 64 } });
await hud.initialize();
hud.dispose();
hud.dispose();
const renderer = createMockRenderer();
renderer.dispose();
const backend = createMockTextBackend();
backend.dispose();
console.log("test:resources passed");
