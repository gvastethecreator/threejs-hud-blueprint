# v0.1 known limitations

- The public API is pre-1.0. A breaking change increments the minor version.
- Windfoil is experimental and native-WebGPU only. Import `@scope/three-hud/text/windfoil`. The main entry never selects it.
- SDF and bitmap backends are isolated subpaths. Bitmap claims integer nearest scaling only.
- v0.1 does not include Flexbox, CSS Grid, world-space HUD, XR, keyboard or gamepad focus, or React bindings.
- Complex-script and bidi text are not claimed.
- Third-party fonts are not bundled. Hosts supply licensed `FontSource` bytes.
- Compatibility cells outside Chromium WebGL and Node import are unverified until their evidence exists.
- `@scope` is a placeholder npm scope. Replace it before a public registry release.

## Rollback

CAUTION: Do not overwrite a published version.

Deprecate the bad version. Then publish a patch from a verified commit. Keep the failed tarball under `release/`.
