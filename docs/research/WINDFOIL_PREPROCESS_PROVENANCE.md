# Windfoil preprocess provenance (HUD-008)

Accessed on **2026-08-19**.

## Decision

HUD-008 implements font-outline extraction, quadratic normalization, and row-band tables as original TypeScript in `packages/three-hud/src/text/windfoil/`. It does **not** copy Windfoil demo, Deno, PNG, GPU, or WGSL files.

## Upstream

- Project: Windfoil by Matt DesLauriers / texel-org
- License: Apache License 2.0
- URL: <https://github.com/texel-org/windfoil>
- Use: algorithm description only (quadratic contours, row-band acceleration, winding/coverage)

Apache-2.0 obligations if later files adapt upstream source: keep copyright, license text, NOTICE, and a modification record. This spike has no copied upstream source, so no Apache file header is required on the new modules.

## Patent caution

Upstream documents uncertainty about overlap with prior techniques or patents. This repository is not a legal clearance opinion. The caution stays in `packages/three-hud/THIRD_PARTY_NOTICES.md`.

## Parser

No `opentype.js` dependency. A bounded TrueType `glyf` reader loads `ArrayBuffer` bytes. CFF/OTTO, variable fonts, and composite glyphs fail with `FONT_LOAD_FAILED`.

## Cubic policy

TrueType `glyf` is quadratic. Cubic fixtures use the parsed-face adapter. Conversion: midpoint subdivision until the `t = 0.5` samples of cubic and quadratic differ by at most `0.5` font units, depth at most 8. Control point of a leaf quadratic is `(3c1 - p0 + 3c2 - p3) / 4`.

## Fonts

No font binary is committed. Tests build a tiny TrueType `ArrayBuffer` in memory.
