# Visual Regression Specification

## Surfaces

1. `scaling-lab` — aspect ratios, DPR, scale mode, safe frame, zoom.
2. `primitive-lab` — every primitive, edge width, opacity, clipping, blending.
3. `typography-lab` — backend/font/size/zoom/fallback/pixel policy matrix.
4. `layout-lab` — absolute, Stack, Grid, intrinsic/fill/min/max cases.
5. `input-lab` — debug hit bounds, hover, press, capture, clipping.
6. `widget-showcase` — complete product acceptance scenario.
7. `stress-lab` — high node/glyph/clip counts with diagnostic readout.

## Capture identity

Every snapshot filename or manifest record includes:

```text
<scenario>__<browser>__<renderer>__<backend>__<viewport>__dpr-<n>__<theme>.png
```

A companion JSON record includes dependency versions, GPU adapter identity when available, color space, logical/drawing-buffer sizes, and active capabilities.

## Comparison policy

- Geometry/layout snapshots use strict or low-tolerance comparison.
- Analytic/SDF glyph edges use a backend-specific antialias tolerance mask.
- Pixel-font snapshots require exact interior texels and exact nearest-filter alignment at integer scales.
- A changed renderer/browser baseline is reviewed in a separate baseline-update commit.
- Snapshot updates without a written reason fail the review checklist.

## Required viewport matrix

| Profile           |       CSS viewport |  DPR |          Logical reference |
| ----------------- | -----------------: | ---: | -------------------------: |
| compact landscape |           1280×720 |    1 |                  1920×1080 |
| standard          |          1920×1080 |    1 |                  1920×1080 |
| high-DPR          |           1280×720 |    2 |                  1920×1080 |
| fractional-DPR    |           1365×768 | 1.25 |                  1920×1080 |
| ultrawide         |          3440×1440 |    1 |                  1920×1080 |
| portrait          |          1080×1920 |    1 |                  1080×1920 |
| split viewport    | 1920×1080 / halves |    1 | 1920×1080 per layer policy |

## Baseline authority

Baseline images are generated artifacts and should not be treated as architecture truth. Scenario definitions and their expected semantic assertions are source; images are evidence derived from those definitions.
