# ADR-0014: Use GitHub for live state and local files for expanded briefs/evidence

- **Status:** accepted
- **Date:** 2026-08-19
- **Primary tickets:** HUD-005

## Context

Reference projects benefit from GitHub Projects plus local context, but two full authorities drift.

## Decision

GitHub owns state/assignment/dependencies/comments. Local files own seed scope, durable decisions, evidence, and handoff notes. Shared fields are synchronized.

## Consequences

- Offline/agent context remains rich.
- Remote state stays native.
- Sync protocol and conflict detection are required.

## Verification gate

Revisit only if one system can safely own all context without losing evidence.

## Out of scope

- This ADR does not grant support beyond the generated compatibility matrix.
- Implementation details may evolve if the public contract and decision remain intact.
