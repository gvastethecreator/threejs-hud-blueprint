import { describe, expect, it } from "vitest";
import type { TextBackendCapabilities } from "../contracts/capabilities.js";
import { LinearBar } from "../widgets/LinearBar.js";
import { createBitmapTextBackend } from "./bitmap.js";
import { createGlyphRun, selectTextBackend } from "./contracts.js";
import { createSdfTextBackend } from "./sdf.js";
import { PlannedTextBackend } from "./stub.js";
import { createWindfoilTextBackend } from "./windfoil.js";

const backends = [
  createBitmapTextBackend(),
  createSdfTextBackend(),
  createWindfoilTextBackend({ exposure: "experimental" }),
  new PlannedTextBackend(
    {
      id: "mock",
      rendererKinds: ["webgl", "webgpu"],
      scalableCoverage: true,
      pixelPerfect: false,
      dynamicGlyphs: true,
      colorGlyphs: false,
      rotation: "full",
      deviceLossRecovery: true,
      status: "supported",
    },
    "HUD-034",
  ),
];

describe("text-backend-contract", () => {
  it("lets widgets use text contracts without importing a backend module", () => {
    const bar = new LinearBar({ value: 1 });
    expect(bar.fillNode).toBeTruthy();
    expect("capabilities" in bar).toBe(false);
  });

  it("rejects a font/style combination before creating a drawable", () => {
    const windfoil = createWindfoilTextBackend();
    const rejected = selectTextBackend(windfoil.capabilities, {
      rendererKind: "webgl",
      allowExperimental: true,
    });
    expect(rejected.status).toBe("unsupported");
    expect(rejected.reasons.some((reason) => reason.includes("webgl"))).toBe(true);
  });

  it("freezes glyph runs as immutable snapshots", () => {
    const run = createGlyphRun({
      fontId: "ui",
      text: "A",
      fontSize: 12,
      glyphs: [
        {
          glyphId: 1,
          glyphKey: "65",
          cluster: 0,
          x: 0,
          y: 0,
          advance: 8,
          advanceX: 8,
          advanceY: 0,
          offsetX: 0,
          offsetY: 0,
          line: 0,
        },
      ],
      bounds: { x: 0, y: 0, width: 8, height: 12 },
    });
    expect(Object.isFrozen(run)).toBe(true);
    expect(Object.isFrozen(run.glyphs)).toBe(true);
    expect(() => {
      (run as { text: string }).text = "B";
    }).toThrow();
  });

  it("classifies backend capabilities as unavailable, unsupported, experimental, or ready", () => {
    const table = backends.map((backend) => ({
      id: backend.id,
      webgl: selectTextBackend(backend.capabilities, {
        rendererKind: "webgl",
        allowExperimental: true,
      }).status,
      webgpu: selectTextBackend(backend.capabilities, {
        rendererKind: "webgpu",
        allowExperimental: true,
      }).status,
      pixel: selectTextBackend(backend.capabilities, {
        rendererKind: "webgpu",
        pixelPerfect: true,
        allowExperimental: true,
      }).status,
    }));
    expect(table.find((row) => row.id === "bitmap")?.webgl).toBe("unavailable");
    expect(table.find((row) => row.id === "sdf")?.webgl).toBe("ready");
    expect(table.find((row) => row.id === "windfoil")?.webgpu).toBe("experimental");
    expect(table.find((row) => row.id === "mock")?.webgpu).toBe("ready");
    expect(table.find((row) => row.id === "windfoil")?.webgl).toBe("unsupported");
    expect(selectTextBackend(supported("mock"), { rendererKind: "webgl" }).status).toBe("ready");
  });
});

function supported(id: string): TextBackendCapabilities {
  return {
    id,
    rendererKinds: ["webgl", "webgpu"],
    scalableCoverage: true,
    pixelPerfect: false,
    dynamicGlyphs: true,
    colorGlyphs: false,
    rotation: "full",
    deviceLossRecovery: true,
    status: "supported",
  };
}
