# Widget recipes

Widgets are compositions of public nodes, primitives, layout, themes, and pointer contracts. They do not own the game loop or inventory data. Lab chrome (`#status`) may use host DOM; HUD output stays on the canvas.

Playground: `apps/playground/src/main.ts` at `http://127.0.0.1:4174/`. Open `/?webgpu=1` for the WebGPU renderer. The GitHub Pages site is this same playground. Capability helper: `apps/playground/src/labs/capability.ts`.

## Panel + Label + IconLabel

```ts
const tray = new Panel({
  width: 280,
  height: 120,
  padding: { top: 12, right: 12, bottom: 12, left: 12 },
});
tray.content.add(new Label({ text: "TRAY", fontSize: 18 }));
tray.content.add(new IconLabel({ text: "HEALTH", value: "72", iconSize: 16 }));
tray.layoutChildren("vertical", 8);
```

Switch text backend without rebuilding the widget: `label.setFontId("pixel")`.

## LinearBar

Host-controlled delayed fill (no widget tween):

```ts
const hp = new LinearBar({
  width: 320,
  height: 24,
  value: 72,
  delayedValue: 88,
  label: "HP",
  segments: 5,
  gap: 4,
});
hp.setValue(40);
hp.setDelayedValue(40);
```

## RadialBar, Gauge, and Compass

```ts
const ammo = new RadialBar({ width: 96, height: 96, value: 18, max: 30 });
ammo.setValue(12);
const speed = new Gauge({ width: 128, height: 128, value: 40, max: 100, ticks: 5 });
speed.setValue(70);
const heading = new Compass({ heading: 0, fontId: "pixel" });
heading.setHeading(Math.PI / 2);
heading.setColor(0xffffff, 0x888888);
```

`Compass` keeps N E S W fixed. Heading `0` points north. Call `setHeading` in radians.

## Crosshair / Reticle

```ts
const cross = new Crosshair({ dot: true, gap: 6, length: 12 });
cross.setSpread(8);
cross.setRecoil(2);
const reticle = new Reticle();
```

Center the widget on the 1920×1080 reference: `cross.setPosition(960 - cross.size.width / 2, 540 - cross.size.height / 2)`.

## Slot, InventoryGrid, Hotbar

```ts
const pack = new InventoryGrid({
  columns: 4,
  rows: 2,
  items: [
    { key: "med", quantity: 3 },
    { key: "nade", quantity: 2 },
  ],
  onActivate: (key) => {},
});
pack.setItems([
  { key: "nade", quantity: 1 },
  { key: "med", quantity: 3 },
]);
const bar = new Hotbar({ slots: [{ key: "gun" }, { key: "med" }], onActivate: (key) => {} });
bar.setActiveIndex(1);
```

The widgets never mutate the host arrays.

## Monochrome starter theme

`createMonochromeTheme()` is grayscale HUD data. Use it as the first skin.

```ts
import { MONOCHROME_THEME, themeColor } from "@scope/three-hud";

const theme = MONOCHROME_THEME;
const ink = themeColor(theme, "text");
const paper = themeColor(theme, "panel");
slot.setTheme(theme);
crosshair.setColor(themeColor(theme, "crosshair"));
```

`MONOCHROME_INVERT_THEME` swaps ink and paper. Both themes use radius 0 and the `pixel` font by default.

## Performance lab

`pnpm run benchmark:smoke` and `pnpm run benchmark:full -- --verify` measure encode/update p95 in Node. GPU timers are reported as unavailable when the host cannot sample them. Do not compare those numbers across machines without the environment fingerprint in the report.

## Scaling / typography

Copyable playground config: `referenceSize: { width: 1920, height: 1080 }`, layer `scaleMode: "contain"`. Pixel integer layers use `scaleMode: "integer"` plus nearest bitmap text. See [TYPOGRAPHY.md](TYPOGRAPHY.md) and [VISUAL_THRESHOLDS.md](../quality/VISUAL_THRESHOLDS.md).
