import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { createGlyphRun } from "./contracts.js";
import { createSdfTextBackend } from "./sdf.js";

const empty = createGlyphRun({
  fontId: "ui",
  text: "",
  bounds: { x: 0, y: 0, width: 0, height: 0 },
});

describe("sdf-lifecycle", () => {
  it("ignores late prepare after dispose and keeps caches per backend instance", () => {
    const a = createSdfTextBackend();
    const b = createSdfTextBackend();
    const prepared = a.prepare(empty);
    a.dispose();
    expect(() => a.prepare(empty)).toThrow(HudError);
    expect(() => a.update(prepared, empty)).toThrow(HudError);
    const later = b.prepare(empty);
    expect(later.id).toBe(1);
    b.disposePrepared(later);
    b.dispose();
  });
});
