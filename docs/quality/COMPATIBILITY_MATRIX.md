# Compatibility Matrix

## Authority

This document begins as a target matrix. HUD-068 replaces target cells with generated evidence. No profile is “supported” solely because a dependency advertises it.

## Renderer profiles

| Profile           | v0.1 target                                          | Required backends                                                 | Notes                                   |
| ----------------- | ---------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| `webgl-baseline`  | required                                             | SDF, bitmap                                                       | primary compatibility profile           |
| `webgpu-standard` | required if Three.js/current browser evidence passes | SDF where adapter supports it, bitmap, Windfoil according to gate | public API only                         |
| `webgpu-windfoil` | optional gated                                       | Windfoil                                                          | production/experimental/blocked verdict |
| `node-import`     | required                                             | none                                                              | package import and type surface only    |

## Browser targets

The release report pins exact tested browser versions. Initial policy:

- current stable Chromium: required;
- current stable Edge: required where it differs materially from Chromium packaging/flags;
- current stable Firefox: WebGL target, WebGPU only when available and tested;
- current stable Safari: target after a real Apple/WebKit evidence run;
- mobile browsers: documented as unverified until dedicated device evidence exists.

## Three.js peer policy

Start with one narrow minor line verified by CI and the external consumer. Expanding the peer range requires running the complete renderer/state/visual/package matrix for each added line.

## Typography profiles

| Feature                     | SDF                                  | Bitmap                     | Windfoil                 |
| --------------------------- | ------------------------------------ | -------------------------- | ------------------------ |
| Latin LTR common layout     | required                             | required                   | gate-required            |
| kerning                     | required where font data supplies it | manifest/runtime dependent | gate-required            |
| multiline/wrap/alignment    | text-core responsibility             | text-core responsibility   | text-core responsibility |
| pixel-perfect integer scale | not claimed                          | required                   | not claimed              |
| complex shaping/bidi        | not claimed in v0.1                  | not claimed                | not claimed              |
| color fonts                 | not claimed                          | atlas-dependent, explicit  | not claimed              |

## Environment record

Every supported cell must point to evidence containing:

- Three.js, package, browser, OS, Node and pnpm versions;
- renderer kind and adapter/device details where available;
- enabled browser flags;
- backend capability report;
- passed scenario IDs;
- known limitations.

## Generated evidence (HUD-068)

Generated from named passing scenario IDs, not hardcoded object equality.

| Cell            | Status       | Scenario IDs                                                                                                                                       |
| --------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| webgl-baseline  | measured     | shape:rect, shape:rounded-rect, shape:line, shape:ring, text:label, linear-bar, linear, radial, crosshair, hotbar, gauge, panel, label, icon-label |
| node-import     | measured     | ssr-import                                                                                                                                         |
| webgpu-windfoil | experimental | windfoil-three-spike                                                                                                                               |

Three.js peer: `>=0.185.0 <0.186.0`.
