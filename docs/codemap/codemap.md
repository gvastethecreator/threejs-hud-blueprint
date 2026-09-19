# Code map: threejs-hud-blueprint

Generated: 2026-09-19T06:55:38Z | Commit: `433f5c42922a` | Schema: 2
Generation: `52605e54d3245b4ac4be01e28f21f31f4bf21a1ea45feb06eb43941a9ef2bec5`
Scope: . | Inventory: working-tree
Nodes: 245 | Edges: 1202 | Flows: 0

## Coverage

- Analysis: **partial**; 229 analyzed of 235 included files.
- Configuration files: 6; omitted untracked files: 0.
- Unresolved references and analysis limits: 368.
- Static references and call paths do not prove runtime execution or test coverage.

## Modules

- `apps/playground/package.json` | module | Playground | callers: none | callees: none | tests: 0 | entry: none
- `apps/playground/src/labs/capability.ts` | module | Playground | callers: none | callees: external:javascript:three | tests: 0 | entry: none
- `apps/playground/src/main.ts` | module | Playground | callers: none | callees: apps/playground/src/maze.ts, apps/playground/src/maze.ts, external:javascript:three | tests: 0 | entry: none
- `apps/playground/src/maze.ts` | module | Playground | callers: apps/playground/src/main.ts, apps/playground/src/main.ts | callees: external:javascript:three | tests: 0 | entry: none
- `apps/playground/tsconfig.json` | module | Playground | callers: none | callees: none | tests: 0 | entry: none
- `apps/playground/vite.config.ts` | module | Playground | callers: none | callees: external:javascript:node:path, external:javascript:node:url, external:javascript:node:url, external:javascript:vite | tests: 0 | entry: none
- `e2e/context-loss.spec.ts` | module | E2E | callers: none | callees: external:javascript:@playwright/test, external:javascript:@playwright/test | tests: 0 | entry: none
- `e2e/hud-improve.spec.ts` | module | E2E | callers: none | callees: external:javascript:@playwright/test, external:javascript:@playwright/test | tests: 0 | entry: none
- `e2e/input.spec.ts` | module | E2E | callers: none | callees: external:javascript:@playwright/test, external:javascript:@playwright/test | tests: 0 | entry: none
- `e2e/inventory.spec.ts` | module | E2E | callers: none | callees: external:javascript:@playwright/test, external:javascript:@playwright/test | tests: 0 | entry: none
- `e2e/labs.spec.ts` | module | E2E | callers: none | callees: external:javascript:@playwright/test, external:javascript:@playwright/test | tests: 0 | entry: none
- `e2e/overlay-state.spec.ts` | module | E2E | callers: none | callees: external:javascript:@playwright/test, external:javascript:@playwright/test | tests: 0 | entry: none
- `e2e/showcase.spec.ts` | module | E2E | callers: none | callees: external:javascript:@playwright/test, external:javascript:@playwright/test | tests: 0 | entry: none
- `e2e/smoke.spec.ts` | module | E2E | callers: none | callees: external:javascript:@playwright/test, external:javascript:@playwright/test | tests: 0 | entry: none
- `external:javascript:@playwright/test` | external | External | callers: e2e/context-loss.spec.ts, e2e/context-loss.spec.ts, e2e/hud-improve.spec.ts, e2e/hud-improve.spec.ts | callees: none | tests: 0 | entry: none
- `external:javascript:node:child_process` | external | External | callers: scripts/archive-release.mjs, scripts/archive-release.mjs, scripts/bundle-verify.mjs, scripts/bundle-verify.mjs | callees: none | tests: 1 | entry: none
- `external:javascript:node:fs` | external | External | callers: scripts/api-check.mjs, scripts/archive-release.mjs, scripts/assert-release-ready.mjs, scripts/benchmark-allocations.ts | callees: none | tests: 3 | entry: none
- `external:javascript:node:os` | external | External | callers: scripts/bundle-verify.mjs, scripts/test-external-consumer.mjs | callees: none | tests: 0 | entry: none
- `external:javascript:node:path` | external | External | callers: apps/playground/vite.config.ts, packages/three-hud/vite.lib.config.ts, packages/three-hud/vite.lib.config.ts, scripts/api-check.mjs | callees: none | tests: 3 | entry: none
- `external:javascript:node:url` | external | External | callers: apps/playground/vite.config.ts, apps/playground/vite.config.ts, scripts/archive-release.mjs, scripts/archive-release.mjs | callees: none | tests: 0 | entry: none
- Showing 20 of 245 nodes. Query `impact --module <path>` or open the HTML hierarchy for the rest.

## Edges

