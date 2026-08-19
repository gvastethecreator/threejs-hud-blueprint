# Validation

This file is the current validation note. It is not a release claim.

## Current truth

- Local v0.1 code exists.
- HUD-073 is closed locally without a registry publish.
- `release-status.json` has `releaseReady: false`.
- `pnpm run validate:release` fails at `assert-release-ready` by design until that flag is true.

## Commands

```bash
pnpm run validate:fast
pnpm run validate:full
pnpm run validate:release
```

Run `validate:fast` for local closeout. Run `validate:full` for renderer, text, or milestone work. Run `validate:release` only on a release-candidate commit.

Attach fresh command output. Do not claim a gate from an old log.

## What a green local closeout is not

A passing `validate:fast` run is not a published package. A local HUD-073 closeout is not an npm release.
