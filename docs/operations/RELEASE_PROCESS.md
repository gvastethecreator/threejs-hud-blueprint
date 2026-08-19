# Release Process

## Version policy

Use SemVer. Before `1.0`, breaking public API changes increment the minor version and are documented prominently. Patch releases must not broaden compatibility claims without evidence.

## Release candidate sequence

1. Freeze the planned ticket set and resolve all P0 blockers.
2. Update dependency lock and record exact environment/tool versions.
3. Run `pnpm run validate:release` from a clean checkout.
4. Pack the actual npm tarball.
5. Install it into the isolated external consumer and build/run the vanilla example.
6. Generate package file, export, declaration, size, tree-shaking, license, compatibility, visual, benchmark, and memory reports.
7. Verify the Windfoil exposure level matches ADR-0006 and HUD-011 evidence.
8. Verify no third-party fonts or unapproved artifacts are in the tarball.
9. Produce changelog and release notes from closed tickets/ADRs.
10. Perform npm publish provenance dry-run.
11. Tag the exact verified commit.
12. Publish, then install the registry artifact in a clean smoke consumer.
13. Attach release evidence manifest and close HUD-073.

## Required artifacts

```text
release/
├─ three-hud-<version>.tgz
├─ package-files.json
├─ exports-report.json
├─ declarations-report.json
├─ bundle-report.json
├─ licenses.json
├─ compatibility.json
├─ visual-summary.json
├─ benchmark-summary.json
├─ resource-ledger.json
└─ release-evidence.json
```

## Rollback

- Never overwrite an npm version.
- Deprecate a bad version with a precise message.
- Publish a corrective patch from a verified commit.
- Preserve the failed artifact and evidence for diagnosis.
