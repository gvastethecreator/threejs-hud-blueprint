import type { HudDiagnosticHandler } from "../../contracts/diagnostics.js";
import { emitDiagnostic } from "../../contracts/diagnostics.js";

export const WINDFOIL_SCALE_LIMITS = Object.freeze({
  min: 1 / 64,
  max: 256,
});

export const WINDFOIL_RESTORE_POLICY = "unsupported" as const;

export type WindfoilRuntimeState = "live" | "lost" | "disposed";

export function diagnoseWindfoilScale(
  scale: number,
  onDiagnostic?: HudDiagnosticHandler,
  nodeId?: string,
): "ok" | "minification" | "magnification" {
  if (scale < WINDFOIL_SCALE_LIMITS.min) {
    emitDiagnostic(onDiagnostic, {
      severity: "warning",
      code: "WINDFOIL_MINIFICATION",
      message: "Glyph scale is below the evidenced Windfoil minification range.",
      ...(nodeId ? { nodeId } : {}),
      details: { scale, min: WINDFOIL_SCALE_LIMITS.min },
    });
    return "minification";
  }
  if (scale > WINDFOIL_SCALE_LIMITS.max) {
    emitDiagnostic(onDiagnostic, {
      severity: "warning",
      code: "WINDFOIL_MAGNIFICATION",
      message: "Glyph scale is above the evidenced Windfoil magnification range.",
      ...(nodeId ? { nodeId } : {}),
      details: { scale, max: WINDFOIL_SCALE_LIMITS.max },
    });
    return "magnification";
  }
  return "ok";
}
