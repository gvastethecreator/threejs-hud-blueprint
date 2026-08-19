import { describe, expect, it } from "vitest";
import { DeterministicClock } from "./clock.js";
import { createMockRenderer, createMockTextBackend } from "./mocks.js";

describe("testing-harness", () => {
  it("injects a deterministic clock and rejects double-dispose mocks", async () => {
    const clock = new DeterministicClock(1000);
    expect(clock.advance(16)).toBe(1016);
    const renderer = createMockRenderer("webgl");
    renderer.dispose();
    expect(() => renderer.dispose()).toThrow();
    const backend = createMockTextBackend();
    await backend.prepare({
      fontId: "mock",
      fontSize: 12,
      text: "",
      glyphs: [],
      lines: [],
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      direction: "ltr",
    });
    backend.dispose();
    expect(() =>
      backend.prepare({
        fontId: "mock",
        fontSize: 12,
        text: "",
        glyphs: [],
        lines: [],
        bounds: { x: 0, y: 0, width: 0, height: 0 },
        direction: "ltr",
      }),
    ).toThrow();
  });
});
