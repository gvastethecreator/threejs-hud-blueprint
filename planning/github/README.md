# GitHub Import Package

This directory contains a complete dry-run package for initializing repository planning surfaces without making remote changes by default.

## Files

- `issues.ndjson` — one issue import record per ticket.
- `issue-bodies/` — ready-to-use Markdown bodies.
- `labels.json` — label catalog with descriptions and colors.
- `milestones.json` — M0–M5 evidence milestone definitions.
- `project-fields.json` — recommended Project fields and views.

## Safe flow

```bash
node scripts/validate-tickets.mjs
node scripts/create-github-issues.mjs
```

The second command is a dry run. Remote issue creation requires both `--apply` and an explicit `GITHUB_REPOSITORY=owner/repo`. Existing synchronized issue URLs are skipped to reduce duplicate risk.

Create labels and milestones before applying issue import. GitHub Project item insertion/field updates are a separate synchronization step so a failure cannot trigger duplicate issue creation.
