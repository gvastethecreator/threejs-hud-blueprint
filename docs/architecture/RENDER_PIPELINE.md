# Render Pipeline

## Goals

- Render HUD output after the host Three.js scene.
- Avoid one `Object3D`/mesh/material per HUD element.
- Preserve visual order while batching compatible commands.
- Restore host renderer state.
- Support WebGL baseline and evidence-approved WebGPU profiles.
- Keep text backends independent from widgets.
- Make draw calls, buffers, clips, and resource ownership observable.

## Overlay contract

The host sequence is explicit:

```ts
hud.update(dt);

renderer.render(gameScene, gameCamera);
hud.render();
```

The HUD does not clear color. Its depth policy is explicit:

- default primitives use depth test/write disabled;
- the adapter may clear depth before overlay only when configured;
- HUD ordering is controlled by layer/z/sequence, not game depth.

## State snapshot

The production adapter records every mutable state it changes. Candidate state includes:

- render target/output target;
- viewport;
- scissor and scissor test;
- auto-clear flags;
- clear color/alpha/depth if changed;
- tone mapping/output color settings if changed;
- sort policy if changed;
- any adapter-specific override.

The exact list is locked by the M0 overlay spike. State restoration occurs in `finally`.

## Canonical draw command

```ts
type HudDrawCommand =
  ShapeInstanceCommand | ImageInstanceCommand | TextDrawableCommand | DebugCommand;

interface DrawCommandBase {
  layerOrder: number;
  zIndex: number;
  sequence: number;
  opacity: number;
  clip: RectLike | null;
  blend: HudBlendMode;
  sourceNodeId: string;
}
```

A command contains value data and stable resource handles, not live widget objects.

## Ordering and batching

Visual order authority:

```text
layer order → z-index → stable authored sequence
```

Batching may merge adjacent compatible commands but may not reorder transparent commands across a visual boundary merely to reduce draw calls.

The overlay keeps separate instance runs when the queue switches between shapes, UI text, pixel text, or textures. It reuses these runs across frames. This preserves mixed paint order without creating a mesh for each node. A clipped glyph uses a smaller destination quad and matching atlas UVs. Shader output converts to the renderer output color space before premultiplying RGB by the final opacity.

For WebGL image draws, the host passes a `textures: ReadonlyMap<string, THREE.Texture>` to `createHudOverlayAdapter`. Keys match `HudTextureHandle.id`. These textures are borrowed; the host configures their filtering and color space and disposes them after the HUD. A ready handle without a bound texture produces no draw. The WebGPU overlay still has its documented limited profile and does not submit this custom image shader. The image command carries its source UV rectangle; missing bindings never draw a solid placeholder.

A batch key can include:

```text
renderer profile
primitive/text pipeline
shader feature mask
texture or atlas
sampler/filter
blend mode
clip strategy
color/output policy
```

Clip rectangles should be per instance when the pipeline supports it; scissor changes may create batch boundaries.

## Shared geometry

Most primitives use a shared unit quad:

```text
vertex 0..3 → local 0..1 quad
instance → destination bounds, transform, shape parameters, color, clip
fragment → rect/radius/ring/image/text coverage
```

The pool owns:

- geometry;
- instance attributes/storage;
- material/pipeline cache;
- free slots/high-water state;
- GPU byte counters;
- explicit disposal.

The pool does not shrink every frame. Optional compaction is a bounded maintenance operation.

## Primitive pipelines

### Shape pipeline

Supports Rect, RoundedRect, Line, Arc/Ring, borders, segments, and ticks through a bounded feature mask.

### Image pipeline

Supports UV rectangle, tint, opacity, filtering, aspect fit policy, and NineSlice geometry/instances.

### Text pipeline

Receives backend-owned drawable handles that encode into the canonical queue. Each backend may use its own material/storage/atlas while obeying order, clip, opacity, and lifecycle contracts.

## Rectangular clipping

The semantic contract is an effective axis-aligned clip in layer logical space, obtained by intersecting ancestor clips.

Implementation options:

- per-instance shader clip;
- renderer scissor for large groups;
- backend-native clip support;
- a measured hybrid.

The implementation is chosen per backend by evidence. Semantic behavior must match.

An empty clip suppresses draw and hit work.

## Alpha and color

The intended default is premultiplied-alpha `over` composition:

```text
out.rgb = src.rgb + dst.rgb * (1 - src.a)
out.a   = src.a   + dst.a   * (1 - src.a)
```

Backend shaders must agree on whether input colors are straight or premultiplied before the blend stage.

UI colors should avoid unintended game tone mapping. The adapter documents whether UI is authored in output/sRGB-like space or transformed through the renderer's working/output pipeline. The final policy must be proven on both supported renderer families.

## Blend modes

v0.1 should begin with:

- `normal`;
- optional `add` only if tested consistently.

Unsupported modes are rejected. No silent approximate multiply/screen behavior.

## Texture ownership

A texture record states:

```ts
type ResourceOwnership = "borrowed" | "owned" | "shared-owned";
```

- borrowed Three.js texture: HUD never disposes;
- owned texture: HUD disposes exactly once;
- shared-owned: explicit cache/reference owner.

Filtering is an asset policy. Pixel textures use nearest filtering and generally no mipmaps; smooth images may use linear filtering.

## Renderer profiles

### WebGLRenderer

- baseline shapes/images;
- bitmap backend;
- SDF backend when selected implementation supports it;
- no Windfoil analytic storage/WGSL claim.

### WebGPURenderer on native WebGPU

- shapes/images through approved node/material path;
- bitmap;
- Windfoil only if M0 gate accepts it;
- SDF only according to adapter evidence.

### WebGPURenderer on WebGL2 fallback

Treat as a separate profile. `isWebGPURenderer` alone does not grant WebGPU-only capabilities.

## Failure and disposal

- Unsupported profile fails before partial allocation where possible.
- Shader/material creation failure publishes a typed diagnostic.
- A batch failure cannot leave host renderer state mutated.
- Device/context loss invalidates backend resources.
- Adapter disposal releases geometry, buffers, materials, listeners, and owned textures.
- Borrowed renderer is never disposed.

## Instrumentation

Per frame or snapshot:

- visible nodes;
- commands;
- batches;
- draw calls;
- material/pipeline count;
- geometries;
- instance capacity/used;
- CPU/GPU bytes where measurable;
- queue rebuild count;
- instance update bytes;
- skipped commands by clip/visibility;
- renderer profile.

Instrumentation is bounded and optional in production builds.
