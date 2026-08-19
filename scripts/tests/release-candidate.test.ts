import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  THREE_HUD_IMPLEMENTATION_STATUS,
  THREE_HUD_PACKAGE_VERSION,
} from "../../packages/three-hud/src/contracts/version.ts";

const root = path.resolve(import.meta.dirname, "../..");

describe("release-candidate", () => {
  it("freezes v0.1.0 package metadata, changelog, and experimental subpaths", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, "packages/three-hud/package.json"), "utf8"),
    ) as {
      version: string;
      files: string[];
      exports: Record<string, unknown>;
      peerDependencies: Record<string, string>;
    };
    const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
    const limitations = fs.readFileSync(path.join(root, "docs/api/KNOWN_LIMITATIONS.md"), "utf8");
    expect(pkg.version).toBe("0.1.0");
    expect(THREE_HUD_PACKAGE_VERSION).toBe(pkg.version);
    expect(THREE_HUD_IMPLEMENTATION_STATUS).toBe("v0.1.0");
    expect(pkg.files).toEqual(["dist", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md"]);
    expect(pkg.exports["./text/windfoil"]).toBeTruthy();
    expect(pkg.peerDependencies.three).toContain("0.185");
    expect(changelog).toContain("## 0.1.0");
    expect(changelog).toContain("@scope/three-hud/text/windfoil");
    expect(limitations).toContain("Windfoil is experimental");
    expect(limitations).toContain("never overwrite a published version");
  });
});
