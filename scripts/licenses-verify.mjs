import { spawnSync } from "node:child_process";

const result = spawnSync("pnpm run licenses:fonts -- --verify", { shell: true, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log("licenses:verify passed");
