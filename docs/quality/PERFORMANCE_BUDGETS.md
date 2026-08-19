# Performance Budgets

## Status

The values below are **provisional engineering gates**, not universal performance promises. HUD-065 calibrates them on named reference profiles and records medians plus p95/p99 rather than a single favorable frame.

## Reference scenes

| Scene             | Nodes | Glyphs | Clips | Dynamic changes             |
| ----------------- | ----: | -----: | ----: | --------------------------- |
| Small HUD         |    40 |    250 |     2 | 6 values/frame              |
| Standard showcase |   120 |  1,200 |     8 | 20 values/frame             |
| Text-heavy        |   180 |  3,000 |    12 | one counter + color changes |
| Inventory stress  |   550 |  1,500 |    20 | selection + 10 quantities   |
| Static stress     | 1,000 |  5,000 |    32 | none                        |

## Provisional budgets

| Metric                                |             Fast/reference gate |              Release ceiling | Notes                                   |
| ------------------------------------- | ------------------------------: | ---------------------------: | --------------------------------------- |
| steady-state JS allocations           |                0 B/frame target |          no unbounded growth | measured after warm-up                  |
| standard showcase update + layout p95 |                        ≤ 1.5 ms |                     ≤ 2.5 ms | layout should be mostly clean           |
| standard queue/batch encoding p95     |                        ≤ 1.0 ms |                     ≤ 2.0 ms | excludes host game render               |
| value-only update invalidated nodes   | bounded to affected composition |        no root-wide relayout | asserted structurally                   |
| primitive draw calls                  |         ≤ declared batch budget | regression ≤ 10% without ADR | backend-specific                        |
| owned resources after dispose         |                        baseline |                     baseline | exact ledger equality                   |
| main entry minified+gzip              |            ≤ 30 KiB provisional |                     ≤ 40 KiB | excludes Three.js and optional subpaths |
| bitmap subpath minified+gzip          |            ≤ 20 KiB provisional |                     ≤ 30 KiB | excludes host font assets               |
| SDF adapter subpath own code          |            ≤ 20 KiB provisional |                     ≤ 30 KiB | excludes optional peer implementation   |
| Windfoil adapter own code             |             measured after gate |               decision-owned | report parser separately                |

## Measurement rules

- Warm up before sampling.
- Record browser, OS, CPU, GPU, power mode, browser flags, dependency versions, and resolution.
- Separate CPU update/layout/encoding, GPU frame cost, font preprocessing, upload, and first-render latency.
- Do not average away spikes; report median, p95, p99, maximum, and sample count.
- Compare only compatible profiles.
- A budget increase requires a ticket, before/after evidence, and an ADR when it changes a public claim.

## Optimization priorities

1. avoid work through dirty boundaries;
2. avoid allocations in stable frames;
3. reuse geometry/materials/buffers;
4. batch only where semantic ordering and clipping remain correct;
5. optimize the measured bottleneck, not theoretical draw-call count alone.
