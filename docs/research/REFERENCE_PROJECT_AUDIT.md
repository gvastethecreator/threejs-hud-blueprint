# Reference Project Architecture Audit

## Purpose

This note records which architectural practices were intentionally borrowed from the owner's existing projects and, equally importantly, which practices were not copied. The goal is continuity without importing application-scale complexity into a small library.

## Reference matrix

| Project              | Pattern retained                                                                                                                                                     | Adaptation for Three HUD                                                                                                  | Pattern deliberately not copied                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `codex-studio`       | Root wayfinding docs; explicit agent guide; fast/full/release gates; architecture audits; GitHub Issues as live state with local expanded briefs                     | `AGENTS.md`, `CONTEXT.md`, `ROADMAP.md`; `validate:fast/full/release`; ticket mirrors plus import manifest                | Large application service topology, provider/runtime surfaces, and the number of specialized audit scripts |
| `shader-boy-mini`    | Incremental `apps/*` + `packages/*` workspace; isolated contract packages; visual/performance/asset gates; supply-chain pinning                                      | Lean pnpm workspace; public package plus playground; optional text adapters behind stable contracts; dependency policy    | Electron, authentication, Cloudflare, model delivery, and app-specific release surfaces                    |
| `threejs-mugen`      | Product/engine/render separation; typed module contracts; executable forbidden-dependency checks; bounded decisions with evidence and explicit non-claims            | Versioned semantic contracts; boundary checker; ADRs; each ticket states allowed outcome and out-of-scope claims          | Giant append-only architecture/backlog ledgers and compatibility-specific engine vocabulary                |
| `waveform-component` | Headless/public package separated from playground; SSR-safe import; packed tarball external-consumer test; `sideEffects: false`; renderer-independent canonical data | Public ESM package; playground imports package name only; canonical draw commands and glyph runs; package integrity gates | React peer dependency and audio/source/session-specific architecture                                       |
| `canvas-core`        | Small Vite/Vitest/oxlint/oxfmt setup and logged tooling                                                                                                              | Small modern TypeScript toolchain and consistent scripts                                                                  | React application layout and component-oriented root structure                                             |

## Resulting project shape

The synthesis is intentionally asymmetrical:

1. **Documentation discipline comes from the larger projects.** Product scope, architecture, ADRs, contracts, tickets, and evidence each have a named owner.
2. **Publication discipline comes from the reusable component project.** The tarball, declarations, package exports, SSR import, and external consumer are release gates.
3. **Dependency direction comes from the engine project.** Modules publish contracts and forbidden imports are executable.
4. **Workspace size remains small.** There is one publishable package in v0.1, not a package for every folder.
5. **The playground is a consumer, not a second authority.** It may provide labs and controls, but library behavior is never implemented only in the playground.

## Adopted source-of-truth model

| Information                     | Authority                                  | Derived/mirrored surface                |
| ------------------------------- | ------------------------------------------ | --------------------------------------- |
| Product scope and non-goals     | `docs/product/PRODUCT_SPEC.md`             | README, roadmap, issue bodies           |
| Runtime dependency direction    | `docs/architecture/` + ADRs                | boundary manifest and checker           |
| Public work state               | GitHub Issues/Project once initialized     | local ticket briefs and generated index |
| Expanded implementation context | `planning/tickets/` before synchronization | GitHub issue body                       |
| Compatibility claims            | generated QA evidence                      | docs matrix and release notes           |
| Package surface                 | package exports and generated declarations | API docs                                |

## Anti-patterns avoided

- A single multi-megabyte backlog document as the primary task store.
- Architecture files that grow only through chronological addenda.
- Widgets that import a concrete text backend.
- A playground that deep-imports package source.
- Declaring WebGPU support merely because Three.js can select a fallback renderer.
- Shipping font binaries without per-file provenance.
- Treating a successful monorepo build as proof that the npm tarball works.

## Review rule

Any new structural convention should answer two questions:

1. Which concrete failure does it prevent?
2. Is it justified for a reusable library, or was it copied from an application by habit?
