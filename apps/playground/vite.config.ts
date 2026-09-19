import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const playgroundRoot = path.dirname(fileURLToPath(import.meta.url));
const packageSrc = path.resolve(playgroundRoot, "../../packages/three-hud/src");
const pagesBase = process.env.PLAYGROUND_BASE;
const base =
  pagesBase && pagesBase.length > 0 ? (pagesBase.endsWith("/") ? pagesBase : `${pagesBase}/`) : "/";

export default defineConfig({
  base,
  server: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
  resolve: {
    alias: [
      {
        find: "@scope/three-hud/text/windfoil",
        replacement: path.join(packageSrc, "text/windfoil.ts"),
      },
      { find: "@scope/three-hud/text/sdf", replacement: path.join(packageSrc, "text/sdf.ts") },
      {
        find: "@scope/three-hud/text/bitmap",
        replacement: path.join(packageSrc, "text/bitmap.ts"),
      },
      { find: "@scope/three-hud", replacement: path.join(packageSrc, "index.ts") },
    ],
  },
});
