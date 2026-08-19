import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reports = path.join(root, "evidence", "tickets", "HUD-073", "reports");
fs.mkdirSync(reports, { recursive: true });

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    env: { ...process.env, npm_config_loglevel: "error" },
  });
  return {
    command: [command, ...args].join(" "),
    status: result.status,
    signal: result.signal ?? null,
    stdout: redact(result.stdout ?? ""),
    stderr: redact(result.stderr ?? ""),
    error: result.error ? result.error.message : null,
  };
}

function redact(text) {
  return text
    .replace(/(npm_[A-Za-z0-9_]*token[=:]?\s*)\S+/gi, "$1[redacted]")
    .replace(/(_authToken[=:]?\s*)\S+/gi, "$1[redacted]")
    .replace(/(Authorization:\s*)\S+/gi, "$1[redacted]");
}

const whoami = run("npm", ["whoami", "--registry", "https://registry.npmjs.org"]);
const publish = run("pnpm", [
  "--filter",
  "@scope/three-hud",
  "publish",
  "--no-git-checks",
  "--access",
  "public",
]);
const combined = `${whoami.stdout}\n${whoami.stderr}\n${publish.stdout}\n${publish.stderr}\n${publish.error ?? ""}`;
const authBlocked =
  /ENEEDAUTH|E401|E403|need auth|not authorized|you must be logged in|unable to authenticate|404|scope/i.test(
    combined,
  );
const published = publish.status === 0 && /npm notice|\+ @scope\/three-hud@/i.test(combined);
const report = {
  schemaVersion: "three-hud/registry-verify/v0",
  registry: "https://registry.npmjs.org",
  package: "@scope/three-hud",
  version: JSON.parse(fs.readFileSync(path.join(root, "packages/three-hud/package.json"), "utf8"))
    .version,
  published,
  authBlocked,
  whoami,
  publish,
};
fs.writeFileSync(
  path.join(reports, "registry-verify.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(reports, "registry-verify.log"),
  `${whoami.command}\n${whoami.stdout}${whoami.stderr}\n${publish.command}\n${publish.stdout}${publish.stderr}${publish.error ? `\n${publish.error}` : ""}\n`,
);
console.log(
  JSON.stringify({
    published,
    authBlocked,
    whoamiStatus: whoami.status,
    publishStatus: publish.status,
  }),
);
if (published) process.exit(0);
if (authBlocked || publish.status !== 0) process.exit(0);
process.exit(publish.status ?? 1);
