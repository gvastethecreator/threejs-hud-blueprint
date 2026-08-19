# Windfoil Analytic Text Backend

## Status

**Proposed and gate-controlled.** It is not the mandatory foundation of Three HUD.

The M0 program must record one verdict:

- **production candidate** — supported for a narrow tested WebGPU/Three.js profile;
- **experimental adapter** — available only through explicit opt-in and experimental subpath;
- **blocked research** — no release export; reports and contracts remain useful.

## Upstream model

Windfoil fills quadratic-Bézier contours by computing winding and analytic anti-aliasing per fragment. The upstream implementation uses:

- font outline extraction and metrics;
- quadratic segment normalization;
- row-band acceleration tables;
- curve and row storage buffers;
- one instanced quad per visible glyph;
- a fragment shader that gathers relevant band curves and computes coverage;
- premultiplied-alpha blending.

The upstream demo currently separates font parsing, band construction, layout, GPU plumbing, and WGSL. Its reference layout is single-line LTR with kerning and no shaping; Three HUD must not inherit that limitation as a public widget contract.

## Clean integration boundary

Three HUD separates:

```text
windfoil/
├─ preprocess/
│  ├─ outline-adapter.ts
│  ├─ quadratic-normalization.ts
│  ├─ row-bands.ts
│  ├─ atlas-builder.ts
│  └─ serialization.ts
├─ runtime/
│  ├─ capability.ts
│  ├─ prepared-font.ts
│  ├─ glyph-cache.ts
│  ├─ instance-buffer.ts
│  ├─ material.ts
│  ├─ shader.ts
│  └─ adapter.ts
└─ testing/
```

Adapted code requires file-level provenance and Apache-2.0 notices. The package must not copy unrelated upstream Deno/demo/PNG plumbing.

## Font preprocessing

Input:

- parsed static font face;
- requested glyph IDs;
- bounded band configuration.

Output per font/glyph:

- advance and bounds;
- normalized quadratic pieces;
- row-band references;
- curve/row atlas offsets;
- deterministic hash and statistics.

Rules:

- straight lines become quadratic segments with midpoint control;
- cubic outlines use an approved documented approximation;
- blank glyphs keep metrics without outline allocation;
- repeated glyph IDs reuse one prepared atlas record;
- malformed contours fail safely;
- preprocessing output is deterministic.

## Canonical layout integration

Three HUD's common text system produces `GlyphRun`. The backend receives glyph IDs and positioned instances; it does not perform widget line wrapping or alignment.

Per-instance data is expected to contain:

- glyph origin;
- scale;
- glyph bounds;
- atlas row/band offsets;
- color/opacity;
- effective clip;
- optional coverage/style parameters.

Exact packing is internal and benchmark-driven.

## Three.js integration options

The spike evaluates only public/supported options:

1. Three.js node/TSL material with WGSL native function nodes;
2. storage/instanced array nodes exposed by the current renderer;
3. supported raw shader extension points if documented;
4. bounded custom render object hook only if public and state-safe.

Rejected options:

- patching Three.js source;
- importing renderer-private classes/paths;
- monkey-patching internal pipeline state;
- bypassing the host renderer with a second raw WebGPU canvas context;
- claiming fallback translation to WebGL without a real implementation.

## Renderer capability

Required:

- initialized WebGPURenderer;
- active native WebGPU backend;
- storage-buffer capability needed by the chosen data layout;
- approved WGSL/node feature path;
- required blending/render-target format;
- tested Three.js range.

`isWebGPURenderer === true` is insufficient because the renderer may use WebGL2 fallback.

## Buffer model

Logical resources:

- uniform buffer: viewport/style/camera/profile data;
- font curve storage;
- row-band storage;
- prepared-glyph table;
- dynamic glyph-instance storage.

The production adapter may chunk buffers to fit Three.js/device limits. It must expose:

- allocated/used bytes;
- glyph/curve/row counts;
- growth count;
- upload bytes/timings;
- maximum supported ranges;
- resource generation after recreate.

## Dynamic updates

- text color/opacity: instance patch;
- transform/clip: instance patch;
- text using already prepared glyphs: run-instance replacement only;
- new glyph IDs: append/prepare bounded atlas data;
- font replacement: separate generation;
- viewport/zoom: shared uniforms plus instance transforms as required.

No update should rebuild every prepared glyph merely because one counter changes.

## Clipping and compositing

The backend implements the canonical effective rectangular clip through approved shader/renderer means.

Coverage output and blend mode must agree with the common premultiplied-alpha contract. Cross-backend visual equivalence concerns geometry/clip/order, not identical edge pixels.

## Minification and transform limits

The gate must determine and document:

- minimum useful rendered font size;
- extreme zoom range;
- fractional translation behavior;
- non-uniform scale support;
- rotation support;
- row-band density limits;
- pathological contour/band costs.

Out-of-range conditions report diagnostics. They are not hidden through invented quality claims.

## Device loss

The adapter enters `lost`/`unavailable`, invalidates GPU handles, and follows the approved policy:

- recreate from retained CPU/preprocessed data;
- require host reinitialization;
- or remain unavailable with fallback recommendation.

No infinite automatic retry loop.

## Performance evidence

Required scenarios:

- cold font parse/preprocess;
- first glyph preparation/upload;
- repeated glyph reuse;
- dynamic counter;
- 100/500/2,000 glyph runs;
- zoom/DPR matrix;
- clipping;
- multiple fonts/sizes;
- atlas growth;
- disposal;
- device loss where automatable.

Reports separate CPU preprocessing, JS update, upload, draw calls, GPU timing if reliable, and memory.

## Legal/provenance

- Preserve Apache-2.0 notices for adapted Windfoil code.
- Record modified files and upstream revision.
- Preserve upstream caution about possible overlap with prior techniques/patents.
- Do not imply a patent warranty.
- No upstream bundled font is copied unless separately needed and licensed.
- Cite the algorithm in research/docs when used.

## Export policy

```ts
import { createWindfoilTextBackend } from "@scope/three-hud/text/windfoil";
```

The main package never imports this subpath. If experimental:

- creation requires explicit `allowExperimental: true`;
- auto-selection excludes it by default;
- declarations/docs include experimental status;
- compatibility matrix names exact supported profile.
