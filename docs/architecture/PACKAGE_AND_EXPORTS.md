# Package, Workspace, and Exports

## Decision

Use a pnpm workspace for development, but publish one npm package in v0.1.

```text
packages/three-hud     publishable
apps/playground        workspace consumer
fixtures/external-consumer  packed tarball consumer
```

This mirrors the strongest package boundary in the reference projects without importing a large multi-app architecture.

## Package metadata

Target properties:

```json
{
  "name": "@scope/three-hud",
  "version": "0.0.0",
  "type": "module",
  "sideEffects": false,
  "files": ["dist", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md"],
  "peerDependencies": {
    "three": "narrow tested range"
  }
}
```

Three.js remains external in library builds.

## Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./text/windfoil": {
      "types": "./dist/text/windfoil.d.ts",
      "import": "./dist/text/windfoil.js"
    },
    "./text/sdf": {
      "types": "./dist/text/sdf.d.ts",
      "import": "./dist/text/sdf.js"
    },
    "./text/bitmap": {
      "types": "./dist/text/bitmap.d.ts",
      "import": "./dist/text/bitmap.js"
    },
    "./testing": {
      "types": "./dist/testing.d.ts",
      "import": "./dist/testing.js"
    },
    "./package.json": "./package.json"
  }
}
```

Do not export internal directory globs. A small export map protects refactoring.

## Main entry rules

The main entry may export:

- Hud/HudNode/HudLayer;
- public contracts;
- viewport/layout;
- primitives/widgets/themes;
- FontRegistry and backend-neutral text contracts;
- diagnostics.

It may not import:

- Windfoil implementation/WGSL;
- SDF implementation or optional peer;
- bitmap runtime rasterizer;
- font parser used only by an optional backend;
- browser worker;
- playground/test code.

## Experimental subpaths

If Windfoil is experimental:

- status is visible in declarations/docs;
- the main auto selector excludes it unless allowed;
- it may use a narrower Three.js range;
- changelog identifies compatibility changes;
- stable main types do not depend on experimental-only types.

## Playground consumer rule

The playground declares:

```json
{
  "dependencies": {
    "@scope/three-hud": "workspace:*",
    "three": "catalog:"
  }
}
```

Source imports package exports, not `../../packages/three-hud/src`.

The playground can use DOM controls to operate labs, but every showcased HUD visual remains in the canvas.

## External consumer gate

The fixture:

1. packs `packages/three-hud`;
2. creates/cleans an isolated install directory;
3. installs the `.tgz`;
4. typechecks a consumer;
5. runs Node ESM import;
6. builds a browser example;
7. optionally runs a smoke page;
8. reports declaration/export/package-file failures.

It must not inherit workspace path aliases or symlink resolution.

## SSR-safe import

Node import must not evaluate:

- `window`;
- `document`;
- `navigator`;
- WebGPU globals;
- worker construction;
- font/image fetch;
- canvas creation;
- Three.js renderer construction.

Browser-specific helpers evaluate globals only when called.

## Build outputs

- ESM JavaScript;
- source maps according to release policy;
- `.d.ts` declarations;
- no bundled Three.js;
- optional backend chunks isolated by entry;
- copied license/notices where required.

## Tree shaking

- `sideEffects: false` is valid only if modules have no required import-time mutation.
- material/shader registration must be explicit, not global.
- package tests import selected symbols and inspect bundle graph.
- optional third-party backends must not appear in the main consumer build.

## Version compatibility

Initial Three.js support should be narrow, for example one tested release line, because renderer/node APIs can change quickly. The exact range is chosen by evidence in HUD-068.

A version upgrade requires:

- adapter tests;
- capability reports;
- visual profiles;
- packed consumer;
- compatibility matrix update;
- changelog entry.
