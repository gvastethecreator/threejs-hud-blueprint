# Security Policy

Three HUD is a client-side rendering library. Report supply-chain faults, unsafe font or URL loads, unbounded GPU allocation, prototype pollution, worker leaks, and private data in diagnostics.

## Supported versions

Before `v1`, only the latest published minor receives fixes. A release note can name an exception.

## Reporting

Use a private GitHub security advisory for the configured repository. Do not open a public issue that contains exploit details or credentials.

## Design expectations

- Font and image loads are explicit host actions.
- Module import does not contact a remote endpoint.
- External bytes are validated and bounded before GPU allocation.
- Diagnostics omit full text content by default.
- Release workflows use the minimum required permissions.
