---
id: HUD-067
title: "Enforce SSR-safe import, tree shaking, bundle budgets, and packed-consumer integrity"
epic: E10
milestone: M4
type: quality
priority: P0
size: L
status: done
github_issue: pending
sync: pending
blocked_by:
  - HUD-001
  - HUD-003
  - HUD-039
  - HUD-042
  - HUD-044
labels:
  - "area:packaging"
  - "area:quality"
  - "epic:E10"
  - "milestone:M4"
  - "priority:P0"
  - "size:L"
  - "type:quality"
---

# HUD-067: Enforce SSR-safe import, tree shaking, bundle budgets, and packed-consumer integrity

## Outcome

The actual packed npm tarball imports in Node without browser side effects, typechecks in an external consumer, and keeps optional text backends out of the main entry and within measured size budgets.

## Scope

- Pack the package and install it into an isolated fixture.
- Run Node ESM import, TypeScript consumer compilation, and browser consumer build.
- Inspect export map, declaration paths, side-effect behavior, and bundle graph.
- Set budgets for main, backend subpaths, and accidental duplicate dependencies.
- Check package contents and notices.

## Acceptance criteria

- [x] Main import does not reference `window`, `document`, `navigator`, WebGPU, workers, or font fetch at module evaluation.
- [x] External consumer uses no workspace aliases.
- [x] Windfoil/SDF/bitmap code appears only when its subpath is imported.
- [x] Three.js remains external/peer in the library bundle.
- [x] Packed files match the approved manifest.

## Verification

- `pnpm run test:ssr-import`
- `pnpm run test:consumer`
- `pnpm run bundle:verify`
- `pnpm run package:verify`

## Evidence to attach

- Attach tarball manifest, consumer logs, and bundle treemap.

## Out of scope

- Server-side rendering of the canvas.
- CommonJS output unless later justified.

## Tracker links

- GitHub issue: pending
- GitHub Project: pending
- Epic: [E10](../../EPICS.md#e10)
- Milestone: [M4](../../MILESTONES.md#m4)

## Sync log

- Never synchronized.
