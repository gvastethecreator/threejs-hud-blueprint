---
id: HUD-002
title: "Establish source-of-truth documents and the agent operating guide"
epic: E00
milestone: M0
type: docs
priority: P0
size: M
status: planned
github_issue: pending
sync: pending
blocked_by:
  - HUD-001
labels:
  - "area:docs"
  - "epic:E00"
  - "milestone:M0"
  - "priority:P0"
  - "size:M"
  - "type:docs"
  - "type:governance"
---

# HUD-002: Establish source-of-truth documents and the agent operating guide

## Outcome

Every contributor and coding agent can determine which file owns product scope, architecture, decisions, execution status, evidence, and release truth without reading a giant append-only context document.

## Scope

- Create `AGENTS.md`, `CONTEXT.md`, `ROADMAP.md`, `docs/INDEX.md`, and the authority map.
- Keep `CONTEXT.md` glossary-and-constraints focused; changes and decisions belong in ADRs and changelog.
- Document the required context pass before architecture, renderer, text, widget, or release work.
- Define closeout requirements for focused and broad changes.

## Acceptance criteria

- [ ] The authority map names exactly one owner for each kind of truth.
- [ ] `AGENTS.md` includes setup, boundaries, focused verification, broad closeout, worktree safety, and license safety.
- [ ] No document claims that local ticket mirrors own GitHub open/closed state.
- [ ] `docs:check` detects missing linked authority files.

## Verification

- `pnpm run docs:check`
- `Manually follow every link from `docs/INDEX.md`.`

## Evidence to attach

- Store the generated documentation link report.

## Out of scope

- Writing end-user API tutorials.
- Maintaining a chronological implementation diary in `CONTEXT.md`.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E00](../../EPICS.md#e00)
- Milestone: [M0](../../MILESTONES.md#m0)

## Sync log

- Never synchronized.
