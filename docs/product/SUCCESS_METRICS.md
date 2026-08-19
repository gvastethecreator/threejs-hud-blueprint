# Success Metrics

Metrics are divided into release gates, adoption signals, and maintenance signals. Release gates are enforceable; adoption targets become meaningful only after publication.

## Release gates

- Complete showcase renders through public exports in the packed external consumer.
- Main entry has zero optional backend/parser/worker code.
- SSR import performs no browser/GPU/font side effects.
- Required visual scenarios pass for every claimed profile.
- Fixed-scene warm frames perform no package-owned allocations where promised.
- Value-only updates avoid full layout/geometry rebuild.
- Repeated lifecycle tests return owned resource counters to baseline.
- Compatibility matrix has no unsupported claim without evidence.
- Every redistributed third-party asset has a license record and notice.
- Public examples compile against generated declarations.

## Initial engineering targets

These are provisional budgets to be calibrated by HUD-065, not unconditional marketing promises:

- Showcase: fewer than 20 HUD draw calls after warm-up in the baseline profile.
- Static stress scene: approximately 100 primitives plus 2,000 glyphs.
- Main entry: target under 45 KiB minified+gzip excluding Three.js and optional backends.
- No Windfoil, SDF implementation, bitmap rasterizer, or font parser in the main entry.
- Value-only bar update: no layout recomputation outside affected label text.
- Dynamic counter update: prepare only newly required glyphs.
- Resource ledger: zero owned live resources after dispose.
- Ticket and docs validation: deterministic and offline.

## Adoption signals after release

- A first-time user reaches the getting-started HUD without deep imports.
- External issues identify product behavior rather than package/install breakage.
- Users employ at least two backend modes and multiple scale policies.
- At least one real project uses the inventory/hotbar or radial widget set.
- Optional backends remain independently removable from consumer bundles.

## Maintenance signals

- Three.js upgrade work is bounded to renderer/backend adapters rather than widgets.
- New widgets are compositions, not new renderer types.
- Compatibility reports and visual baselines can be regenerated without manual archaeology.
- Backlog documents remain indexes; expanded evidence stays in tickets/reports.
- No persistent global cache or worker becomes impossible to reset in tests.
