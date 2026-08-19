# Typography, pixel fonts, and licenses

- Canonical text is `GlyphRun` + `TextBackend`. Widgets never import Windfoil, SDF, or bitmap implementation modules.
- Windfoil is experimental on native WebGPU only: `@scope/three-hud/text/windfoil`.
- SDF is the compatibility baseline: `@scope/three-hud/text/sdf`.
- Bitmap fonts use one-page manifests, nearest filtering, and integer scale: `@scope/three-hud/text/bitmap`.
- Third-party fonts are never committed without an approved license record. `BUNDLED_FONT_LICENSES` is empty until a font is approved.
- Pixel policy example: 11px native size with integer multipliers. Do not name a third-party family unless a license record exists.

## Pixel failure / troubleshooting matrix

| Symptom                                  | Likely cause                          | What to check                                       | Fix                                                                                      |
| ---------------------------------------- | ------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Bitmap glyphs blur when zooming          | Linear filtering or non-integer scale | `bitmapScalePolicy`, atlas mag/min filter           | Keep nearest filtering and integer downscale on the bitmap layer                         |
| Bitmap glyphs jump by one device pixel   | Logical positions not snapped         | `pixelSnap`, `integerDownscale`                     | Enable pixel snap on the HUD layer that owns the bitmap text                             |
| Smooth SDF text looks crunchy at 11px    | Using bitmap integer rules on SDF     | Layer `scaleMode` and backend subpath               | Put SDF labels on `contain`/`cover`, not `integer`                                       |
| Windfoil import throws on WebGL          | Native-WebGPU-only backend            | `probeRendererCapabilities().windfoil`              | Keep Windfoil on `@scope/three-hud/text/windfoil`; do not auto-select it                 |
| Missing glyph boxes / tofu               | No fallback face or missing codepoint | `FONT_LOAD_FAILED`, fallback policy                 | Register a fallback `FontSource`; missing glyphs must report, not silently swap backends |
| Third-party font in the tarball          | Unapproved binary committed           | `pnpm run licenses:verify`, `BUNDLED_FONT_LICENSES` | Remove the file; hosts supply licensed bytes at runtime                                  |
| Label width stays 0 after `label.text =` | Bypassed `setText` / remeasure        | Call `Label.setText`                                | Never assign `text` without remasuring the layout                                        |

See [font and license policy](../operations/FONT_AND_LICENSE_POLICY.md) and [text system](../architecture/TEXT_SYSTEM.md).
