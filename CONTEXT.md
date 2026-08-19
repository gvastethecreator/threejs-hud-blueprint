# Project Context and Vocabulary

`CONTEXT.md` is intentionally glossary-and-constraints only. Durable changes belong in ADRs; execution state belongs in GitHub; evidence belongs in generated reports and synchronized local notes.

## Working identity

- **Project:** Three HUD
- **Package placeholder:** `@scope/three-hud`
- **Product kind:** retained-mode, canvas-native HUD/UI library for Three.js
- **Primary integration:** vanilla TypeScript/JavaScript
- **Primary render spaces:** screen-space logical layers rendered after a host Three.js scene
- **Release target:** `v0.1.0`

## Vocabulary

- **HUD:** the top-level lifecycle and ownership boundary.
- **HudNode:** retained tree node with transform, bounds, layout, style, visibility, interaction, and children.
- **HudLayer:** independently ordered logical coordinate space with reference size, scale mode, zoom, safe frame, and pixel policy.
- **Reference resolution:** authored logical width/height, independent from framebuffer dimensions.
- **CSS pixel:** logical browser pixel used by canvas layout.
- **Device pixel:** physical drawing-buffer pixel after DPR.
- **Scale mode:** mapping policy between reference and viewport: contain, cover, native, stretch, or integer.
- **Pixel snap:** mapping selected logical positions/bounds to physical-pixel boundaries.
- **Primitive:** low-level visual node such as Rect, Image, Ring, or Text.
- **Widget:** composition of public primitives and layout; never a private render path.
- **Canonical GlyphRun:** backend-neutral glyph IDs, clusters, positions, lines, and bounds produced by text layout.
- **Text backend:** raster/encoding implementation that consumes canonical text data.
- **Windfoil backend:** analytic WebGPU text adapter based on the Windfoil algorithm, exposed according to the M0 gate verdict.
- **SDF backend:** compatibility-oriented smooth text adapter.
- **Bitmap backend:** nearest-filtered pixel text and icon-atlas adapter.
- **Capability:** structured statement of availability, support level, limits, and rejection reason.
- **Owned resource:** resource the HUD must release exactly once.
- **Borrowed resource:** host-owned resource the HUD may reference but must not dispose.
- **Dirty category:** bounded invalidation reason: transform, layout, text, geometry, style, hit-test, queue, or resource.
- **Evidence:** current command output, deterministic fixture, screenshot, report, or metric proving an acceptance criterion.
- **Gate:** required evidence boundary for a milestone or release.

## Fixed v0.1 constraints

- No DOM-rendered HUD elements.
- No React requirement.
- No package-owned game loop.
- No full CSS/Flexbox implementation.
- No complex-script correctness claim.
- No world-space/XR UI.
- No bundled third-party fonts.
- No private Three.js renderer patches.
- One publishable package; optional backends use subpath exports.
- Three.js remains a peer dependency with a narrow tested range.
