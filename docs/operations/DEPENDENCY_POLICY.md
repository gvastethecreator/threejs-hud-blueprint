# Dependency and Supply-Chain Policy

## Runtime dependency budget

The public core should have no required runtime dependency other than the Three.js peer. Optional text adapters may add dependencies only when they cannot be isolated as optional peers or build-time tooling.

## Rules

- Pin the package manager and lockfile.
- Keep Three.js external and declare a narrow tested peer range.
- Do not import optional backend code from the main entry.
- Prefer platform and Three.js APIs over general utility dependencies for small functions.
- Require provenance/license review for font parsers, text renderers, shader/code adaptations, and binary/WASM dependencies.
- Avoid install scripts unless a concrete tool requires one and it is allow-listed.
- Use pnpm's age/trust policies where they do not make the pinned release impossible to install.
- Security overrides are documented with owner, reason, source advisory, and removal condition.

## Update classes

| Class                      | Examples                     | Required evidence                                    |
| -------------------------- | ---------------------------- | ---------------------------------------------------- |
| Tool-only patch            | linter/formatter             | fast gate                                            |
| Test/browser update        | Playwright/Vitest            | full test and baseline review                        |
| Three.js update            | renderer peer/dev dependency | full renderer, visual, package, compatibility matrix |
| Text parser/backend update | `opentype.js`, SDF adapter   | conformance, visual, memory, license                 |
| Shader/Windfoil update     | WGSL/TSL/storage layout      | WebGPU gate matrix and ADR review                    |
| Major toolchain update     | TypeScript/Vite/pnpm         | full + release dry-run                               |

## Current pins (2026-08-19)

Direct workspace dependencies use the latest **stable** tag. Pre-release tags stay out until they become `latest`.

| Package                           | Pin               | Latest stable | Action                                                                                  |
| --------------------------------- | ----------------- | ------------- | --------------------------------------------------------------------------------------- |
| `pnpm`                            | 11.22.0           | 11.22.0       | Bumped from 11.21.0. In-place lockfile updates and `pnpm cache path`.                   |
| `typescript`                      | 7.0.2             | 7.0.2         | Already latest.                                                                         |
| `vite`                            | 8.2.1             | 8.2.1         | Already latest.                                                                         |
| `vitest` / `@vitest/coverage-v8`  | 4.1.11            | 4.1.11        | Patch: restore global concurrency; restrict mock redirects to the fs allowlist.         |
| `playwright` / `@playwright/test` | 1.62.1            | 1.62.1        | Already latest.                                                                         |
| `oxlint`                          | 1.79.0            | 1.79.0        | Breaking: split `react/react-compiler` into per-category rules. This repo has no React. |
| `oxfmt`                           | 0.64.0            | 0.64.0        | Adds `operatorPosition`. Default format is unchanged.                                   |
| `three` / `@types/three`          | 0.185.1 / 0.185.4 | same          | Peer remains `>=0.185.0 <0.186.0`. r186 is not on npm.                                  |
| `tsx`                             | 4.23.12           | 4.23.12       | Already latest.                                                                         |
| `@types/node`                     | 26.2.0            | 26.2.0        | Already latest.                                                                         |

Age-gate override (remove after 2026-08-25):

- Owner: workspace maintainer.
- Reason: oxlint 1.79.0, oxfmt 0.64.0, and Vitest 4.1.11 were published 2026-08-18. The 7-day `minimumReleaseAge` (10080 minutes) blocks them until 2026-08-25.
- Source: official changelogs reviewed in this pass (`oxc-project/oxc` apps_v1.79.0, `vitest-dev/vitest` v4.1.11).
- Removal condition: delete `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` after those versions are older than 7 days.

Held back on purpose:

- Vitest 5 (`5.0.0-rc.2`)
- pnpm 12 (`12.0.0-rc.7`)
- TypeScript `7.1.0-dev`
- Playwright `1.63.0-alpha`

## Automated checks

- lockfile consistency;
- duplicate/deprecated dependency report;
- package tarball dependency list;
- known vulnerability audit;
- license report for shipped code;
- import graph proving optional subpaths remain cold.
