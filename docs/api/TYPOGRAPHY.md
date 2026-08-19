# Typography, pixel fonts, and licenses

- Canonical text is `GlyphRun` + `TextBackend`. Widgets never import Windfoil, SDF, or bitmap implementation modules.
- Windfoil is experimental on native WebGPU only: `@scope/three-hud/text/windfoil`.
- SDF is the compatibility baseline: `@scope/three-hud/text/sdf`.
- Bitmap fonts use one-page manifests, nearest filtering, and integer scale: `@scope/three-hud/text/bitmap`.
- Third-party fonts are never committed without an approved license record. `BUNDLED_FONT_LICENSES` is empty until a font is approved.
- Pixel policy example: 11px native size with integer multipliers. Do not name a third-party family unless a license record exists.

See [font and license policy](../operations/FONT_AND_LICENSE_POLICY.md) and [text system](../architecture/TEXT_SYSTEM.md).
