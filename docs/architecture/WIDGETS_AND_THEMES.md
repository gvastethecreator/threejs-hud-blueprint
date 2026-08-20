# Widgets and Themes

## Composition rule

Widgets are public compositions of:

- retained nodes;
- layout;
- primitives;
- canonical text;
- themes;
- pointer contracts.

A widget may not create a private renderer pipeline merely because composition is inconvenient. It must propose a reusable primitive/canonical capability first.

## Controlled-state rule

The host owns gameplay state:

- health/stamina/mana/ammo;
- cooldown time;
- inventory items;
- selection;
- crosshair spread/recoil;
- gauge value;
- animation/tween progress.

Widgets receive values and emit events. They do not run hidden gameplay timers or mutate inventory.

## Theme contract

A theme is plain data:

```ts
interface HudTheme {
  colors: Record<string, ColorValue | TokenRef>;
  typography: Record<string, TextStyleInput | TokenRef>;
  spacing: Record<string, number | TokenRef>;
  radii: Record<string, number | TokenRef>;
  strokes: Record<string, StrokeInput | TokenRef>;
  widgets: Record<string, WidgetStyleSet>;
}
```

State precedence:

```text
base
→ variant
→ selected
→ hovered
→ pressed
→ disabled
→ direct instance override
```

Exact precedence is locked by tests. Missing/cyclic tokens produce diagnostics.

## Panel

Composition:

```text
Panel
├─ Rect / RoundedRect / NineSlice background
├─ optional border
└─ child layout container
```

Responsibilities:

- background/skin;
- padding;
- optional clipping;
- optional interactive state;
- no modal/focus behavior in v0.1.

## Label and IconLabel

Label wraps Text and exposes common text props/theme role.

IconLabel composes:

```text
Stack
├─ Image/icon
├─ Label
└─ optional value Label
```

Intrinsic size includes icon, text, gap, and padding.

## LinearBar

```text
LinearBar
├─ track
├─ optional delayed fill
├─ clipped fill
├─ optional segment overlay
├─ optional border
└─ optional Label
```

Props:

- min/max/value;
- optional delayedValue;
- horizontal/vertical;
- normal/reverse;
- segments/gap;
- clamp/overflow policy;
- label formatter or controlled label text;
- variants/state styles.

The widget owns no tween. Host animation libraries may mutate values.

## RadialBar

```text
RadialBar
├─ Ring track
├─ Ring fill
├─ optional segment/tick layer
└─ optional center Label/Icon
```

Uses the public Ring angle convention.

## Gauge

```text
Gauge
├─ arc/range track
├─ major/minor ticks
├─ optional tick labels
├─ needle
└─ value/min/max labels
```

Needle motion is host-controlled. Tick counts are bounded.

## Crosshair

```text
Crosshair
├─ line/rect arms
├─ optional brackets
├─ optional center dot
└─ optional ring
```

Props include gap, length, thickness, spread, rotation, recoil offset, and controlled state. Recommended layer is native or pixel-snapped.

## Slot

```text
Slot
├─ panel/frame
├─ item image
├─ rarity/state overlay
├─ optional cooldown RadialBar
├─ quantity Label
└─ optional selection/hover border
```

Data is stable-key controlled. Empty, disabled, missing icon, and cooldown states are explicit.

## InventoryGrid

Uses Grid and reconciles Slots by stable key.

Responsibilities:

- rows/columns/cell/gap;
- slot data mapping;
- selected key;
- pointer activation callbacks;
- bounded non-virtualized v0.1 grid.

Not included:

- item rules;
- persistence;
- drag/drop;
- large-list virtualization.

## Hotbar

Uses Stack/Grid and Slot:

- horizontal/vertical;
- active key/index;
- shortcut badge;
- quantity badge;
- selection frame;
- stable-key reorder behavior.

No keyboard/gamepad listeners are owned by the widget.

## Update efficiency

Expected invalidation:

| Change                  | Expected work                                   |
| ----------------------- | ----------------------------------------------- |
| bar numeric value       | fill instance/style; label text only if changed |
| bar color               | style instance only                             |
| active hotbar slot      | previous/new state styles                       |
| inventory item quantity | one slot label/run                              |
| crosshair spread        | arm transforms/instances                        |
| gauge needle            | needle transform                                |
| theme paint token       | affected styles, not global layout              |
| theme typography size   | affected text measure/layout                    |

## Default themes

v0.1 includes `DEFAULT_THEME`, `PIXEL_THEME`, and a reusable monochrome starter:

- `createMonochromeTheme({ invert, font, size })`
- `MONOCHROME_THEME` (black paper, white ink)
- `MONOCHROME_INVERT_THEME` (white paper, black ink)

Monochrome colors are grayscale. Panel and slot radii are 0. The default font is `pixel`. Themes are code data, not font or image assets.

Themes demonstrate token structure but do not lock visual identity for all games.
