# Errors and Diagnostics

## Principles

- Unsupported capability is expected data, not always an exception.
- Programmer misuse and failed operations use typed errors.
- Diagnostics are bounded, serializable, privacy-safe, and host-routed.
- The library does not spam the console by default.
- A warning never silently changes product semantics unless the policy explicitly says so.

## Public error

```ts
class HudError extends Error {
  readonly code: HudErrorCode;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly cause?: unknown;
}
```

Proposed codes:

```text
HUD_INVALID_STATE
HUD_DISPOSED
HUD_INITIALIZATION_FAILED
HUD_RENDERER_UNSUPPORTED
HUD_RENDERER_NOT_INITIALIZED
HUD_RENDERER_STATE_RESTORE_FAILED
HUD_INVALID_VIEWPORT
HUD_INVALID_SCALE
HUD_LAYOUT_CYCLE
HUD_LAYOUT_NON_CONVERGENT
HUD_RESOURCE_LIMIT
HUD_RESOURCE_OWNERSHIP
FONT_LOAD_FAILED
FONT_FORMAT_UNSUPPORTED
FONT_PARSE_FAILED
FONT_ABORTED
FONT_MISSING_GLYPH
TEXT_BACKEND_UNAVAILABLE
TEXT_BACKEND_UNSUPPORTED
TEXT_BACKEND_EXPERIMENTAL_NOT_ALLOWED
TEXT_EFFECT_UNSUPPORTED
TEXT_COMPLEX_SHAPING_UNSUPPORTED
BITMAP_MANIFEST_INVALID
WINDFOIL_SHADER_FAILED
WINDFOIL_DEVICE_LOST
INPUT_INVALID_POINTER
```

## Diagnostic

```ts
interface HudDiagnostic {
  severity: "info" | "warning" | "error";
  code: HudDiagnosticCode;
  message: string;
  nodeId?: string;
  layerId?: string;
  backendId?: string;
  resourceId?: string;
  details?: Readonly<Record<string, unknown>>;
}
```

Details may include counts, sizes, profile IDs, and code-point ranges. They should not include full user text, font bytes, URLs containing credentials, or arbitrary object serialization.

## Capability state

```ts
type CapabilityState =
  | { status: "ready" }
  | { status: "experimental"; limitations: string[] }
  | { status: "pending"; reason: string }
  | { status: "unsupported"; code: string; reason: string; alternatives?: string[] }
  | { status: "failed"; code: string; reason: string };
```

The generated compatibility matrix is derived from real capability records plus executed tests.

## Rate limiting

Repeated diagnostics such as missing glyphs, fractional pixel policy, or clipped-out invalid resources are deduplicated by stable key and bounded count.

The host can request:

- first occurrence;
- count summary;
- debug detail;
- strict mode that throws selected warnings in tests.

## Development assertions

Development/test builds may assert:

- ownership violations;
- use after dispose;
- invalid finite values;
- duplicate IDs/keys;
- boundary contract mismatch;
- resource leak;
- unsupported experimental auto-selection;
- stale async publication.

Production builds preserve safe failure/diagnostic semantics without expensive histories.
