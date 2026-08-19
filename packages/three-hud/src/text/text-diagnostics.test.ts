import { describe, expect, it } from "vitest";
import type { HudDiagnostic } from "../contracts/diagnostics.js";
import { createMonospaceFace } from "./layoutText.js";
import { layoutWithFallbacks, NOTDEF_GLYPH_ID } from "./textFallback.js";

describe("text-diagnostics", () => {
  it("omits full private text from missing-glyph diagnostics by default", () => {
    const received: HudDiagnostic[] = [];
    const face = {
      ...createMonospaceFace("latin"),
      glyphId: (code: number) => (code === 65 ? 1 : NOTDEF_GLYPH_ID),
    };
    const result = layoutWithFallbacks("A secret", { font: "ui", size: 10 }, [face], (diagnostic) =>
      received.push(diagnostic),
    );
    expect(result.missingCodePoints.length).toBeGreaterThan(0);
    expect(received.some((diagnostic) => diagnostic.code === "MISSING_GLYPH")).toBe(true);
    expect(JSON.stringify(received)).not.toContain("secret");
    expect(received[0]?.details && "codePoint" in received[0].details).toBe(true);
    const debug: HudDiagnostic[] = [];
    layoutWithFallbacks(
      "Z",
      { font: "ui", size: 10 },
      [face],
      (diagnostic) => debug.push(diagnostic),
      true,
    );
    expect(debug[0]?.details?.["text"]).toBe("Z");
  });
});
