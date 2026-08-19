# Maintenance Model

## Cadence

- Dependency review: monthly or on a relevant security/renderer event.
- Compatibility evidence: every release and every Three.js/browser baseline change.
- Visual baseline review: only with an intentional renderer/layout change.
- Performance trend review: each minor release and performance-sensitive PR.
- Architecture boundary review: when adding a module, adapter, framework binding, or world-space mode.
- Font/notices review: whenever a fixture changes.

## Issue classes

- **Bug:** behavior contradicts a verified contract.
- **Compatibility regression:** a previously supported matrix cell fails.
- **Performance regression:** an enforceable budget or trend gate fails.
- **Feature:** new product behavior with explicit non-goals.
- **Adapter request:** integration kept outside core contracts.
- **Research:** uncertain feasibility, no release claim until a decision ticket.

## Deprecation

A deprecation includes replacement path, first deprecated version, earliest removal version, diagnostics where practical, and migration documentation. Capabilities must stop advertising a feature only when the versioned compatibility report changes.

## Architectural growth triggers

Split the single package only when at least one condition is proven:

- an optional backend materially harms install size or dependency policy;
- a framework adapter has an independent release cadence;
- consumers need separate versioning;
- ownership/boundary tests are clearer across package boundaries;
- usage evidence justifies the maintenance cost.

Do not split merely because source folders exist.
