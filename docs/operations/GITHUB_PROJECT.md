# GitHub Issue and Project Operating Model

## Authority

Live tracker:

- Repository: `gvastethecreator/threejs-hud-blueprint`
- Project: [Three HUD](https://github.com/users/gvastethecreator/projects/15) (number `15`)
- Agent contract: `docs/agents/issue-tracker.md`

After repository initialization:

- GitHub Issues own open/closed state, assignees, comments, labels, native dependencies, and Project fields.
- `planning/tickets/` owns the v0.1 seed briefs. Do not import those 73 tickets as open Issues unless a later import is approved.
- `planning/ticket-index.json` and `planning/BACKLOG.md` are generated navigation surfaces.
- New work mirrors live under `.scratch/three-hud/issues/`.

Before synchronization, local ticket briefs are authoritative and use `github_issue: pending`.

## Recommended Project fields

| Field     | Values                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------- |
| Status    | Backlog, Ready, In Progress, Blocked, Review, Done                                                |
| Epic      | E00–E11                                                                                           |
| Milestone | M0–M5                                                                                             |
| Priority  | P0, P1, P2                                                                                        |
| Size      | XS, S, M, L, XL                                                                                   |
| Work type | spike, decision, task, docs, quality, release (custom field name `Work type`; `Type` is reserved) |
| Area      | renderer, core, viewport, rendering, typography, layout, input, widgets, quality, packaging, docs |

## Labels

Labels are generated from ticket metadata:

```text
epic:E00 … epic:E11
milestone:M0 … milestone:M5
priority:P0 … priority:P2
size:XS … size:XL
type:<type>
area:<area>
status:needs-triage | ready | blocked | needs-human
needs-info | spec | wayfinder:map
```

## Import flow

The v0.1 seed is closed locally. Do not run `--apply` on all 73 tickets unless a later import is approved.

1. Run `node scripts/validate-tickets.mjs`.
2. Run `node scripts/create-github-issues.mjs` for dry-run output.
3. If an import is approved, set `GITHUB_REPOSITORY=owner/repo` and run with `--apply`.
4. The script reuses stored issue URLs/numbers and must not create a duplicate after a partial failure.
5. Add issues to Project 15 and set fields.
6. Update local frontmatter and regenerate the index.

## Dependency policy

`blocked_by` is a DAG and is mirrored into native GitHub blocked-by relationships when available. A missing relationship does not change the local dependency graph; it is recorded as a synchronization failure.

## Ticket completion

A ticket reaches Done only when:

- acceptance criteria are satisfied;
- verification commands have fresh output;
- evidence is attached or linked;
- no out-of-scope claim is implied;
- affected ADR/API/compatibility docs are updated;
- GitHub and local status are synchronized.
