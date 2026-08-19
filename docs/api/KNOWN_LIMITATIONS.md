# v0.1 known limitations

- Public API is pre-1.0. Breaking changes increment the minor version.
- Windfoil is experimental and native-WebGPU only. Import `@scope/three-hud/text/windfoil`. The main entry never auto-selects it.
- SDF and bitmap backends are isolated subpaths. Bitmap claims integer nearest scaling only.
- v0.1 does not implement Flexbox, CSS Grid, world-space HUD, XR, keyboard/gamepad focus, or React bindings.
- Complex-script / bidi text is not claimed.
- Third-party fonts are not bundled. Hosts supply licensed `FontSource` bytes.
- Compatibility cells outside Chromium WebGL and Node import are unverified until their evidence exists.
- `@scope` is a placeholder npm scope. Replace it before a public registry release.

Rollback: never overwrite a published version. Deprecate the bad version, then publish a patch from a verified commit. Keep the failed tarball under `release/`.
