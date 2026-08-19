import { HudError } from "../contracts/errors.js";
import type { OverlayRendererLike } from "./overlayState.js";

export type OverlayRendererProfile = "webgl" | "webgpu" | "unclassified";

export const OVERLAY_COLOR_POLICY = Object.freeze({
  toneMapped: false,
  outputColorSpace: "srgb",
  blend: "premultiplied" as const,
  depthTest: false,
  depthWrite: false,
  clearsColor: false,
});

const UNSUPPORTED_FLAGS = ["isCSS2DRenderer", "isCSS3DRenderer", "isSVGRenderer"] as const;

export function resolveOverlayRendererProfile(
  renderer: OverlayRendererLike,
): OverlayRendererProfile {
  const record = renderer as OverlayRendererLike & Record<string, unknown>;
  for (const flag of UNSUPPORTED_FLAGS) {
    if (record[flag] === true) {
      throw new HudError(
        "CAPABILITY_MISMATCH",
        `Renderer ${flag} is not a supported HUD overlay target.`,
        { flag },
      );
    }
  }
  if (record.isWebGLRenderer === true) return "webgl";
  if (record.isWebGPURenderer === true) return "webgpu";
  if (typeof renderer.render === "function") return "unclassified";
  throw new HudError(
    "CAPABILITY_MISMATCH",
    "Host renderer is not a WebGLRenderer or WebGPURenderer.",
    {
      kind: "unknown",
    },
  );
}
