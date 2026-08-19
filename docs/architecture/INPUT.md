# Input and Hit Testing

## Scope

v0.1 supports screen-space pointer interaction:

- pointer move;
- enter/leave;
- down/up;
- click;
- cancel;
- explicit pointer capture.

Keyboard, focus, gamepad navigation, text input, gestures, and 3D raycasting are deferred.

## Adapter boundary

Core accepts normalized records:

```ts
interface HudPointerInput {
  pointerId: number;
  type: "move" | "down" | "up" | "cancel";
  clientX: number;
  clientY: number;
  button: number;
  buttons: number;
  pointerType: string;
  time: number;
}
```

`connectHudPointerEvents(hud, canvas)` explicitly installs/removes DOM Pointer Event listeners. No listener is installed at module import or HUD construction unless requested.

## Coordinate mapping

```text
client
→ subtract canvas bounding rect
→ canvas CSS coordinates
→ host viewport/scissor
→ layer inverse viewport transform
→ layer logical coordinates
```

The same conversion module used by rendering supplies the inverse. Split-screen viewport and layer zoom are included.

## Hit-test eligibility

A node is eligible when:

- layer is enabled;
- effective visibility is true;
- interaction policy permits it;
- it is not excluded by disabled policy;
- point lies in effective clip;
- point lies in hit shape.

v0.1 hit shape is axis-aligned world bounds unless a primitive/widget defines a bounded simple shape. Alpha-mask hit testing is deferred.

## Ordering

The winning target follows the same authority as visual order:

```text
highest layer order
→ highest z-index
→ latest stable authored sequence
```

The hit index must not invent a conflicting sort.

## Pointer events policy

```text
auto      node box and descendants may receive events
none      neither node nor descendants receive events
box-only  node may receive; descendants do not
box-none  descendants may receive; node box itself does not
```

Disabled policy is separately documented because a disabled widget may either block underlying UI or pass through. The default should be consistent and theme-visible.

## Event path

For target `T`:

```text
root → ... → parent(T)  capture
T                       target
parent(T) → ... → root  bubble
```

Listeners can stop propagation and optionally immediate propagation.

Event object includes:

- pointer identity/buttons/type;
- client/canvas/viewport/layer/logical coordinates;
- target/currentTarget;
- phase;
- source layer;
- timestamp;
- default-prevented/propagation flags;
- capture/release methods where legal.

## Enter/leave

Hover path is the ancestor chain of the current target. A target/path change derives enter/leave events deterministically.

A layout/viewport change under a stationary pointer can trigger a hover recomputation on update.

## Press and click

The input system tracks pressed target per pointer.

Click policy inputs:

- maximum movement in CSS or logical units;
- maximum duration if desired;
- whether release must occur over target;
- whether capture changes target semantics.

The library defines one default but allows host configuration. A click is not emitted when canceled.

## Pointer capture

A node can capture a pointer after down. Captured move/up/cancel continues regardless of bounds.

If the node/layer/HUD is removed, disabled, suspended, or disposed, capture ends with deterministic cancellation/cleanup.

## Interaction state

Widgets may observe:

```text
hovered
pressed
disabled
selected (controlled widget state)
```

Input owns hovered/pressed; host/widget props own selected/game state. State changes feed theme resolution without creating a global store.

## Index updates

The hit index invalidates on:

- world bounds;
- clip;
- visibility;
- layer/order/z/sequence;
- pointer policy;
- disabled policy;
- hierarchy.

Paint-only changes do not rebuild the index.

## Debug evidence

The input lab can show:

- pointer coordinates in every space;
- eligible hit boxes;
- effective clips;
- sorted candidates;
- target path;
- captured target;
- event trace.

Debug visuals never receive hits.
