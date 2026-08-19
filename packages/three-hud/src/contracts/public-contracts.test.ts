import { describe, expect, it, vi } from "vitest";
import {
  HUD,
  HudError,
  emitDiagnostic,
  probeRendererCapabilities,
  type HudDiagnostic,
} from "../index.js";

describe("public-contracts", () => {
  it("errors expose code, message, safe details, and optional cause", () => {
    const cause = new Error("parser");
    const error = new HudError(
      "FONT_LOAD_FAILED",
      "Font bytes are invalid.",
      { format: "CFF" },
      cause,
    );
    expect(error.code).toBe("FONT_LOAD_FAILED");
    expect(error.message).toBe("Font bytes are invalid.");
    expect(error.details).toEqual({ format: "CFF" });
    expect(error.cause).toBe(cause);
    expect(JSON.stringify({ code: error.code, details: error.details })).toBe(
      '{"code":"FONT_LOAD_FAILED","details":{"format":"CFF"}}',
    );
  });

  it("diagnostics are delivered through a callback without console output", () => {
    const log = vi.spyOn(console, "info");
    const received: HudDiagnostic[] = [];
    const hud = new HUD({
      referenceSize: { width: 100, height: 100 },
      onDiagnostic: (diagnostic) => received.push(diagnostic),
    });
    const diagnostic: HudDiagnostic = {
      severity: "warning",
      code: "CAPABILITY_MISMATCH",
      message: "Windfoil skipped.",
    };
    hud.reportDiagnostic(diagnostic);
    emitDiagnostic(undefined, diagnostic);
    expect(received).toEqual([diagnostic]);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
    hud.dispose();
  });

  it("capability results explain unsupported Windfoil on WebGL2", async () => {
    const report = await probeRendererCapabilities({
      isWebGPURenderer: true,
      initialized: true,
      hasInitialized: () => true,
      backend: { isWebGLBackend: true },
      getPixelRatio: () => 1,
    });
    expect(report.windfoil.supported).toBe(false);
    expect(report.windfoil.reasons[0]?.code).toBe("WINDFOIL_WEBGL2_FALLBACK");
  });
});
