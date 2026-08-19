import fs from "node:fs";
const status = JSON.parse(
  fs.readFileSync(new URL("../release-status.json", import.meta.url), "utf8"),
);
if (status.releaseReady !== true) {
  console.error(`Release blocked: ${status.reason}`);
  process.exit(1);
}
console.log("Release status authorizes publication.");
