# Evidence Model

## Principle

A claim is releasable only when it is derived from an executable scenario with a reproducible environment record. Documentation describes the claim; evidence authorizes it.

## Directory model

```text
evidence/
├─ manifests/
│  ├─ latest.json
│  └─ releases/<version>.json
├─ tickets/HUD-###/
│  ├─ closeout.json
│  ├─ commands/
│  ├─ screenshots/
│  └─ reports/
├─ compatibility/
├─ performance/
├─ visual/
└─ package/
```

Generated evidence is normally CI artifact output and need not all be committed. Small manifests, accepted baselines, and release summaries may be committed according to the repository policy.

## Claim states

- `target` — intended, not yet verified;
- `verified` — current release evidence passes;
- `experimental` — evidence exists but the supported boundary is deliberately narrow;
- `blocked` — a required condition failed;
- `deprecated` — previously exposed claim scheduled for removal;
- `removed` — no longer public.

## Evidence invariants

- Every record includes a schema version and commit SHA.
- Commands preserve exit status and tool version.
- Screenshots have a scenario manifest; an image alone is insufficient.
- Benchmark reports include raw samples or a machine-readable summary.
- Human waivers name the exact failed gate, reason, owner, expiry, and risk.
- A new release cannot reuse an old compatibility claim after changing Three.js, renderer, text backend, font parser, or shader code without re-running the affected matrix.
