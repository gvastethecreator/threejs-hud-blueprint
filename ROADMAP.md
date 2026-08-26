# Roadmap

The roadmap is organized by evidence gates rather than dates. Ticket dependencies and live status belong in GitHub. This file describes the intended frontier.

## Current frontier

Local v0.1 code exists. Public publish is blocked by the `@scope` placeholder and missing registry auth.

The next work is a quality review of the v0.1 implementation against its evidence. Then replace `@scope` and run `pnpm run validate:release` from a clean commit.

## M0: Architecture proof

The workspace exists, project authorities are explicit, and the Windfoil/Three.js feasibility gate has a recorded verdict.

Primary epics:

- **E00 — Foundation and project governance**
- **E01 — Renderer and Windfoil feasibility**

## M1: Core alpha

A host can create, resize, update, render, and dispose a HUD containing batched primitives across supported scale modes.

Primary epics:

- **E02 — Retained core and lifecycle**
- **E03 — Viewport, scaling, and coordinate spaces**
- **E04 — Render pipeline and primitives**

## M2: Typography and layout alpha

At least two text backends work through one contract, pixel text is crisp at integer scales, and stack/grid layout is stable.

Primary epics:

- **E05 — Text core and font resources**
- **E06 — Text rendering backends**
- **E07 — Layout and clipping**

## M3: Interactive widget alpha

Pointer interaction and the initial game-widget set work in the canvas-only showcase without backend-specific widget code.

Primary epics:

- **E08 — Pointer input and interaction**
- **E09 — Themes and game widgets**

## M4: v0.1 release candidate

Visual, performance, package, compatibility, disposal, documentation, and legal gates pass on a packed external consumer.

Primary epics:

- **E10 — Quality, diagnostics, and performance**
- **E11 — Documentation and v0.1 release**

## M5: v0.1.0

The approved release candidate is published with provenance, changelog, compatibility declaration, and rollback notes.

Primary epics:

- **E11 — Documentation and v0.1 release**

## Deferred post-v0.1 directions

- HarfBuzz/WASM shaping, bidi, and broader script coverage.
- Keyboard, focus, gamepad navigation, and optional accessibility mirror.
- React adapter as a separate package or subpath, never a core requirement.
- World-space and XR layers.
- Yoga/Flexbox adapter.
- Drag-and-drop inventory interactions.
- Serialization and a visual HUD editor.
- General Windfoil vector paths/icons if the text backend proves maintainable.
- OffscreenCanvas/worker preparation and multi-threaded preprocessing.
