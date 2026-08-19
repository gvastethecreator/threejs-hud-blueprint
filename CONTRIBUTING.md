# Contributing

## Before you start

1. Read `AGENTS.md`.
2. Read the active `HUD-###` ticket.
3. Make sure that blockers and out-of-scope items are clear.
4. Use the public contracts and the module direction in `docs/architecture/`.
5. If you change a durable architectural decision, open an ADR first.

## Pull requests

A pull request covers one ticket or one documented slice. Include:

- the ticket ID
- the outcome
- the affected contracts and modules
- tests and evidence
- performance and memory impact
- compatibility impact
- public API or documentation changes
- out-of-scope items that you left untouched

Run this command before you open the pull request:

```bash
pnpm run validate:fast
```

If the change touches renderer, text, layout, input, widgets, packaging, or a milestone, also run the focused evidence command for that area. Then run `pnpm run validate:full`.

## API changes

Before `v1`, a breaking change is allowed if it is intentional.

1. Update declaration snapshots.
2. Update `docs/architecture/PUBLIC_API.md`.
3. Record the migration path in `CHANGELOG.md`.
4. Do not export an implementation class only to skip a public contract.

## Third-party material

Do not add fonts, shaders, images, or adapted code without:

- source and author
- exact license
- redistribution status
- required notices
- provenance note
- approval in the license inventory

Do not put font files in this repository or in the default package.
