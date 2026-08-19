# Security Policy

Three HUD is a client-side rendering library. Security reports should cover package supply chain, malformed asset handling, unsafe URL/font loading behavior, denial-of-service through unbounded resource requests, prototype pollution, worker lifecycle, or accidental data exposure in diagnostics.

## Supported versions

Before `v1`, only the latest published minor receives fixes unless a release note states otherwise.

## Reporting

Use a private GitHub security advisory for the configured repository. Do not open a public issue containing exploit details or credentials.

## Design expectations

- Font and image loads are explicit host actions.
- No remote endpoint is contacted at module import.
- External bytes are validated and bounded before GPU allocation.
- Diagnostics omit full text content by default.
- Release workflows use minimum required permissions.
