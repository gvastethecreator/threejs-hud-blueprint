import type { HudErrorDetails } from "./errors.js";

export type HudDiagnosticSeverity = "info" | "warning" | "error";

export type HudDiagnostic = Readonly<{
  severity: HudDiagnosticSeverity;
  code: string;
  message: string;
  nodeId?: string;
  layerId?: string;
  backendId?: string;
  details?: HudErrorDetails;
}>;

export type HudDiagnosticHandler = (diagnostic: HudDiagnostic) => void;

export function emitDiagnostic(
  handler: HudDiagnosticHandler | undefined,
  diagnostic: HudDiagnostic,
): void {
  handler?.(diagnostic);
}
