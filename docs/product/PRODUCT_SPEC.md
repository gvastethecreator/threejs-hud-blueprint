# Product Specification — Three HUD v0.1

## Product statement

Three HUD is a retained-mode library for building game HUDs and compact interfaces entirely inside a Three.js canvas. It gives vanilla Three.js applications a logical screen-coordinate system, independent HUD layers, scalable and pixel-perfect typography, layout primitives, pointer interaction, themes, and common game widgets without recreating the browser DOM/CSS model.

## Problem

Three.js applications frequently solve HUDs through one of four compromises:

1. HTML/CSS overlays that are disconnected from the render canvas and its scaling/capture pipeline.
2. bespoke sprites and meshes with no reusable layout, input, theme, or typography contract;
3. general UI frameworks that are larger or more CSS-like than a game HUD needs;
4. one text technology chosen globally, forcing smooth vector-like labels and pixel fonts through the same incompatible scaling policy.

The product exists to make the canvas-native route coherent and reusable while staying much smaller than a browser UI engine.

## Primary users

### Game developer

Needs health/stamina/ammo, cooldowns, targeting, inventory, selection, and menus that scale consistently with the game canvas.

### Creative-tool developer

Needs compact canvas-native panels, meters, readouts, palettes, and controls that can be captured/exported with the rendered scene.

### Visual/technical designer

Needs to combine normal, display, mono, and pixel fonts with deterministic zoom, scale, clipping, and theme behavior.

### Library integrator

Needs a package that imports safely, exposes stable types, does not own the frame loop, and can be tested in a real external consumer.

## Product principles

1. **Canvas-native output:** every HUD visual is rendered by Three.js.
2. **Game vocabulary over browser imitation:** bars, rings, slots, reticles, panels, and labels first.
3. **Portable core, explicit GPU adapters:** widget and layout APIs do not depend on one text backend.
4. **Logical design units:** authored coordinates remain stable across viewport and DPR.
5. **Different typography deserves different policies:** smooth and pixel text may live in separate layers.
6. **Host authority:** the host owns renderer, canvas, clock, state, and main loop.
7. **Explicit ownership:** every resource is owned or borrowed; cleanup is observable.
8. **Evidence-backed claims:** compatibility, performance, and quality are generated from executable scenarios.
9. **Small public surface:** v0.1 remains one package with optional subpath backends.
10. **No hidden browser behavior:** no import-time DOM/GPU/font work.

## v0.1 scope

### Core

- retained `HudNode` tree;
- transforms, opacity, visibility, bounds, deterministic ordering;
- dirty categories and bounded invalidation;
- ordered `HudLayer` roots;
- explicit initialize/update/render/resize/suspend/dispose lifecycle;
- diagnostics and typed errors.

### Viewport

- logical reference resolution;
- contain, cover, native, stretch, and integer scale modes;
- safe frame, visible bounds, letterbox/crop reporting;
- independent HUD zoom;
- CSS-pixel/device-pixel distinction;
- DPR-aware snapping;
- viewport/scissor and split-screen inputs;
- authoritative coordinate conversions.

### Rendering

- Three.js overlay adapter;
- canonical render queue and batches;
- shared quad/instance/material pools;
- Rect, RoundedRect, Line;
- Image and NineSlice;
- Arc, Ring, segmented/tick variants;
- rectangular clipping;
- opacity, supported blend modes, color-space policy.

### Typography

- font source and license metadata;
- registry with async lifecycle and ownership;
- canonical glyph runs;
- common LTR layout with kerning, lines, wrapping, and alignment;
- fallback/missing-glyph diagnostics;
- capability-driven backend selection;
- Windfoil analytic adapter according to its M0 gate verdict;
- SDF compatibility adapter;
- bitmap/pixel backend with manifests, runtime rasterization, nearest filtering, and integer policy.

### Layout

- two-pass intrinsic measurement and final layout;
- fixed, auto, and fill sizes;
- absolute anchor/pivot placement;
- horizontal and vertical Stack;
- fixed Grid;
- padding, margin, gap, alignment, min/max;
- clip propagation and debug boxes.

### Interaction

- explicit canvas pointer adapter;
- layer-aware pointer mapping;
- bounds/clip/z-order hit testing;
- capture, target, and bubble event phases;
- hover, pressed, click, cancel, pointer capture;
- pointerEvents and disabled/pass-through policy.

### Themes and widgets

- serializable tokens and state styles;
- Panel;
- Label and IconLabel;
- LinearBar;
- RadialBar and Gauge;
- Crosshair;
- Slot and InventoryGrid;
- Hotbar;
- complete canvas-only showcase.

### Product quality

- pure unit tests and browser integration tests;
- deterministic visual regression;
- performance and allocation budgets;
- memory/resource ledger;
- context/device-loss evidence;
- SSR-safe import;
- tree-shaking and bundle checks;
- packed external consumer;
- compatibility matrix;
- legal/notices review;
- repeatable release process.

## Explicit non-goals for v0.1

- HTML/CSS rendering or CSS compatibility;
- full Flexbox/Grid;
- React requirement or React-first public API;
- text inputs, editing, IME, selections, or caret;
- complex shaping, full bidi, or universal Unicode fallback;
- keyboard/gamepad navigation and accessibility mirror;
- world-space UI, XR, or perspective panels;
- general vector-path API;
- arbitrary masks, blur, filters, or full compositing groups;
- drag-and-drop inventory;
- animation/tween engine;
- editor/serialization format;
- package-bundled fonts;
- broad Three.js version support without evidence.

## Release definition

`v0.1.0` is releasable when:

- the public package installs from a real tarball in an isolated consumer;
- a vanilla Three.js example renders the complete showcase;
- WebGL baseline and every claimed WebGPU profile pass their required scenarios;
- at least SDF and bitmap backends satisfy their declared conformance;
- Windfoil exposure matches the recorded gate verdict;
- smooth and pixel layers coexist across the required scale/DPR matrix;
- widgets use public primitives and canonical text only;
- resource counters return to baseline after repeated lifecycle tests;
- package import has no browser side effects;
- bundle and performance budgets pass;
- compatibility and limitation claims are generated from evidence;
- third-party notices and font policy pass review;
- all release documentation and examples build from public exports.

## Product acceptance scenario

A host application creates one Three.js game scene and one HUD. The HUD contains:

- smooth HP/stamina labels and bars;
- a pixel-font ammo counter;
- a dynamic crosshair;
- a radial cooldown;
- an inventory grid and hotbar;
- hover/click interaction;
- one contain layer, one integer layer, and one native reticle layer.

The host changes viewport aspect ratio, DPR, HUD zoom, values, theme, and supported text backend. The interface remains readable, pixel text follows its declared crispness policy, the host renderer state is restored after the overlay, and `dispose()` releases every owned resource.
