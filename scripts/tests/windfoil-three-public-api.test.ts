import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("windfoil-three-spike public API inventory", () => {
  it("does not import private Three.js renderer internals", () => {
    const source = readFileSync(
      join(process.cwd(), "packages/three-hud/src/text/windfoil/threeSpike.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/three\/src\//);
    expect(source).not.toMatch(/WebGPUBackend/);
    expect(source).not.toMatch(/\.prototype\./);
  });
});
