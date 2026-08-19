# Test Strategy

## Test pyramid

### Pure unit tests

Run without a browser or GPU where possible:

- viewport scale and coordinate transforms;
- pixel snapping and safe insets;
- tree ordering and dirty propagation;
- intrinsic measurement and final layout;
- draw-command sorting and batch keys;
- font metadata, cache keys, fallback, wrapping, alignment;
- hit testing and event propagation;
- theme resolution and widget value normalization;
- ownership ledgers and error serialization.

### Renderer contract tests

Use fake/recording adapters to prove:

- commands are canonical and deterministic;
- widgets use public primitives only;
- text backends receive canonical glyph runs;
- a change updates only the declared dirty category;
- borrowed host resources are never disposed.

### Browser integration tests

Use Playwright in real Chromium profiles:

- WebGL renderer overlay lifecycle;
- WebGPU profile when available;
- canvas resize, DPR emulation, viewport/scissor;
- pointer mapping and capture;
- font load/cancel/failure;
- context/device loss scenarios where automation permits;
- visual scenario capture and diagnostics export.

### Package tests

- ESM import in Node without DOM globals;
- declaration compilation;
- export map completeness;
- bundle/tree-shaking fixture;
- packed `.tgz` installation into an isolated consumer;
- examples compile only from public exports.

## Determinism rules

- Tests use injected clocks and seeded generators.
- Animation is not owned by the package; examples set values directly at known timestamps.
- Font fixtures are pinned, licensed, and hashed.
- Visual scenarios declare renderer, browser, DPR, logical size, drawing-buffer size, backend, font fixture, and tolerance profile.
- Diagnostics and IDs must not include wall-clock time unless the test injects it.

## Ticket closeout

A ticket closes only with:

1. focused tests named in the ticket;
2. the nearest architecture or package gate;
3. evidence attached or generated in its declared location;
4. updated capability/compatibility docs when a claim changes;
5. explicit note for any unrun gate and the resulting risk.

## Required command tiers

| Tier               | Purpose           | Required content                                                                             |
| ------------------ | ----------------- | -------------------------------------------------------------------------------------------- |
| `validate:fast`    | iteration         | workspace, tickets, boundaries, docs, typecheck, focused unit suite                          |
| `validate:full`    | merge             | fast plus all unit/browser contract tests, build, SSR import                                 |
| `validate:release` | release candidate | full plus visual, benchmark, memory, tarball consumer, bundle, license, compatibility report |
