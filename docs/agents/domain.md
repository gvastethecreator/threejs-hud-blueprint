# Domain docs

How engineering skills consume this repo's domain docs when exploring.

## Before exploring, read these

- `CONTEXT.md` at the repo root. Glossary and v0.1 constraints only.
- `docs/product/PRODUCT_SPEC.md` for product scope.
- `docs/adrs/` for durable decisions that touch the area.
- `docs/architecture/` for system shape. CONTRIBUTING names this as the public module direction.
- The GitHub issue for the work, if one exists.

If a listed file does not exist, proceed from the files that do exist.

## Public vs local

- Public product and API docs: `docs/product/`, `docs/api/`, `README.md`, `SECURITY.md`, `CONTRIBUTING.md`.
- Public architecture and ADRs: `docs/architecture/`, `docs/adrs/`.
- Live GitHub state is in Issues and Project 15.
- New tickets never go under `docs/`. Local mirrors: `.scratch/three-hud/issues/`.
- Operator spikes and audits: `.scratch/architecture/`.
- Hygiene leftovers: `.scratch/archive/`.

`docs/adr/` is not used. The live decision log is `docs/adrs/`.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/adrs/
├── docs/architecture/
├── docs/product/
└── packages/three-hud/src/
```

## Use the glossary's vocabulary

When output names a domain concept, use the `CONTEXT.md` term. Do not drift to synonyms the glossary avoids.

If the concept is missing from the glossary: inventing language the project does not use (reconsider), or a real gap (note it).

## Flag ADR conflicts

If output contradicts an existing ADR, surface it. Do not silently override it.
