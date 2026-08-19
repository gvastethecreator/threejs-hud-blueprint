import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function run(command: string) {
  return spawnSync(command, { encoding: "utf8", shell: true, cwd: process.cwd() });
}

describe("e10 verify honesty", () => {
  it("fails visual-matrix --verify when webgl-baseline rows are CPU raster", () => {
    const result = run("pnpm exec tsx scripts/visual-matrix.ts --verify");
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(/none-cpu-raster|CPU raster/i);
  });

  it("fails compatibility --verify when webgl-baseline is labeled measured from CPU hashes", () => {
    const result = run("pnpm exec tsx scripts/compatibility-report.ts --verify");
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(/measured|CPU|webgl-baseline/i);
  });

  it("fails pnpm run visual:verify because the named entry is CPU-hash raster, not a GPU profile", () => {
    const result = run("pnpm run visual:verify");
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(/none-cpu-raster|CPU overlay hash|CPU-hash/i);
  });

  it("measures a this-run packed tarball main-entry gzip against the budget", () => {
    const result = run("pnpm run bundle:verify");
    const text = `${result.stdout}${result.stderr}`;
    expect(text).toMatch(/packedMainEntryGzipKiB:\s*[0-9.]+/);
    expect(text).toMatch(/budgetKiB:\s*[0-9.]+/);
    expect(text).not.toMatch(/leftover release\/\*\.tgz without measuring/i);
  });
});
