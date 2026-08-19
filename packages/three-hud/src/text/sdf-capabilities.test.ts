import { describe, expect, it } from "vitest";
import { layoutText, createMonospaceFace } from "./layoutText.js";
import { selectTextBackend } from "./contracts.js";
import { createSdfTextBackend } from "./sdf.js";
import { createBitmapTextBackend } from "./bitmap.js";

describe("sdf-capabilities", () => {
  it("does not claim complex-script shaping and does not recurse into a failed SDF backend", () => {
    const codes: string[] = [];
    layoutText("سلام", { font: "ui", size: 10 }, createMonospaceFace("ui"), (diagnostic) =>
      codes.push(diagnostic.code),
    );
    expect(codes).toContain("COMPLEX_SCRIPT_UNSUPPORTED");
    const sdf = createSdfTextBackend({ webgpuMode: "unsupported" });
    const rejected = selectTextBackend(sdf.capabilities, { rendererKind: "webgpu" });
    expect(rejected.status).toBe("unsupported");
    const fallback = createBitmapTextBackend();
    expect(fallback.capabilities.id).not.toBe(sdf.id);
    expect(selectTextBackend(fallback.capabilities, { rendererKind: "webgpu" }).backendId).toBe(
      "bitmap",
    );
  });
});
