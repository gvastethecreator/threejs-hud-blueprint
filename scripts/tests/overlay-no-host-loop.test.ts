import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("overlay-state host loop contract", () => {
  it("package sources never call requestAnimationFrame or setAnimationLoop", () => {
    const root = join(process.cwd(), "packages", "three-hud", "src");
    const hits: string[] = [];
    walk(root, (file, source) => {
      if (file.endsWith(".test.ts")) return;
      for (const token of ["requestAnimationFrame", "setAnimationLoop"]) {
        if (source.includes(token)) hits.push(`${file} contains ${token}`);
      }
    });
    expect(hits).toEqual([]);
  });
});

function walk(directory: string, visit: (file: string, source: string) => void): void {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      walk(path, visit);
      continue;
    }
    if (path.endsWith(".ts")) visit(path, readFileSync(path, "utf8"));
  }
}
