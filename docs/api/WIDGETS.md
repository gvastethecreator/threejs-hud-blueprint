# Widget recipes

Widgets are compositions of public nodes, primitives, layout, themes, and pointer contracts. They do not own the game loop or inventory data.

| Widget                   | Use                                             |
| ------------------------ | ----------------------------------------------- |
| `Panel`                  | Background, padding, optional clip, child stack |
| `Label` / `IconLabel`    | Measured text and icon+text rows                |
| `LinearBar`              | Health/stamina with delayed fill                |
| `RadialBar` / `Gauge`    | Cooldown rings and needles                      |
| `Crosshair`              | Center reticle, spread, recoil                  |
| `Slot` / `InventoryGrid` | Fixed inventory cells by stable key             |
| `Hotbar`                 | Controlled active index and selection frame     |

Playground labs live in `apps/playground/src/main.ts` and consume `@scope/three-hud` only.
