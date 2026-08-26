# Triage fields

GitHub Issues: one category label and one triage label. Local mirrors record the same values.

This repository keeps the `status:*` labels on GitHub. Do not also create `needs-triage`, `ready-for-agent`, or `ready-for-human`.

## Categories

| Canonical category | GitHub label  | Meaning                    |
| ------------------ | ------------- | -------------------------- |
| `bug`              | `bug`         | Existing behavior is wrong |
| `enhancement`      | `enhancement` | New behavior or improvement |

## Statuses

| Canonical status   | GitHub label            | Meaning                                   |
| ------------------ | ----------------------- | ----------------------------------------- |
| `needs-triage`     | `status:needs-triage`   | Maintainer evaluation required            |
| `needs-info`       | `needs-info`            | Waiting for missing information           |
| `ready-for-agent`  | `status:ready`          | Fully specified, ready for an AFK agent   |
| `ready-for-human`  | `status:needs-human`    | Requires human implementation or judgment |
| `wontfix`          | `wontfix`               | Deliberately not actioned                 |

`status:blocked` is extra. Use it with Project status `Blocked`. It does not replace a triage label.

## Project status

| Workflow state | Project value |
| -------------- | ------------- |
| Queued          | Backlog       |
| Ready           | Ready         |
| Active          | In Progress   |
| Blocked         | Blocked       |
| Review          | Review        |
| Finished        | Done          |

When a skill changes a role, update the GitHub label and local `Category:` or `Status:` field together. When work starts or finishes, update the Project item and local `Project status:` field together.

Local `Execution:` is separate from triage `Status:`. Use `queued`, `active`, `blocked`, or `finished`. Mirror the Project workflow value without replacing the triage label.

## Workflow labels

- `spec`: parent specification for implementation tickets.
- `wayfinder:map`: parent decision map.

Area, epic, milestone, priority, size, backend, and `type:*` labels already exist on GitHub. Apply those from issue metadata. Do not invent a second vocabulary.
