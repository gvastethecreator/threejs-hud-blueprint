# Planning workspace

## Authority

- `docs/product/PRODUCT_SPEC.md` owns product intent and v0.1 scope.
- `docs/product/REQUIREMENTS.md` owns requirement IDs and traceability.
- `docs/architecture/` plus accepted ADRs own system shape and decisions.
- `planning/tickets/` contains expanded seed briefs and durable evidence expectations.
- GitHub Issues and the linked GitHub Project own live state once the backlog is imported.
- Local synchronized mirrors belong under ignored `.scratch/three-hud/issues/`; do not duplicate full comment histories.

## Workflow

1. Validate seeds with `pnpm run tickets:validate`.
2. Review `BACKLOG.md`, `EPICS.md`, and `MILESTONES.md`.
3. Dry-run issue creation with `pnpm run github:issues -- --dry-run`.
4. Apply only after configuring the remote repository and Project.
5. Persist created issue URLs so a partial failure cannot create duplicates.
6. Store focused evidence in the issue and durable local handoff notes in `.scratch/`.

`ticket-index.json` and the HTML explorer are generated; edit ticket files or the generator data, not generated views.
