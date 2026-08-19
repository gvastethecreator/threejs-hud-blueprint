import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    sourcemap: true,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        "text/windfoil": resolve(import.meta.dirname, "src/text/windfoil.ts"),
        "text/sdf": resolve(import.meta.dirname, "src/text/sdf.ts"),
        "text/bitmap": resolve(import.meta.dirname, "src/text/bitmap.ts"),
        "testing/index": resolve(import.meta.dirname, "src/testing/index.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["three"],
    },
  },
});
