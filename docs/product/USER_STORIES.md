# User Stories and Acceptance Narratives

## US-01 — Add a HUD without changing the host loop

As a Three.js developer, I can create and initialize the HUD, call `resize`, `update`, and `render` from my existing loop, and dispose it without the package installing another animation loop.

**Acceptance narrative:** the game scene renders first, the HUD renders second, renderer state is restored, and disabling the HUD does not affect the game clock.

## US-02 — Author once in logical coordinates

As a designer/developer, I can compose a 1920×1080 interface and use it at 1280×720, 3440×1440, portrait, and split-screen sizes without rewriting every position.

**Acceptance narrative:** anchors, safe frame, contain/cover/native/integer scale, zoom, visible bounds, and pointer coordinates all use the same viewport transform.

## US-03 — Mix smooth and pixel typography

As a visual designer, I can use a smooth display font for labels and a pixel font for counters without fractional scaling making both paths look wrong.

**Acceptance narrative:** text backends are selected per font/style/layer, the pixel layer declares native size and integer policy, and the smooth layer remains continuously scalable.

## US-04 — Use Windfoil when it is genuinely supported

As a WebGPU integrator, I can explicitly import the Windfoil adapter and inspect its capability state before choosing it.

**Acceptance narrative:** WebGPURenderer on a WebGL2 fallback is rejected; a supported WebGPU path renders through public Three.js APIs; experimental status and limitations remain visible.

## US-05 — Build game HUDs from useful widgets

As a game developer, I can create bars, cooldowns, gauges, reticles, inventory, and hotbars without hand-authoring every mesh.

**Acceptance narrative:** widgets compose public primitives, use controlled host data, expose consistent style/state/event contracts, and do not own gameplay logic or animation loops.

## US-06 — Interact inside the canvas

As a developer, I can route pointer events from the canvas into logical HUD elements with deterministic overlap, clip, and event propagation behavior.

**Acceptance narrative:** hover, down, up, click, cancel, and capture work after resize and across layers; clipped content cannot receive hits.

## US-07 — Publish safely

As a library maintainer, I can prove the package rather than trusting workspace aliases.

**Acceptance narrative:** a freshly packed tarball imports in Node, typechecks and builds in an isolated consumer, excludes optional backends from the main entry, and contains only approved files/notices.

## US-08 — Diagnose performance and cleanup

As an integrator, I can inspect batches, draw calls, glyph/atlas counts, recomputation, and resource ownership.

**Acceptance narrative:** steady-state scenarios report bounded work, value-only updates avoid full rebuilds, and repeated create/dispose cycles return resource counters to baseline.
