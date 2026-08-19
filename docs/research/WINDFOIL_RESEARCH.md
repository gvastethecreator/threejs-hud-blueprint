# Windfoil Integration Research

## Executive finding

Windfoil is valuable as an analytic-coverage text technique, but the reference repository is not a drop-in Three.js text component. Three HUD therefore treats it as an isolated, evidence-gated backend rather than as the architecture of the library.

## What the reference implementation provides

The current reference is organized around five separable concerns:

1. font parsing and glyph outline extraction;
2. conversion of straight/cubic outline segments into a uniform quadratic representation;
3. row-band preprocessing and curve storage;
4. basic glyph advance/kerning layout;
5. a WebGPU pipeline that draws all glyph instances with curve, row, instance, and uniform buffers.

That decomposition is favorable for an adapter because CPU preprocessing and canonical text layout can be tested independently from the Three.js render integration.

## Current constraints that affect scope

- The reference layout is single-line, left-to-right, and explicitly does not perform shaping.
- It resolves character glyphs and kerning directly through `opentype.js`.
- The GPU path owns raw WebGPU buffers, pipeline creation, bind groups, render passes, and target format.
- It batches glyphs into one instanced draw when their buffers and pipeline are shared.
- It assumes premultiplied-alpha compositing.
- Its quality/performance behavior under minification, transformed glyphs, clipping, dynamic atlas growth, and different hardware must be measured rather than assumed.

## Three.js integration hypothesis

The preferred integration preserves Three.js as renderer authority:

```text
Font bytes
  -> outline extraction
  -> immutable glyph outline record
  -> row-band/curve atlas
  -> canonical GlyphRun placements
  -> Three.js-compatible storage/instance bindings
  -> HUD render queue encoder
  -> host WebGPURenderer pass
```

The backend must not request its own canvas, adapter, or device when attached to a host renderer. It must not reach into undocumented renderer internals. It may use supported WebGPU/TSL/storage-buffer surfaces only when the current renderer exposes the required capability.

## Gate outcomes

Ticket HUD-011 records exactly one outcome:

### Production

Allowed only when the adapter:

- uses public Three.js APIs;
- restores host renderer state;
- supports required clipping, opacity, transforms, resize, DPR, and loss/recovery scenarios;
- has bounded memory/update behavior;
- meets the release performance matrix.

### Experimental

Used when rendering works but one or more requirements remain narrower than the baseline. The subpath is published with explicit capability reporting and no automatic selection unless the host opts in.

### Blocked

Used when the adapter requires private patches, cannot coexist safely with the overlay pass, or fails core stability/quality requirements. CPU preprocessing research may remain, but no runtime backend is exported as supported.

## Adapter boundary

The backend consumes:

- `FontFaceRecord` or prepared outline data;
- canonical `GlyphRun` placements;
- layer-to-device transform;
- clip/opacity/color command state;
- a renderer capability snapshot.

It provides:

- capability truth;
- text measurement compatibility metadata;
- prepared GPU resources;
- render commands or encoder contributions;
- bounded diagnostics and memory counters;
- explicit disposal.

It never owns:

- wrapping or widget layout;
- font fallback selection;
- host loop or camera;
- pointer input;
- game state;
- the public `Label` API.

## Required spike evidence

| Scenario          | Minimum evidence                                                                |
| ----------------- | ------------------------------------------------------------------------------- |
| Basic integration | One line rendered inside a normal Three.js scene without a second device/canvas |
| Transform         | translation, non-uniform layer scale where allowed, zoom, rotation verdict      |
| Quality           | 8–256 logical px, zoom ladder, DPR 1/1.5/2/3, dark/light backgrounds            |
| Minification      | readability and cost across shrinking glyph coverage                            |
| Clipping          | nested rectangular clips and partial glyph boundaries                           |
| Updates           | static run, value counter, color-only change, text replacement, atlas growth    |
| State safety      | game scene before/after HUD, viewport/scissor, tone/color state, blending       |
| Lifecycle         | repeated create/dispose, context/device loss, canceled font load                |
| Performance       | CPU preprocessing, upload time, steady CPU, GPU frame time, memory              |

## Legal/provenance rule

Any adapted source must preserve its license notice and be enumerated in `THIRD_PARTY_NOTICES.md`. The project must also retain the upstream author's caution around novelty/patent overlap and avoid presenting this blueprint as a legal clearance opinion.
