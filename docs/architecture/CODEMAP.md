# Expected Repository and Source Structure

This file is the original v0.1 target tree from the blueprint. Live source lives under `packages/three-hud/src` and `apps/playground/src`. Missing folders in this tree are not proof that product code is missing.

```text
three-hud/
├─ .github/
│  ├─ ISSUE_TEMPLATE/
│  │  ├─ bug_report.yml
│  │  ├─ compatibility_report.yml
│  │  ├─ config.yml
│  │  └─ feature_request.yml
│  ├─ workflows/
│  │  ├─ ci.yml
│  │  ├─ planning-integrity.yml
│  │  └─ release-dry-run.yml
│  └─ PULL_REQUEST_TEMPLATE.md
├─ apps/
│  └─ playground/
│     ├─ src/
│     │  ├─ app/
│     │  ├─ labs/
│     │  │  ├─ capability/
│     │  │  ├─ overlay/
│     │  │  ├─ scaling/
│     │  │  ├─ typography/
│     │  │  ├─ primitives/
│     │  │  ├─ layout/
│     │  │  ├─ input/
│     │  │  ├─ widgets/
│     │  │  └─ performance/
│     │  ├─ fixtures/
│     │  └─ main.ts
│     └─ package.json
├─ packages/
│  └─ three-hud/
│     ├─ src/
│     │  ├─ contracts/
│     │  │  ├─ capability.ts
│     │  │  ├─ diagnostics.ts
│     │  │  ├─ errors.ts
│     │  │  ├─ font.ts
│     │  │  ├─ input.ts
│     │  │  ├─ layout.ts
│     │  │  ├─ render.ts
│     │  │  ├─ text.ts
│     │  │  └─ viewport.ts
│     │  ├─ math/
│     │  ├─ core/
│     │  │  ├─ Hud.ts
│     │  │  ├─ HudLayer.ts
│     │  │  ├─ HudNode.ts
│     │  │  ├─ DirtyFlags.ts
│     │  │  ├─ ResourceLedger.ts
│     │  │  └─ ModuleContracts.ts
│     │  ├─ viewport/
│     │  ├─ layout/
│     │  ├─ render/
│     │  │  ├─ commands/
│     │  │  ├─ queue/
│     │  │  ├─ pools/
│     │  │  ├─ materials/
│     │  │  └─ three/
│     │  ├─ text/
│     │  │  ├─ core/
│     │  │  └─ backends/
│     │  │     ├─ windfoil/
│     │  │     ├─ sdf/
│     │  │     └─ bitmap/
│     │  ├─ primitives/
│     │  ├─ input/
│     │  ├─ theme/
│     │  ├─ widgets/
│     │  ├─ diagnostics/
│     │  ├─ testing/
│     │  ├─ exports/
│     │  │  ├─ windfoil.ts
│     │  │  ├─ sdf.ts
│     │  │  ├─ bitmap.ts
│     │  │  └─ testing.ts
│     │  └─ index.ts
│     ├─ tests/
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ vite.lib.config.ts
├─ fixtures/
│  ├─ external-consumer/
│  └─ fonts/
│     └─ README.md
├─ benchmarks/
│  ├─ budgets.json
│  ├─ scenarios/
│  └─ reports/
├─ e2e/
│  ├─ scenarios/
│  └─ baselines/
├─ docs/
├─ planning/
├─ scripts/
├─ evidence/              claim manifests and selected durable evidence
├─ .scratch/              ignored synchronized local mirrors
├─ AGENTS.md
├─ CONTEXT.md
├─ ROADMAP.md
├─ package.json
├─ pnpm-workspace.yaml
└─ tsconfig.base.json
```

## Current scaffold versus target

The repository already contains the root workspace, public package, basic contracts/tree/viewport code, playground consumer, tarball fixture, structural scripts, documentation, GitHub metadata, and planning program. Folders shown below that are not yet populated are created by their owning tickets rather than prefilled with misleading placeholder implementations.

## Domain responsibilities

### `contracts`

Pure public value types. No Three.js, DOM, GPU, or runtime class imports.

### `math`

Pure vectors, rectangles, matrices, finite validation, intersections, snapping, and coordinate conversion helpers.

### `core`

Retained tree, lifecycle, invalidation, ownership, layer controller, and module contract report.

### `viewport`

Pure scale/coordinate transforms and serializable snapshots.

### `layout`

Measurement, absolute, Stack, Grid, constraints, clip propagation, diagnostics.

### `render`

Canonical commands, queue, batching, Three.js adapter, material/geometry/instance pools, color/clip policy.

### `text/core`

FontRegistry, face adapters, common LTR layout, GlyphRun, fallback, backend selection.

### `text/backends`

Concrete optional renderers. Never imported by widgets.

### `primitives`

Public visual nodes that emit canonical commands.

### `input`

Normalized pointer records, mapping, hit index, propagation, canvas adapter.

### `theme`

Token/state-style normalization and resolution.

### `widgets`

Public compositions. No direct Three.js/backend imports.

### `diagnostics`

Stats and serializable snapshots, not unbounded histories.

### `testing`

Deterministic clocks/IDs/viewports, mock backend, test factories. Exported only through `./testing`.

## File-size rule

No monolithic architecture/backlog file should become the implementation diary. Split by durable concern and generate indexes. Large generated reports belong under ignored `artifacts/`.
