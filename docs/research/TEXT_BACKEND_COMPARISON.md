# Text Backend Comparison

## Decision summary

No single text technology satisfies the complete product requirement. Three HUD uses one canonical text/layout contract with separate analytic, SDF, and bitmap encoders.

| Dimension            | Windfoil analytic                                      | SDF/MSDF adapter                                                  | Bitmap/pixel                                     |
| -------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------ |
| Primary role         | high-quality scalable WebGPU text                      | smooth compatibility baseline                                     | crisp pixel fonts and icon glyphs                |
| Source               | vector outlines                                        | vector font converted/cached to distance field                    | prebuilt atlas or native-size rasterization      |
| Scaling strength     | potentially very large zoom without atlas texel limits | broad practical range within atlas quality                        | integer multiples of native size                 |
| Small/minified text  | must be measured carefully                             | usually predictable with tuned SDF                                | excellent only at declared pixel sizes           |
| WebGL baseline       | no                                                     | yes, depending on adapter                                         | yes                                              |
| WebGPU               | gate-dependent                                         | adapter-dependent                                                 | yes through ordinary textures                    |
| Complex shaping      | outside backend; canonical shaping layer required      | may be available in third-party adapter but cannot leak into core | only if glyph run/atlas contains required glyphs |
| Dynamic glyph cost   | CPU outline/band prep plus GPU buffers                 | atlas generation/upload                                           | atlas generation/upload or none for prebuilt     |
| Memory               | curve/row/instance buffers                             | texture atlas plus glyph metadata                                 | texture atlas plus manifest                      |
| Pixel-perfect policy | inappropriate                                          | inappropriate                                                     | explicit feature                                 |
| v0.1 status          | gated optional                                         | required baseline                                                 | required baseline                                |

## Canonical invariants

Every backend must consume the same resolved run semantics:

- glyph IDs or stable glyph keys;
- advance/offset positions in logical units;
- line index and run bounds;
- resolved font face and style identity;
- color/opacity independent from layout when supported;
- clip and layer transform supplied by rendering;
- missing-glyph decisions already made by text core.

A backend may report that it cannot represent a feature. It may not silently change wrapping, fallback, alignment, or font identity.

## Capability fields

```ts
export type TextBackendCapabilities = {
  rendererKinds: readonly ("webgl" | "webgpu")[];
  scalableCoverage: boolean;
  pixelPerfect: boolean;
  colorGlyphs: boolean;
  outline: boolean;
  shadow: boolean;
  rotation: "none" | "bounded" | "full";
  dynamicGlyphs: boolean;
  deviceLossRecovery: boolean;
  maximumRecommendedGlyphsPerRun?: number;
};
```

Capability truth is data, not documentation-only prose. Backend selection and compatibility reports consume the same record.

## Auto-selection policy

1. A font declared with a pixel policy selects bitmap or fails visibly.
2. An explicitly requested backend is used only if available and compatible.
3. `auto` prefers a release-supported analytic backend only when its gate verdict allows automatic selection.
4. Otherwise `auto` selects the SDF baseline.
5. No backend fallback may change font family or pixel policy silently.

## Conformance contract

Each required backend is tested against the same cases:

- deterministic measurement for a prepared canonical run;
- stable bounds before and after a color-only update;
- text replacement and resource reuse;
- clip and opacity propagation;
- missing glyph behavior;
- disposal and cancellation;
- context/device loss according to declared support;
- capability serialization;
- repeated create/render/dispose returning counters to baseline.
