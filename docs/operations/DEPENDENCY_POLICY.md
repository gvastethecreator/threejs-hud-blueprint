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

## Automated checks

- lockfile consistency;
- duplicate/deprecated dependency report;
- package tarball dependency list;
- known vulnerability audit;
- license report for shipped code;
- import graph proving optional subpaths remain cold.
