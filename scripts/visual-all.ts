import { spawnSync } from "node:child_process";

const verify = process.argv.includes("--verify");
const commands: Array<{ cmd: string; args: string[] }> = [
  { cmd: "pnpm", args: ["run", "visual:overlay"] },
  { cmd: "pnpm", args: ["run", "visual:clipping"] },
  { cmd: "pnpm", args: ["run", "visual:primitives", ...(verify ? ["--", "--verify"] : [])] },
  { cmd: "pnpm", args: ["run", "visual:layout", "--", "--verify"] },
  {
    cmd: "pnpm",
    args: ["run", "visual:widgets", "--", ...(verify ? ["--verify"] : []), "all"],
  },
  { cmd: "pnpm", args: ["run", "visual:showcase", "--", ...(verify ? ["--verify"] : [])] },
  {
    cmd: "pnpm",
    args: ["exec", "tsx", "scripts/visual-matrix.ts", ...(verify ? ["--verify"] : [])],
  },
];

for (const { cmd, args } of commands) {
  const result = spawnSync(cmd, args, { shell: true, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log("visual:all passed");
