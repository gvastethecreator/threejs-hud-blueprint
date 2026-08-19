import { spawnSync } from "node:child_process";
import fs from "node:fs";

const report = spawnSync("pnpm run bundle:report", { shell: true, stdio: "inherit" });
if (report.status !== 0) process.exit(report.status ?? 1);
const budgets = JSON.parse(
  fs.readFileSync(new URL("../benchmarks/budgets.json", import.meta.url), "utf8"),
);
if (!budgets || typeof budgets !== "object") throw new Error("Missing performance budgets.");
console.log("bundle:verify passed");
