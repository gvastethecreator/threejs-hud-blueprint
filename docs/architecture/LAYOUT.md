# Layout

## Design constraint

v0.1 deliberately does not implement Flexbox or CSS Grid. The goal is a compact, predictable HUD layout vocabulary:

- absolute anchors/pivots;
- horizontal/vertical Stack;
- fixed Grid;
- fixed/auto/fill sizing;
- padding, margin, gap, alignment;
- min/max constraints;
- rectangular clipping.

## Box model

Each layout node resolves:

```ts
interface ResolvedLayoutBox {
  outer: RectLike;
  border: RectLike;
  padding: RectLike;
  content: RectLike;
  clip: RectLike | null;
  overflowX: boolean;
  overflowY: boolean;
}
```

v0.1 does not require a distinct CSS-like border-box/content-box switch. The package selects one documented sizing convention and uses it consistently.

Recommended convention:

- authored `width`/`height` describe border box;
- padding reduces content area;
- margin is external and owned by the parent layout algorithm;
- border is painted inside the border box.

## Lengths

```ts
type LayoutLength = number | "auto" | "fill";
```

- number: fixed logical units;
- auto: intrinsic measured content;
- fill: remaining parent content-axis space under a container that defines it.

Percentages are deferred because chains of indefinite percentage sizes add complexity disproportionate to HUD needs.

## Two-pass model

### Measure

Input:

- available constraints;
- intrinsic primitive/text size;
- fixed/auto/fill/min/max props;
- child measurement for content containers.

Output:

- desired size;
- minimum/maximum information;
- cache key;
- diagnostics.

### Layout

Input:

- final parent content rectangle;
- measured child sizes;
- container algorithm.

Output:

- resolved boxes;
- child positions/sizes;
- overflow;
- effective clip input.

Repeated layout with unchanged constraints/dirty state is skipped.

## Absolute layout

Absolute nodes resolve against one target:

```text
reference | visible | safe
```

Anchor is a normalized point on the target; pivot is a normalized point on the resolved node box:

```text
nodeOrigin = targetPoint(anchor) + offset - nodeSize * pivot
```

Presets:

```text
top-left, top, top-right,
left, center, right,
bottom-left, bottom, bottom-right
```

Absolute children do not participate in Stack/Grid flow unless a container explicitly supports overlays.

## Stack

Properties:

- direction: row or column;
- gap;
- padding;
- cross-axis align: start, center, end, stretch;
- participating child margins;
- fixed/auto/fill child sizes.

v0.1 rules:

- no wrapping;
- tree order is layout order;
- hidden vs collapsed behavior is explicit;
- multiple fill children divide remaining space equally unless a later ADR adds weights;
- negative remaining space triggers overflow/clamp policy, not undefined shrinking.

## Grid

Properties:

- rows;
- columns;
- cell size fixed or auto-derived;
- X/Y gap;
- padding;
- row-major or column-major traversal;
- optional explicit child cell placement if included by ticket decision.

Recommended v0.1 scope:

- no automatic CSS-like placement;
- no masonry/subgrid;
- no arbitrary spanning unless implemented completely;
- extra children follow explicit overflow policy;
- missing children leave empty cells.

Inventory/Hotbar rely on stable-key reconciliation at widget level, not layout identity.

## Min/max

Clamp order:

1. derive intrinsic/fixed/fill requested size;
2. apply min/max;
3. resolve stretch/alignment;
4. apply pivot/anchor;
5. derive bounds/clip.

Invalid min > max is diagnosed and normalized by one documented rule.

## Text measurement

Text returns logical bounds independent of raster backend where canonical font metrics allow. Backend-specific padding for SDF/outline/shadow affects paint bounds, not basic line layout unless explicitly required.

A Label changing color should not remeasure. Changing text/font/size/line/wrap constraint does.

## Visibility

Suggested states:

- `visible = false`: node and subtree do not render or hit; layout participation is controlled by `layoutVisibility`.
- `layoutVisibility = 'participate' | 'collapse'`.

This avoids overloading visual visibility with flow participation.

## Clipping

A node with `layout.clip = true` contributes its content or padding rectangle according to widget policy. Effective child clip is ancestor intersection.

Layout, render, and hit testing consume the same effective clip.

## Cycle/non-convergence handling

Examples:

- parent auto size depends on child fill size;
- child percentage-like dependency with no definite ancestor;
- repeated custom measure returning unstable values.

v0.1 prevents invalid combinations or caps resolution to a deterministic failure. It does not iterate indefinitely.

Diagnostic includes:

- node path;
- parent/container;
- relevant width/height modes;
- constraints;
- cycle chain when known.

## Debugging

Optional overlays:

- measured desired bounds;
- resolved outer/content boxes;
- margin/padding;
- anchor/pivot points;
- effective clip;
- overflow;
- baseline/line boxes for text.

Debug overlays never participate in layout/hit testing.
