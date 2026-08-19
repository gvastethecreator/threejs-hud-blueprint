# SDF Text Backend

## Purpose

The SDF adapter is the smooth-text compatibility baseline, especially for WebGLRenderer. It exists independently from Windfoil so the product is useful even if analytic WebGPU integration remains experimental.

## Selection gate

Before implementation, record:

- selected library or native approach;
- exact version/license;
- WebGL/WebGPU renderer compatibility;
- supported font formats;
- shaping/kerning/fallback behavior verified by tests;
- worker/global cache behavior;
- clipping and material extension capability;
- bundle cost;
- disposal/reset behavior.

A likely initial adapter may wrap a proven Three.js SDF implementation, but its classes must not escape into the main API.

## Adapter boundary

```text
Canonical FontHandle + GlyphRun + TextStyle
        ↓
SdfTextBackend
        ↓
backend font/atlas/text object
        ↓
canonical render queue / Three overlay
```

If the selected implementation insists on owning layout, the adapter must:

- keep that seam internal;
- verify measurement/layout parity;
- declare the capability difference;
- avoid changing widget props;
- preserve future replacement by canonical-run rendering.

## Required behavior

- asynchronous font/atlas readiness normalized into registry states;
- multiline text, kerning, common LTR UI;
- fill color and opacity;
- effective rectangular clipping;
- transform and layer scaling;
- explicit fallback/shaping capability;
- no module-scope worker/font/network work;
- idempotent drawable/font/backend disposal;
- optional dependency absent from main entry.

## Worker/cache policy

A worker or shared atlas must have:

- one documented owner;
- generation/reset API for tests;
- stale-result suppression;
- bounded cache policy;
- disposal or intentional process-lifetime policy;
- no hidden cross-HUD mutation.

An immortal implicit singleton is not acceptable.

## Capability truth

The adapter must not inherit marketing claims from its dependency. Tests determine:

- font format support;
- ligature behavior;
- bidi/Arabic behavior;
- fallback;
- renderer profile;
- clipping;
- outline/shadow support.

Unsupported features are visible in the generated compatibility matrix.

## Bundle policy

The adapter is imported from:

```ts
@scope/three-hud/text/sdf
```

Its optional implementation may be a peer or isolated dependency. Main bundle analysis must prove absence unless imported.

## Replacement strategy

A future native MSDF/SDF implementation can replace the adapter if:

- canonical public types stay unchanged;
- adapter-specific handles never leaked;
- conformance tests remain authoritative;
- compatibility differences are versioned/documented.
