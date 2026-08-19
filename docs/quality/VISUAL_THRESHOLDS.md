# Visual diff thresholds

CPU overlay rasters (primitives, widgets, showcase) use exact RGBA hashes. Any mismatch fails `--verify`. Platform-specific screenshot baselines are not claimed in v0.1.

| Scenario class  | Capture                        | Threshold                         | Blocking |
| --------------- | ------------------------------ | --------------------------------- | -------- |
| primitive       | CPU raster of encoded commands | exact hash                        | yes      |
| widget          | CPU raster of encoded commands | exact hash                        | yes      |
| showcase        | CPU raster of encoded commands | exact hash                        | yes      |
| layout          | CPU raster / layout report     | exact hash                        | yes      |
| playground e2e  | Playwright canvas present      | non-blank size; no pixel identity | no       |
| webgpu-windfoil | experimental spike             | report only unless policy says so | no       |

Baselines live in `fixtures/visual/*.json` and must not contain licensed font binaries.
