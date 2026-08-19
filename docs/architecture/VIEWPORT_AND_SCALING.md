# Viewport and Scaling

## Coordinate spaces

Three HUD names every coordinate space:

1. **Client space** — browser `clientX/clientY`.
2. **Canvas CSS space** — coordinates inside the canvas element in CSS pixels.
3. **Host viewport space** — the supplied renderer viewport/scissor rectangle in CSS pixels.
4. **Layer logical space** — authored reference coordinates.
5. **Layer rendered space** — logical coordinates after layer zoom/offset.
6. **Device space** — physical drawing-buffer pixels after DPR.

No subsystem may silently reinterpret a tuple from another space. Development builds may use branded tuple types or tagged records.

## Logical origin and axis

- origin: top-left;
- +X: right;
- +Y: down;
- reference rectangle: `[0, 0, referenceWidth, referenceHeight]`.

The Three.js orthographic adapter converts this convention into its camera/object transform; authored UI math remains top-left/Y-down.

## Continuous scale modes

Given viewport size `Vw × Vh` and reference size `Rw × Rh`:

```text
contain = min(Vw / Rw, Vh / Rh)
cover   = max(Vw / Rw, Vh / Rh)
native  = 1 CSS pixel per logical unit
stretch = (Vw / Rw, Vh / Rh)
```

For contain/cover with scalar `s`:

```text
renderedWidth  = Rw * s
renderedHeight = Rh * s
offsetX = viewportX + (Vw - renderedWidth) / 2
offsetY = viewportY + (Vh - renderedHeight) / 2
```

`contain` exposes letterbox rectangles. `cover` exposes cropped logical/visible bounds.

`stretch` is permitted for special graphics but should produce a diagnostic when applied to normal text or a layer that declares aspect preservation.

## Integer scale

Integer layers should use a low native reference resolution such as 320×180 or another authored pixel grid.

```text
fit = min(Vw / Rw, Vh / Rh)
integerScale = max(1, floor(fit))
```

When `fit < 1`, v0.1 never silently claims pixel-perfect fractional scaling. The layer chooses:

- `overflow-1x` — render at 1× and crop;
- `disable` — mark layer unavailable;
- `explicit-fractional` — opt into a continuous fallback and mark crispness unsupported.

The default is `overflow-1x`, because it preserves authored pixels. Projects that need small screens should select an appropriate low logical reference.

## HUD zoom

HUD zoom is a layer-level multiplier applied after the scale mode:

```text
effectiveScale = scaleModeResult * hudZoom
```

Zoom is independent from:

- game camera zoom;
- renderer pixel ratio;
- browser page zoom;
- font size;
- the physical DPR.

The zoom anchor is normalized within the selected target rectangle. The default is center `[0.5, 0.5]`.

## Safe frame

A layer exposes:

- `referenceRect`;
- `visibleRect`;
- `safeRect`;
- `contentRect`;
- `letterboxRects` or crop information.

Safe insets are logical values unless an explicit host adapter converts platform safe-area data. Core never reads CSS `env()` values implicitly.

Absolute nodes choose an anchor target:

```text
reference | visible | safe
```

## Device-pixel snapping

For logical coordinate `x`, effective logical-to-CSS scale `s`, and DPR `d`:

```text
device = (x * s + offsetCss) * d
snappedDevice = round(device)
snappedLogical = ((snappedDevice / d) - offsetCss) / s
```

A simplified local helper is valid only when offset has already been included:

```ts
Math.round(value * scale * dpr) / (scale * dpr);
```

Snapping must happen at one authoritative stage. Repeated snapping at each ancestor causes drift.

### Snap targets

A layer or primitive may request:

- origin;
- bounds;
- line center/edge;
- clip rectangle;
- glyph origin and advance;
- image destination rectangle.

Not every smooth shape needs snapping. Pixel-snap policy must not force analytic/SDF text into integer typography.

## DPR and renderer size

`renderer.getSize()` reports logical renderer size; `getDrawingBufferSize()` reports physical size. The HUD accepts values from the host rather than assuming it may call `setSize`.

A resize record contains:

```ts
{
  width: number;                 // CSS/logical
  height: number;
  dpr: number;
  viewport?: RectLike;           // CSS/logical
  scissor?: RectLike;
  drawingBufferSize?: [number, number];
}
```

If supplied drawing-buffer dimensions disagree with logical size × DPR, diagnostics record the mismatch and the renderer adapter follows the authoritative host values chosen by policy.

## Split screen and custom viewport

Each HUD or layer may target a supplied viewport/scissor. Conversion first subtracts the canvas/client origin, then viewport origin, then applies the inverse layer transform.

A pointer outside a layer viewport cannot hit that layer unless the layer explicitly allows overflow interaction.

## Round-trip invariants

For finite valid inputs:

```text
logicalToCanvas(canvasToLogical(p)) ≈ p
canvasToLogical(logicalToCanvas(q)) ≈ q
```

Snapping intentionally breaks exact invertibility. The conversion API reports whether a snapped result was requested.

## Required visual matrix

- aspect: 16:9, 16:10, 21:9, square, portrait;
- viewport: full canvas and split-screen;
- scale: contain, cover, native, stretch, integer;
- zoom: 0.5, 1, 1.5, 2;
- DPR: 1, 1.25, 1.5, 2, 3 where supported;
- snap: off/on;
- layers: smooth + pixel + native reticle;
- safe insets: none and asymmetric.

Every scenario records logical, CSS, device, visible, and safe rectangles.
