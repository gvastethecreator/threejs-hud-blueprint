# Font and License Policy

## Package rule

The npm package and blueprint do not bundle third-party font binaries. Consumers provide font bytes/URLs, or examples use separately reviewed fixtures with explicit notices.

## Required font record

```ts
export type FontLicenseRecord = {
  family: string;
  sourceUrl: string;
  sourceRevision?: string;
  licenseId: string;
  licenseFile?: string;
  copyright?: string;
  redistributionAllowed: boolean;
  modificationAllowed?: boolean;
  attribution?: string;
  fileSha256?: string;
};
```

## Source-specific guidance

- **Departure Mono:** the upstream project declares SIL Open Font License and recommends 11 px increments for its pixel construction. Preserve its license and do not imply that arbitrary fractional scaling is pixel-perfect.
- **Google Fonts:** fonts are open source, but the exact license belongs to each family/file. Store the family metadata and license text for redistributed fixtures.
- **MEK Type:** several official family pages describe CC0/free-to-use terms. Verify the exact selected family/download rather than assigning one blanket license to every gallery asset.
- **User-supplied or commercial fonts:** the library may load them, but redistribution/export remains the host's responsibility.

## Runtime behavior

- Loading a font does not grant redistribution rights.
- The registry may retain provenance metadata but must not upload, transmit, or catalogue consumer fonts remotely.
- Diagnostics avoid embedding full font bytes or large glyph tables.
- Runtime rasterized bitmap atlases are ephemeral owned resources unless the host explicitly exports them.

## Repository fixtures

Every committed font fixture requires:

1. a license file;
2. source URL and revision;
3. SHA-256;
4. permitted test/example use;
5. entry in `THIRD_PARTY_NOTICES.md`;
6. confirmation that the fixture is included in package files only when intentionally approved.
