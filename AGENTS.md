# Agent Guide — Three HUD

This repository is a specification-first, vanilla Three.js HUD library workspace. The public package must remain framework-neutral, canvas-native, explicit about GPU/resource ownership, and usable without React, HTML-rendered controls, or a package-owned frame loop.

## Required context pass

Before broad work, read:

1. `CONTEXT.md`
2. `docs/product/PRODUCT_SPEC.md`
3. `docs/architecture/ARCHITECTURE.md`
4. `docs/architecture/MODULE_CONTRACTS.md`
5. the relevant ADRs
6. the active ticket brief under `planning/tickets/`

Before text work, also read:

- `docs/architecture/TEXT_SYSTEM.md`
- the selected backend spec
- `docs/operations/FONT_AND_LICENSE_POLICY.md`
- `docs/research/WINDFOIL_RESEARCH.md`

Before render or viewport work, also read:

- `docs/architecture/RENDER_PIPELINE.md`
- `docs/architecture/VIEWPORT_AND_SCALING.md`

Before release work, also read:

- `docs/quality/QUALITY_GATES.md`
- `docs/quality/COMPATIBILITY_MATRIX.md`
- `docs/operations/RELEASE_PROCESS.md`

## Sources of truth

- Product and v0.1 scope: `docs/product/PRODUCT_SPEC.md`.
- Requirements and ticket traceability: `docs/product/REQUIREMENTS.md`.
- System shape: `docs/architecture/`.
- Durable decisions: `docs/adrs/`.
- Construction program: `planning/`.
- GitHub Issues/Project: live status, dependencies, assignment, comments, and closure.
- Local `.scratch/three-hud/`: synchronized expanded evidence and handoff notes.
- Public TypeScript declarations: implemented API truth once code exists.
- Compatibility and performance claims: generated evidence only.

Do not turn `CONTEXT.md`, `ROADMAP.md`, or `planning/BACKLOG.md` into append-only implementation diaries.

## Hard boundaries

- Package code must never import playground, fixture, e2e, docs, planning, or `.scratch` code.
- The playground consumes declared package exports only; no deep source imports.
- Widgets may depend on primitives, layout, themes, input contracts, and canonical text contracts; they may not import Windfoil, SDF, or bitmap implementation modules.
- Text backends may not import widgets or input.
- Core contracts must not import Three.js or browser globals.
- The package must perform no browser work at module evaluation.
- The host owns renderer creation, animation loop, game state, and canvas layout.
- The HUD owns only resources explicitly created or transferred to it.
- Third-party fonts are never committed or redistributed without an approved per-font record.
- Do not copy third-party shader or renderer code outside its license and provenance process.

## Work protocol

1. Read the active ticket and its blockers.
2. Confirm the ticket's stated outcome and out-of-scope boundary.
3. Add or update a focused failing test/fixture when the work is behavioral.
4. Implement only through the approved module direction.
5. Run the focused verification listed by the ticket.
6. Run `pnpm run validate:fast` before a normal PR closeout.
7. Run `pnpm run validate:full` for cross-module, renderer, text-backend, or milestone work.
8. Run `pnpm run validate:release` only from release-candidate work.
9. Attach fresh evidence. Never claim a gate passed from old logs.
10. Update an ADR when the implementation changes a durable decision.

## Code rules

- TypeScript strict mode, exact optional properties, no unchecked indexed access.
- ESM only for v0.1.
- Prefer pure math/geometry/layout functions around stateful lifecycle shells.
- Use explicit handles and ownership instead of hidden global caches.
- Use dirty categories rather than rebuilding the whole tree.
- Keep steady-state frame work allocation-free where the contract promises it.
- Diagnostics must be machine-readable and privacy-safe by default.
- Unsupported capability must be reported; do not silently approximate a different feature.
- Public errors use stable codes and safe detail metadata.
- Experimental APIs must be isolated by subpath and documented as experimental.

## Command model

```bash
pnpm run validate:fast
pnpm run validate:full
pnpm run validate:release
pnpm run architecture:verify
pnpm run tickets:validate
pnpm run docs:check
```

Prefer focused tests during iteration. A broad change is not complete without fresh typecheck, unit, architecture, build, and relevant browser/backend evidence.

## Safety and worktree rules

- Preserve dirty changes that you did not create.
- Do not delete generated baselines, evidence, fonts, or fixture data to make a gate pass.
- Do not weaken budgets or visual thresholds without a linked decision and measured reason.
- Do not print credentials, full private text content, or machine-specific secrets into evidence.
- Do not publish or create remote GitHub resources unless the user explicitly requests the write.

## Agent skills

### Issue tracker

GitHub Issues and GitHub Project 15 hold live state. `.scratch/three-hud/` holds synchronized local mirrors. Seed briefs stay in `planning/tickets/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Category: `bug` or `enhancement`. Triage: `status:needs-triage`, `needs-info`, `status:ready`, `status:needs-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md`, `docs/adrs/`, and `docs/architecture/`. See `docs/agents/domain.md`.
