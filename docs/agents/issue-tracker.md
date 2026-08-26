# Project tracker: GitHub plus local mirrors

GitHub Issues and the linked GitHub Project hold live work state. Local Markdown files hold synchronized briefs, decisions, evidence, and handoffs.

## Identity

- Repository: `gvastethecreator/threejs-hud-blueprint`
- Project owner: `gvastethecreator`
- Project number: `15`
- Project title: `Three HUD`
- Project URL: `https://github.com/users/gvastethecreator/projects/15`
- Local root: `.scratch/three-hud/`

## Authority

- GitHub owns open or closed state, assignees, comments, native dependencies, labels, and Project field values.
- `planning/tickets/` owns the v0.1 seed briefs. Do not recreate those 73 tickets as open GitHub Issues unless a later import is approved.
- `.scratch/three-hud/` owns expanded evidence, handoff notes, and mirrors for work created after tracker setup.
- Shared fields must match: title, category, triage state, execution state, source, dependencies, acceptance criteria, and outcome.
- Do not copy the full GitHub comment history into local files. Add durable decisions and proof to `## Sync log`.

## Local layout

- Spec pointer: `.scratch/three-hud/spec.md`
- Ticket mirrors: `.scratch/three-hud/issues/<NN>-<slug>.md`. Never under `docs/`.
- Rejected requests: `.scratch/three-hud/out-of-scope/<concept>.md`.
- Execution state: `.scratch/planning/`.
- Wayfinding mirrors: `.scratch/wayfinder/<effort-slug>/`.
- Hygiene archive: `.scratch/archive/<YYYY-MM-DD>-<slug>/`.

Each mirrored ticket starts with these fields:

```markdown
# <NN>: <title>

GitHub issue: <url-or-pending>
GitHub project: https://github.com/users/gvastethecreator/projects/15
Sync: pending | synced | conflict
Last synced: <ISO-8601-or-never>
Remote updated: <ISO-8601-or-unknown>
Category: bug | enhancement
Status: needs-triage | needs-info | ready-for-agent | ready-for-human | wontfix
Project status: Backlog | Ready | In Progress | Blocked | Review | Done
Execution: queued | active | blocked | finished
Type: AFK | HITL
Source: <spec path, issue URL, or conversation>
Blocked by: <GitHub issue numbers or None>
```

## Sync protocol

1. Read the Issue, Project item, and local mirror before a mutation.
2. If both surfaces changed after `Last synced`, set `Sync: conflict` and stop.
3. Write the local draft with `Sync: pending` before remote creation.
4. Create or update the GitHub Issue. Use native parent and blocking relationships when available.
5. Add the Issue to Project `15` under `gvastethecreator`.
6. Set the Project `Status` field to the configured value.
7. Update the local identifiers, shared fields, timestamps, and `Sync: synced`.
8. If a step fails, record the failed step under `## Sync log`. Retry from the stored Issue URL.

Never create a second Issue because Project insertion, field editing, or local patching failed.

## Fallback

If GitHub is unavailable, keep the local file and set `Sync: pending`. Record the failed step. Do not invent a remote URL.

## Duplicate prevention

Before create, search open and closed Issues by title and ticket ID. If a URL already exists in frontmatter, reuse it. Partial failure is not a create retry.

## GitHub commands

Use exact identities from this document.

```powershell
gh issue view <number> -R gvastethecreator/threejs-hud-blueprint --json number,title,state,body,labels,assignees,comments,updatedAt,url
gh project view 15 --owner gvastethecreator --format json
gh project field-list 15 --owner gvastethecreator --format json
gh project item-list 15 --owner gvastethecreator --limit 200 --format json --field Status
gh project item-add 15 --owner gvastethecreator --url <issue-url>
gh project item-edit 15 --owner gvastethecreator --url <issue-url> --field Status --value <configured-value>
gh issue create -R gvastethecreator/threejs-hud-blueprint --title <title> --body-file <path> --parent <parent-number> --blocked-by <number,number>
gh issue edit <issue-number> -R gvastethecreator/threejs-hud-blueprint --parent <parent-number> --add-blocked-by <number>
```

Omit `--parent` or `--blocked-by` when that relationship does not apply. If the installed CLI lacks these flags, write the relationships in the body and record the fallback.

## Project fields

Reuse the built-in `Status` and `Milestone` fields. Do not create a second Status field.

| Field | Kind | Values |
| --- | --- | --- |
| Status | built-in single-select | Backlog, Ready, In Progress, Blocked, Review, Done |
| Milestone | built-in repo milestone | GitHub milestones `M0` through `M5` |
| Epic | custom single-select | E00–E11 |
| Priority | custom single-select | P0, P1, P2 |
| Size | custom single-select | XS, S, M, L, XL |
| Work type | custom single-select | decision, docs, quality, release, spike, task |
| Ticket ID | custom text | `HUD-###` |
| Evidence | custom text | path or URL |

GitHub rejects a custom field named `Type`. Use `Work type`.

## Triage and implementation

- Triage changes update one category label, one triage label, and their local fields.
- Starting implementation assigns the Issue, sets Project status to `In Progress`, and sets local `Execution:` to `active`.
- Verified completion posts proof, closes the Issue, sets Project status to `Done`, and sets local `Execution:` to `finished`.
- A blocker keeps the Issue open. Record the blocker on GitHub and set Project status to `Blocked`.

## Wayfinding operations

- Create the map as a GitHub Issue with `wayfinder:map`. Mirror it at `.scratch/wayfinder/<effort-slug>/map.md`.
- Create decision tickets as native sub-issues. Mirror them under `.scratch/wayfinder/<effort-slug>/tickets/`.
- Use native blocked-by relationships. Mirror the same Issue numbers in `Blocked by:`.
- Claim a ticket with an assignee, `In Progress`, and local `Execution: active`.
- Resolve a ticket with a GitHub comment and close, `Done`, and a local `## Answer` plus sync log.
