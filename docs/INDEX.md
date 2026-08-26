# Documentation Index

## Public API

- `api/GETTING_STARTED.md` — host-owned renderer overlay path.
- `api/WIDGETS.md` — widget recipes and playground labs.
- `api/TYPOGRAPHY.md` — font sources, backends, and license rules.
- `api/KNOWN_LIMITATIONS.md` — v0.1 backend status, scope, and rollback.

## Product

- `product/EXECUTIVE_SUMMARY.md` — short product intent, v0.1 in/out, current status.
- `product/PRODUCT_SPEC.md` — problem, audience, scope, non-goals, release definition.
- `product/REQUIREMENTS.md` — versioned functional/non-functional requirements and ticket traceability.
- `product/USER_STORIES.md` — primary jobs and acceptance narratives.
- `product/SUCCESS_METRICS.md` — adoption, quality, performance, and maintenance signals.
- `product/RISK_REGISTER.md` — technical, legal, scope, and maintenance risks.

## Architecture

- `architecture/ARCHITECTURE.md` — full system shape and dependency direction.
- `architecture/MODULE_CONTRACTS.md` — consumes/provides/forbidden module contracts.
- `architecture/PUBLIC_API.md` — proposed public TypeScript API.
- `architecture/VIEWPORT_AND_SCALING.md` — coordinate spaces, scale modes, DPR, snapping.
- `architecture/RENDER_PIPELINE.md` — overlay pass, commands, batching, clipping, color.
- `architecture/TEXT_SYSTEM.md` — font registry, glyph runs, layout, backends.
- `architecture/WINDFOIL_BACKEND.md` — analytic backend gate and design.
- `architecture/SDF_BACKEND.md` — compatibility backend contract.
- `architecture/BITMAP_BACKEND.md` — pixel-perfect font/atlas contract.
- `architecture/LAYOUT.md` — two-pass box, absolute, stack, grid.
- `architecture/INPUT.md` — pointer mapping, hit testing, propagation.
- `architecture/WIDGETS_AND_THEMES.md` — composition model and initial widget set.
- `architecture/RESOURCE_LIFECYCLE.md` — ownership, cancellation, failure, disposal.
- `architecture/ERRORS_AND_DIAGNOSTICS.md` — public errors and observable evidence.
- `architecture/PACKAGE_AND_EXPORTS.md` — workspace, package, subpaths, consumer fixture.
- `architecture/CODEMAP.md` — original target tree. Live source is `packages/three-hud/src`.

## Decisions

`adrs/` contains bounded architecture decisions. Proposed decisions become accepted only through their named gate.

## Research

- `research/REFERENCE_PROJECT_AUDIT.md` — patterns extracted from the author's other repositories.
- `research/WINDFOIL_RESEARCH.md` — upstream facts, integration questions, and spike evidence plan.
- `research/TEXT_BACKEND_COMPARISON.md` — analytic, SDF, and bitmap trade-offs.
- `research/SOURCES.md` — external source inventory.
- `research/THREEJS_R185_RENDERER_CAPABILITY_PROBE.md` — Three.js 0.185 backend detection facts for HUD-006.
- `research/WINDFOIL_PREPROCESS_PROVENANCE.md` — HUD-008 preprocess provenance and cubic policy.

## Quality

- `quality/TEST_STRATEGY.md`
- `quality/TEST_HARNESS.md`
- `quality/VISUAL_REGRESSION.md`
- `quality/VISUAL_THRESHOLDS.md`
- `quality/PERFORMANCE_BUDGETS.md`
- `quality/QUALITY_GATES.md`
- `quality/COMPATIBILITY_MATRIX.md`
- `quality/EVIDENCE_MODEL.md`
- `quality/VALIDATION.md` — current validation note. Not a release claim.

## Agent contracts

- `agents/issue-tracker.md` — GitHub Project 15 plus `.scratch/three-hud/` mirrors.
- `agents/triage-labels.md` — category and triage label map.
- `agents/domain.md` — which domain docs to read, and which stay local.

## Operations

- `operations/GITHUB_PROJECT.md`
- `operations/FONT_AND_LICENSE_POLICY.md`
- `operations/DEPENDENCY_POLICY.md`
- `operations/RELEASE_PROCESS.md`
- `operations/MAINTENANCE.md`

## Planning

- `../planning/BACKLOG.md`
- `../planning/EPICS.md`
- `../planning/MILESTONES.md`
- `../planning/tickets/`
