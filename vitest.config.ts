import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/three-hud/src/**/*.test.ts", "scripts/tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      reportsDirectory: "coverage/package",
      include: ["packages/three-hud/src/**/*.ts"],
      exclude: [
        "packages/three-hud/src/**/*.test.ts",
        "apps/**",
        "scripts/**",
        "e2e/**",
        "fixtures/**",
      ],
      thresholds: {
        statements: 40,
        branches: 30,
        functions: 40,
        lines: 40,
      },
    },
  },
});
