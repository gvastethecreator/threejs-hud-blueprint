import fs from "node:fs";
import { spawnSync } from "node:child_process";

const pack = spawnSync("pnpm --filter @scope/three-hud pack --dry-run", {
  shell: true,
  encoding: "utf8",
});
if (pack.status !== 0) {
  console.error(pack.stdout);
  console.error(pack.stderr);
  process.exit(pack.status ?? 1);
}
const changelog = fs.readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8");
if (!changelog.includes("## 0.1.0")) throw new Error("CHANGELOG missing 0.1.0 section");
console.log("release:dry-run passed");
console.log(pack.stdout.split("\n").slice(0, 20).join("\n"));
