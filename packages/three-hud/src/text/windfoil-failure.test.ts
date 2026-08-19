import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { HudError } from "../contracts/errors.js";
import { createBitmapTextBackend } from "./bitmap.js";
import { createGlyphRun } from "./contracts.js";
import { WINDFOIL_RESTORE_POLICY, diagnoseWindfoilScale } from "./windfoil/limits.js";
import { createWindfoilTextBackend } from "./windfoil.js";
import { defaultWindfoilMatrixFace } from "./windfoil/matrix.js";

describe("windfoil-failure", () => {
  it("publishes one device-loss transition and does not restore in place", () => {
    const codes: string[] = [];
    const backend = createWindfoilTextBackend({
      preprocess: defaultWindfoilMatrixFace(),
      onDiagnostic: (diagnostic) => codes.push(diagnostic.code),
    });
    expect(backend.restorePolicy).toBe(WINDFOIL_RESTORE_POLICY);
    backend.notifyDeviceLost();
    backend.notifyDeviceLost();
    expect(codes).toEqual(["WINDFOIL_DEVICE_LOST"]);
    expect(backend.runtimeState).toBe("lost");
    expect(() =>
      backend.prepare(
        createGlyphRun({ fontId: "ui", text: "", bounds: { x: 0, y: 0, width: 0, height: 0 } }),
      ),
    ).toThrow(HudError);
  });

  it("diagnoses out-of-range minification without taking down other backends", async () => {
    const codes: string[] = [];
    expect(diagnoseWindfoilScale(1 / 128, (diagnostic) => codes.push(diagnostic.code))).toBe(
      "minification",
    );
    expect(codes).toEqual(["WINDFOIL_MINIFICATION"]);
    const windfoil = createWindfoilTextBackend({ preprocess: defaultWindfoilMatrixFace() });
    const bitmap = createBitmapTextBackend();
    windfoil.dispose();
    expect(bitmap.capabilities.id).toBe("bitmap");
    const hud = new HUD({ referenceSize: { width: 64, height: 64 } });
    await hud.initialize();
    hud.update(0);
    hud.dispose();
  });
});
