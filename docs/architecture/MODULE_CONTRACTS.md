# Module Contracts and Boundaries

## Versioned shared contracts

```ts
export type SharedContractId =
  | "lifecycle/v0"
  | "tree/v0"
  | "viewport/v0"
  | "layout/v0"
  | "render-command/v0"
  | "font-resource/v0"
  | "glyph-run/v0"
  | "text-backend/v0"
  | "input/v0"
  | "theme/v0"
  | "diagnostics/v0"
  | "testing/v0";
```

Contracts are semantic boundaries, not promises that every ID becomes a separate npm export.

## Module manifest shape

```ts
export type ModuleContract = {
  id: string;
  role:
    | "contract"
    | "core"
    | "viewport"
    | "layout"
    | "render"
    | "text-core"
    | "text-backend"
    | "primitive"
    | "input"
    | "theme"
    | "widget"
    | "diagnostics"
    | "consumer";
  status: "planned" | "experimental" | "active";
  consumes: SharedContractId[];
  provides: SharedContractId[];
  forbiddenImports: string[];
  claimAllowed: string;
  claimBlocked: string;
  verificationCommand: string;
};
```

## Required module contracts

| Module                   | Consumes                                               | Provides                               | Allowed claim                                    | Blocked claim                                        |
| ------------------------ | ------------------------------------------------------ | -------------------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `contracts`              | none                                                   | all type-level contract shapes         | Defines stable value/error/capability types      | Owns runtime, Three.js, DOM, or GPU behavior         |
| `core`                   | lifecycle, tree, diagnostics                           | lifecycle, tree                        | Owns HUD/tree state and invalidation             | Selects text backend or owns host loop               |
| `viewport`               | viewport, diagnostics                                  | viewport                               | Pure scale/coordinate transforms                 | Reads CSS/DOM implicitly in core                     |
| `layout`                 | tree, viewport, glyph-run, diagnostics                 | layout                                 | Measures/resolves boxes                          | Recreates CSS/Flexbox or draws                       |
| `render`                 | tree, viewport, render-command, diagnostics            | render-command                         | Owns queue, batches, Three overlay resources     | Owns widget/game semantics                           |
| `text/core`              | font-resource, glyph-run, diagnostics                  | font-resource, glyph-run, text-backend | Registry, common layout, selection contracts     | Rasterizes through one hardcoded backend             |
| `text/backends/windfoil` | font-resource, glyph-run, render-command, text-backend | text-backend                           | Analytic WebGPU glyph preparation/encoding       | Imports widgets/input or claims WebGL support        |
| `text/backends/sdf`      | font-resource, glyph-run, render-command, text-backend | text-backend                           | SDF compatibility encoding                       | Leaks third-party classes into widgets/public core   |
| `text/backends/bitmap`   | font-resource, glyph-run, render-command, text-backend | text-backend                           | Pixel atlas preparation/encoding                 | Mutates layer scale or host DPR                      |
| `primitives`             | tree, layout, render-command, glyph-run, theme         | render-command                         | Emits public visual building blocks              | Creates private widget-specific pipelines            |
| `input`                  | tree, viewport, layout, input, diagnostics             | input                                  | Pointer mapping, hit testing, propagation        | Owns gameplay state or 3D raycasting                 |
| `theme`                  | theme, diagnostics                                     | theme                                  | Resolves plain tokens/state styles               | Reads CSS selectors/variables implicitly             |
| `widgets`                | tree, layout, render-command, glyph-run, input, theme  | none                                   | Composes public primitives and controlled events | Imports concrete backend or Three renderer internals |
| `diagnostics`            | diagnostics plus read-only snapshots                   | diagnostics                            | Reports bounded serializable state               | Stores secrets/full text by default                  |
| `playground`             | public package exports                                 | none                                   | Demonstrates and tests the package               | Deep-imports `packages/three-hud/src`                |
| `external-consumer`      | packed npm exports                                     | none                                   | Proves publication integrity                     | Uses workspace alias/path mapping                    |

## Import rules

The boundary checker must enforce at least:

```text
packages/three-hud/src/contracts/**
  !-> three
  !-> core/layout/render/text/backends/primitives/widgets/input
  !-> window/document/navigator at module scope

packages/three-hud/src/widgets/**
  !-> text/backends/**
  !-> render/three/**
  !-> apps/**

packages/three-hud/src/text/backends/**
  !-> widgets/**
  !-> input/**
  !-> apps/**

packages/three-hud/**
  !-> apps/**
  !-> fixtures/**
  !-> e2e/**
  !-> docs/**

apps/playground/**
  -> @scope/three-hud public exports
  !-> ../../packages/three-hud/src/**
```

## Runtime ownership rules

- `HUD` owns layer roots, retained nodes, internal registries, queues, and resources it creates.
- renderer adapters borrow the host renderer.
- texture/font records state whether bytes/textures are owned or borrowed.
- optional backend global/shared caches are prohibited until their owner, reset, and disposal contracts are explicit.
- workers, observers, event listeners, and device/context listeners have one lifecycle owner.

## Verification

- `pnpm run architecture:verify`
- boundary unit fixtures;
- import graph report;
- public export/declaration report;
- packed-consumer compilation.