- `apps/playground/src/labs/capability.ts` -> `external:javascript:three` | imports
- `apps/playground/src/main.ts` -> `apps/playground/src/maze.ts` | calls
- `apps/playground/src/main.ts` -> `apps/playground/src/maze.ts` | imports
- `apps/playground/src/main.ts` -> `external:javascript:three` | imports
- `apps/playground/src/maze.ts` -> `external:javascript:three` | imports
- `apps/playground/vite.config.ts` -> `external:javascript:node:path` | imports
- `apps/playground/vite.config.ts` -> `external:javascript:node:url` | calls
- `apps/playground/vite.config.ts` -> `external:javascript:node:url` | imports
- `apps/playground/vite.config.ts` -> `external:javascript:vite` | calls
- `apps/playground/vite.config.ts` -> `external:javascript:vite` | imports
- `e2e/context-loss.spec.ts` -> `external:javascript:@playwright/test` | calls
- `e2e/context-loss.spec.ts` -> `external:javascript:@playwright/test` | imports
- `e2e/hud-improve.spec.ts` -> `external:javascript:@playwright/test` | calls
- `e2e/hud-improve.spec.ts` -> `external:javascript:@playwright/test` | imports
- `e2e/input.spec.ts` -> `external:javascript:@playwright/test` | calls
- `e2e/input.spec.ts` -> `external:javascript:@playwright/test` | imports
- `e2e/inventory.spec.ts` -> `external:javascript:@playwright/test` | calls
- `e2e/inventory.spec.ts` -> `external:javascript:@playwright/test` | imports
- `e2e/labs.spec.ts` -> `external:javascript:@playwright/test` | calls
- `e2e/labs.spec.ts` -> `external:javascript:@playwright/test` | imports
- `e2e/overlay-state.spec.ts` -> `external:javascript:@playwright/test` | calls
- `e2e/overlay-state.spec.ts` -> `external:javascript:@playwright/test` | imports
- `e2e/showcase.spec.ts` -> `external:javascript:@playwright/test` | calls
- `e2e/showcase.spec.ts` -> `external:javascript:@playwright/test` | imports
- `e2e/smoke.spec.ts` -> `external:javascript:@playwright/test` | calls
- `e2e/smoke.spec.ts` -> `external:javascript:@playwright/test` | imports
- `packages/three-hud/src/contracts/diagnostics.ts` -> `packages/three-hud/src/contracts/errors.ts` | imports (type only)
- `packages/three-hud/src/contracts/public-contracts.test.ts` -> `external:javascript:vitest` | calls
- `packages/three-hud/src/contracts/public-contracts.test.ts` -> `external:javascript:vitest` | imports
- `packages/three-hud/src/contracts/public-contracts.test.ts` -> `packages/three-hud/src/index.ts` | imports
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/contracts/diagnostics.ts` | calls
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/contracts/diagnostics.ts` | imports
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/contracts/diagnostics.ts` | imports (type only)
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/contracts/errors.ts` | imports
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/contracts/geometry.ts` | calls
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/contracts/geometry.ts` | imports
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/contracts/geometry.ts` | imports (type only)
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/core/HudLayer.ts` | imports
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/core/snapshot.ts` | calls
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/core/snapshot.ts` | imports
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/input/dispatcher.ts` | imports
- `packages/three-hud/src/core/HUD.ts` -> `packages/three-hud/src/render/contracts.ts` | imports (type only)
- `packages/three-hud/src/core/HudLayer.ts` -> `packages/three-hud/src/contracts/errors.ts` | imports
- `packages/three-hud/src/core/HudLayer.ts` -> `packages/three-hud/src/contracts/geometry.ts` | calls
- `packages/three-hud/src/core/HudLayer.ts` -> `packages/three-hud/src/contracts/geometry.ts` | imports
- `packages/three-hud/src/core/HudLayer.ts` -> `packages/three-hud/src/contracts/geometry.ts` | imports (type only)
- `packages/three-hud/src/core/HudLayer.ts` -> `packages/three-hud/src/core/DirtyFlags.ts` | imports
- `packages/three-hud/src/core/HudLayer.ts` -> `packages/three-hud/src/core/HUD.ts` | imports (type only)
- `packages/three-hud/src/core/HudLayer.ts` -> `packages/three-hud/src/core/HudNode.ts` | imports
- `packages/three-hud/src/core/HudNode.test.ts` -> `external:javascript:vitest` | calls
- Showing 50 of 1202 edges; JSON contains every edge and its evidence.

## Unknown

- `apps/playground/src/labs/capability.ts:1`: conditional-package-exports-not-resolved (@scope/three-hud)
- `apps/playground/src/main.ts:1`: conditional-package-exports-not-resolved (@scope/three-hud)
- `apps/playground/src/main.ts:22`: conditional-package-exports-not-resolved (@scope/three-hud/text/windfoil)
- `apps/playground/vite.config.ts:5`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:6`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:18`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:20`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:23`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:25`: object-member-call-not-resolved (path)
- `fixtures/external-consumer/src/index.ts:1`: conditional-package-exports-not-resolved (@scope/three-hud)
- `fixtures/external-consumer/src/index.ts:7`: conditional-package-exports-not-resolved (@scope/three-hud/text/bitmap)
- `fixtures/external-consumer/src/index.ts:8`: conditional-package-exports-not-resolved (@scope/three-hud/text/windfoil)

## Flows

- no source-backed call path from a recognized trigger

## Architecture changes

- Nodes: +0 / -0; edges: +0 / -0.
- Boundary changes: 0; new cycles: 0.

## Read next

- Use `status` before relying on this generation.
- Use `impact --changed` for possible impact and related test evidence.
- Use `diff --before <model> --after <model>` for architecture changes.
