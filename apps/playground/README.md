# Playground

A vanilla Vite consumer of `@scope/three-hud`. It must import only public package exports.

`pnpm --filter @three-hud/playground dev --host 127.0.0.1 --port 4174` shows a host 3D scene plus the HUD-007 overlay pass (translucent panel and textured badge). Open `/?webgpu=1` for the WebGPURenderer lab.
