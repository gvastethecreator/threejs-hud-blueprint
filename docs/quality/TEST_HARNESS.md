# Unit-test harness

Helpers live on `@scope/three-hud/testing`. They are not part of the main package export.

| Helper                                             | Contract                                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `DeterministicClock`                               | Injected time. `tick(ms)` returns delta seconds for `HUD.update`. Pointer tests pass `clock.nowMs()` as `time`. |
| `createHudFixture`                                 | HUD + clock + mock renderer adapter. No real GPU.                                                               |
| `createMockRenderer` / `createMockRendererAdapter` | Double-dispose throws `RESOURCE_DISPOSED`. Does not read `navigator.gpu`.                                       |
| `createMockTextBackend`                            | `prepare`/`update`/`dispose` after dispose throw.                                                               |
| `createMockResource`                               | `owned` disposes once; `borrowed` dispose always throws `INVALID_STATE`.                                        |
| `createMockViewport`                               | Pure size handle. Double-dispose throws.                                                                        |
| `createIdFactory`                                  | Deterministic ids (`prefix-1`, `prefix-2`, …).                                                                  |

Coverage is collected only from `packages/three-hud/src`. Playground files must not appear in `coverage/package`. Thresholds cover critical contracts; they are not a line-count chase.
