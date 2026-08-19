import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { HudNode } from "../core/HudNode.js";
import { createHudOverlayAdapter } from "./createHudOverlayAdapter.js";
import {
  overlayStateDiff,
  snapshotRendererOverlayState,
  type OverlayRendererLike,
  type OverlayVec4Target,
} from "./overlayState.js";

describe("blending", () => {
  it("rejects unsupported blend modes instead of approximating them", () => {
    const node = new HudNode();
    expect(node.blend).toBe("premultiplied");
    node.setBlend("additive");
    expect(node.blend).toBe("additive");
    expect(() => node.setBlend("multiply" as never)).toThrow(HudError);
  });

  it("leaves host scissor state unchanged after an overlay pass", () => {
    const scissor = { x: 9, y: 8, z: 40, w: 30 };
    const renderer = {
      isWebGLRenderer: true,
      autoClear: false,
      getScissor: (target: OverlayVec4Target) => {
        target.x = scissor.x;
        target.y = scissor.y;
        target.z = scissor.z;
        target.w = scissor.w;
        return target;
      },
      setScissor: (x: number, y: number, width: number, height: number) => {
        scissor.x = x;
        scissor.y = y;
        scissor.z = width;
        scissor.w = height;
      },
      getScissorTest: () => true,
      setScissorTest() {},
      getViewport: (target: OverlayVec4Target) => {
        target.x = 0;
        target.y = 0;
        target.z = 100;
        target.w = 100;
        return target;
      },
      setViewport() {},
      render() {},
    } as OverlayRendererLike;
    const before = snapshotRendererOverlayState(renderer);
    const adapter = createHudOverlayAdapter({
      renderer,
      cssViewport: { x: 0, y: 0, width: 50, height: 50 },
    });
    adapter.render([], { deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    expect(overlayStateDiff(before, snapshotRendererOverlayState(renderer))).toEqual([]);
    expect(scissor).toEqual({ x: 9, y: 8, z: 40, w: 30 });
    adapter.dispose();
  });
});
