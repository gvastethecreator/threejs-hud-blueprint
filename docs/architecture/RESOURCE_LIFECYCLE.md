# Resource Lifecycle and Ownership

## Ownership kinds

```ts
type ResourceOwnership = "owned" | "borrowed" | "shared-owned";
```

### Owned

Created by or transferred to the HUD. The HUD releases exactly once.

Examples:

- internal geometry/material/instance buffers;
- backend GPU buffers/atlases;
- texture created from host-supplied bytes when ownership is transferred;
- explicitly HUD-owned worker;
- event/observer listener installed by an adapter.

### Borrowed

Host remains owner.

Examples:

- Three.js renderer;
- host-created texture marked borrowed;
- host clock/game state;
- canvas element;
- source bytes that remain caller-owned but are copied/parsed as needed.

### Shared-owned

A documented cache owns the resource through reference counting or another explicit policy. It must expose reset/dispose semantics for tests.

## HUD lifecycle

```text
new
→ initializing
→ ready
↔ suspended
→ disposing
→ disposed

initializing → failed → disposing/disposed
ready → lost/degraded → ready or failed
```

Illegal operations produce typed diagnostics/errors.

## Async epochs

Every async family has a generation:

- HUD initialization;
- FontRegistry entry;
- backend prepared font;
- worker request;
- renderer/device generation.

A completion checks generation and disposed state before publication. Stale resources are immediately released according to ownership.

## Font lifecycle

```text
registration
→ source load
→ parse face
→ publish FontHandle ready
→ backend preparation on demand
→ glyph preparation
→ drawable references
→ unregister/release
```

Parsed face and backend resources are distinct. Removing one drawable does not discard a font still used elsewhere.

## Drawable lifecycle

```text
create
→ paint/transform/clip updates
→ glyph-run replacement
→ hidden/reused
→ release
```

Pool slots must not expose stale values after reuse.

## Texture lifecycle

Image/NineSlice accepts a resource record. The HUD never infers ownership from a raw Three.js object without an explicit default policy.

Recommended safe default for raw host textures: borrowed.

## Renderer lifecycle

Renderer is borrowed. The HUD may install only explicit listeners/hooks that it later removes. If the host disposes the renderer first, subsequent HUD operations produce a clear terminal/degraded state.

## Context/device loss

- invalidate GPU generation;
- stop encoding invalid resources;
- publish diagnostic/state;
- cancel or quarantine pending uploads;
- recreate only under approved policy;
- never retry infinitely;
- preserve CPU-side data only if ownership/lifetime allows;
- release old generation references when safe.

## Disposal order

Suggested:

1. mark disposing and reject new work;
2. disconnect pointer/observer/listener adapters;
3. abort pending loads/workers;
4. release widget/node drawables;
5. release backend font/glyph resources;
6. dispose render pools/materials/geometries/owned textures;
7. clear registries/queues/tree references;
8. publish zeroed final stats;
9. mark disposed.

Disposal is idempotent even after partial initialization.

## Development ledger

A resource ledger may record:

- resource ID/type/owner;
- creation generation;
- bytes;
- reference count;
- disposal state;
- source node/backend;
- stack only in opt-in debug mode.

Release tests assert baseline → create/use → dispose → baseline.
