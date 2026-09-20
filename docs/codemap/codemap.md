# Code map: threejs-hud-blueprint

Generated: 2026-09-19T22:14:13Z | Commit: `39414ab57500` | Schema: 2
Generation: `a1590932aba8e8a147fa68d774e40552293f884c6c71b2818437566667c4aade`
Scope: . | Inventory: working-tree
Nodes: 247 | Edges: 1210 | Flows: 0

## Coverage

- Analysis: **partial**; 231 analyzed of 237 included files.
- Configuration files: 6; omitted untracked files: 0.
- Unresolved references and analysis limits: 373.
- Static references and call paths do not prove runtime execution or test coverage.

## Modules

- `apps/playground/package.json` | module | Playground | callers: none | callees: none | tests: 0 | entry: none
- `apps/playground/src/labs/capability.ts` | module | Playground | callers: none | callees: external:javascript:three | tests: 0 | entry: none
- `apps/playground/src/labs/review.ts` | module | Playground | callers: apps/playground/src/main.ts, apps/playground/src/main.ts | callees: apps/playground/src/studio.ts | tests: 0 | entry: none
- `apps/playground/src/main.ts` | module | Playground | callers: none | callees: apps/playground/src/labs/review.ts, apps/playground/src/labs/review.ts, apps/playground/src/maze.ts, apps/playground/src/maze.ts | tests: 0 | entry: none
- `apps/playground/src/maze.ts` | module | Playground | callers: apps/playground/src/main.ts, apps/playground/src/main.ts | callees: external:javascript:three | tests: 0 | entry: none
- `apps/playground/src/studio.ts` | module | Playground | callers: apps/playground/src/labs/review.ts, apps/playground/src/main.ts, apps/playground/src/main.ts | callees: none | tests: 0 | entry: none
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
- Showing 20 of 247 nodes. Query `impact --module <path>` or open the HTML hierarchy for the rest.

## Edges

- `apps/playground/src/labs/capability.ts` -> `external:javascript:three` | imports
- `apps/playground/src/labs/review.ts` -> `apps/playground/src/studio.ts` | imports (type only)
- `apps/playground/src/main.ts` -> `apps/playground/src/labs/review.ts` | calls
- `apps/playground/src/main.ts` -> `apps/playground/src/labs/review.ts` | imports
- `apps/playground/src/main.ts` -> `apps/playground/src/maze.ts` | calls
- `apps/playground/src/main.ts` -> `apps/playground/src/maze.ts` | imports
- `apps/playground/src/main.ts` -> `apps/playground/src/studio.ts` | calls
- `apps/playground/src/main.ts` -> `apps/playground/src/studio.ts` | imports
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
- Showing 50 of 1210 edges; JSON contains every edge and its evidence.

## Unknown

- `apps/playground/src/labs/capability.ts:1`: conditional-package-exports-not-resolved (@scope/three-hud)
- `apps/playground/src/labs/review.ts:1`: conditional-package-exports-not-resolved (@scope/three-hud)
- `apps/playground/src/main.ts:3`: conditional-package-exports-not-resolved (@scope/three-hud)
- `apps/playground/src/main.ts:24`: conditional-package-exports-not-resolved (@scope/three-hud/text/windfoil)
- `apps/playground/vite.config.ts:5`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:6`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:27`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:29`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:32`: object-member-call-not-resolved (path)
- `apps/playground/vite.config.ts:34`: object-member-call-not-resolved (path)
- `e2e/input.spec.ts:30`: object-member-call-not-resolved (expect)
- `e2e/input.spec.ts:32`: object-member-call-not-resolved (expect)

## Flows

- no source-backed call path from a recognized trigger

## Architecture changes

- Nodes: +0 / -0; edges: +0 / -0.
- Boundary changes: 0; new cycles: 0.

## Read next

- Use `status` before relying on this generation.
- Use `impact --changed` for possible impact and related test evidence.
- Use `diff --before <model> --after <model>` for architecture changes.
