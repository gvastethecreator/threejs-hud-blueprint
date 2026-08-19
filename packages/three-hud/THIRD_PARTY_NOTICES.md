# Third-Party Notices

This blueprint does not include Windfoil source code, Troika source code, or third-party font binaries. The records below define the review obligations before implementation or redistribution.

## Windfoil

- Project: Windfoil by Matt DesLauriers / texel-org
- License: Apache License 2.0
- Intended use: algorithm/reference and, only after approval, adapted analytic text backend code
- Required action: preserve Apache-2.0 copyright/license notices for adapted files and document modifications
- Additional caution: upstream documents uncertainty about possible overlap with prior techniques or patents; this caution must remain visible in project legal documentation

## Initial SDF implementation

- Status: not selected
- Requirement: record exact package/version/license, shaping behavior, renderer compatibility, worker/resource ownership, and notice obligations in the SDF selection ADR

## opentype.js or alternative font parser

- Status: not selected for production
- Requirement: record exact parser/version/license and supported font formats before adding it as an optional dependency

## Fonts

No font is bundled by default.

Each redistributed fixture or example font requires an inventory entry containing:

- family/file;
- author/source;
- exact license;
- redistribution permission;
- required notice/license file;
- source hash;
- package paths that contain it.

Departure Mono, MEK fonts, and Google Fonts are external examples only until an individual approved record exists.
