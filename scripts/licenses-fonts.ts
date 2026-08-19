import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BUNDLED_FONT_LICENSES,
  FONT_BINARY_EXTENSIONS,
} from "../packages/three-hud/src/text/fontLicenses.ts";

const verify = process.argv.includes("--verify");
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(repoRoot, "packages", "three-hud");
const binaries: string[] = [];

walk(packageRoot, (file) => {
  const relative = path.relative(repoRoot, file).replaceAll("\\", "/");
  if (relative.includes("/node_modules/") || relative.includes("/dist/")) return;
  const ext = path.extname(file).toLowerCase();
  if ((FONT_BINARY_EXTENSIONS as readonly string[]).includes(ext)) binaries.push(relative);
});

const report = {
  schemaVersion: "three-hud/font-licenses/v0",
  bundledLicenseCount: BUNDLED_FONT_LICENSES.length,
  bundledLicenses: BUNDLED_FONT_LICENSES,
  fontBinariesInPackage: binaries,
  packageFilesAllowlist: ["dist", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md"],
};

if (verify) {
  if (binaries.length)
    throw new Error(
      `font binaries must not ship in the package by default:\n${binaries.join("\n")}`,
    );
  if (BUNDLED_FONT_LICENSES.some((record) => record.redistributionAllowed && !record.licenseId)) {
    throw new Error("redistributable fonts must declare a licenseId");
  }
}

const out = path.join(repoRoot, "evidence", "tickets", "HUD-032", "reports", "font-licenses.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify({
    bundledLicenseCount: report.bundledLicenseCount,
    fontBinariesInPackage: binaries,
  }),
);

function walk(directory: string, visit: (file: string) => void): void {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const next = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(next, visit);
    else visit(next);
  }
}
