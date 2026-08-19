# Quality Gates

## Gate map

| Gate                    | Command                        | Authority                                 |
| ----------------------- | ------------------------------ | ----------------------------------------- |
| Workspace shape         | `pnpm run workspace:check`     | required roots and package metadata       |
| Ticket integrity        | `pnpm run tickets:validate`    | ticket IDs, fields, dependencies, DAG     |
| Documentation links     | `pnpm run docs:check`          | local relative links and referenced files |
| Architecture boundaries | `pnpm run architecture:verify` | forbidden imports and module direction    |
| Type contracts          | `pnpm run typecheck`           | TS project references and declarations    |
| Unit behavior           | `pnpm run test:unit`           | pure/runtime contract tests               |
| Browser behavior        | `pnpm run test:e2e`            | Playwright scenarios                      |
| Visual evidence         | `pnpm run visual:verify`       | deterministic scenario snapshots          |
| Performance             | `pnpm run perf:verify`         | budgets and statistical reports           |
| Resource lifecycle      | `pnpm run memory:verify`       | ownership ledger and repeated lifecycle   |
| SSR/import              | `pnpm run test:ssr-import`     | no module-scope browser work              |
| Packed consumer         | `pnpm run test:consumer`       | real tarball install and typecheck/build  |
| Package surface         | `pnpm run package:verify`      | exports, files, tree shaking, size        |
| Legal/fonts             | `pnpm run licenses:verify`     | notices and fixture provenance            |
| Release                 | `pnpm run validate:release`    | all supported claims                      |

## Gate implementation state

Workspace, ticket, docs, architecture, type, unit, build, package, visual, performance, and memory commands exist as named scripts. `validate:release` still fails while `release-status.json` has `releaseReady: false`. Do not treat a local ticket closeout as a published registry release.

## Closeout evidence schema

```json
{
  "schemaVersion": "three-hud/evidence/v0",
  "ticket": "HUD-000",
  "commit": "<sha>",
  "commands": [{ "command": "pnpm ...", "status": "pass", "artifact": "..." }],
  "environment": { "node": "...", "browser": "...", "renderer": "..." },
  "claimsAdded": [],
  "claimsBlocked": [],
  "notes": []
}
```
