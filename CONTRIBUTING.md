# Contributing

## Before opening work

- Read `AGENTS.md` and the active `HUD-###` ticket.
- Confirm blockers and out-of-scope boundaries.
- Use the existing public contracts and module direction.
- Open an ADR before changing a durable architectural decision.

## Pull requests

A PR should represent one coherent ticket or one explicitly documented bounded slice. Include:

- linked ticket ID;
- outcome achieved;
- affected contracts/modules;
- tests and evidence;
- performance/memory impact;
- compatibility impact;
- public API or documentation changes;
- out-of-scope items left untouched.

Run at minimum:

```bash
pnpm run validate:fast
```

Renderer, text, layout, input, widget-showcase, package, or milestone changes require the corresponding focused browser/evidence gate and usually `validate:full`.

## API changes

Before `v1`, breaking changes are possible but must still be intentional:

- update declaration snapshots;
- update `docs/architecture/PUBLIC_API.md`;
- record migration guidance in the changelog;
- do not expose implementation classes merely to avoid writing a proper contract.

## Third-party material

Do not add fonts, shaders, images, or adapted code without:

- source and author;
- exact license;
- redistribution status;
- required notices;
- provenance note;
- approval in the license inventory.

No font files belong in this blueprint or its default package.
