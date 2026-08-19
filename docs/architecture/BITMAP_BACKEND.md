# Bitmap and Pixel Text Backend

## Purpose

The bitmap backend serves:

- pixel fonts;
- fixed UI glyphs;
- controller/button glyphs;
- icon fonts converted into atlases;
- deterministic low-resolution typography.

It may use a prebuilt atlas or explicitly invoked runtime rasterization. It never relies on CSS rendering for layout.

## Manifest v1

```json
{
  "schemaVersion": "three-hud/bitmap-font/v1",
  "id": "example-pixel-font",
  "sourceHash": "sha256:...",
  "nativeSize": 11,
  "lineMetrics": {
    "ascender": 8,
    "descender": -3,
    "lineGap": 0
  },
  "pages": [
    {
      "id": "page-0",
      "width": 512,
      "height": 512,
      "format": "rgba8"
    }
  ],
  "glyphs": {
    "65": {
      "page": 0,
      "rect": [0, 0, 7, 11],
      "bearing": [0, 8],
      "advance": 7
    }
  },
  "kerning": {
    "65:86": -1
  },
  "license": {
    "id": "OFL-1.1",
    "source": "host asset inventory",
    "redistribution": "host-managed"
  }
}
```

The production schema uses explicit units and validates all indices, sizes, and bounds.

## Preparation paths

### Prebuilt

Host supplies manifest and texture page resources. Texture ownership is explicit.

### Runtime rasterization

An optional explicit function receives approved font bytes and a native size, rasterizes through browser facilities, and emits the same manifest/page contract.

Runtime rasterization:

- does not run at module import;
- is unavailable in SSR and reports that cleanly;
- is deterministic only under a controlled browser/font pipeline;
- records source hash and settings;
- is not the canonical text measurement source.

## Pixel policy

Crisp mode requires:

- known native raster size;
- nearest filtering;
- generally no mipmaps;
- integer display multiplier;
- physical-pixel snapped origin, advance, line height, and clip;
- no fractional ancestor transform that invalidates the policy.

Fractional presentation chooses one explicit result:

- reject/disable;
- warn and render non-pixel-perfect;
- select a smooth backend if the font registration allows it.

The library never changes host DPR or layer scale secretly.

## Canonical integration

Common layout maps code points to glyph IDs/metrics. The bitmap backend prepares texture records and emits image-like glyph instances from the canonical run.

Blank glyphs retain advance. Missing glyphs use the common fallback/replacement policy.

## Atlas limits

The manifest declares:

- page dimensions and count;
- maximum glyph count;
- padding/extrusion if used;
- alpha/color format;
- sampler policy.

v0.1 may cap page count. Exceeding limits fails before texture allocation.

## Mixed layers

Recommended pattern:

```ts
const smooth = hud.createLayer({
  id: "smooth",
  scaleMode: "contain",
});

const pixel = hud.createLayer({
  id: "pixel",
  referenceSize: [320, 180],
  scaleMode: "integer",
  pixelSnap: true,
});
```

The same font outline may be registered twice with different IDs/policies when the project needs both crisp and smooth presentations.

## Visual acceptance

For each allowed multiplier/DPR profile:

- no interpolated edge colors beyond atlas content;
- origins and advances align to physical pixels;
- line rhythm does not drift;
- clip edges align consistently;
- repeated frames are byte-stable where the browser profile permits;
- smooth layers in the same scene are unaffected.
