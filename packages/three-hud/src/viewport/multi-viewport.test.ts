import { describe, expect, it } from "vitest";
import { createHudOverlayAdapter } from "../render/createHudOverlayAdapter.js";
import type { OverlayRendererLike, OverlayVec4Target } from "../render/overlayState.js";

function writeVec4(
  source: { x: number; y: number; z: number; w: number },
  target: OverlayVec4Target,
): OverlayVec4Target {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
  target.w = source.w;
  return target;
}

describe("multi-viewport", () => {
  it("restores host viewport and scissor so a sibling split-screen viewport is not left overwritten", () => {
    const viewport = { x: 12, y: 24, z: 800, w: 360 };
    const scissor = { x: 12, y: 24, z: 800, w: 360 };
    let scissorTest = true;
    const seen: Array<{ viewport: typeof viewport; scissorTest: boolean }> = [];
    const renderer = {
      autoClear: true,
      autoClearColor: true,
      autoClearDepth: true,
      autoClearStencil: true,
      getPixelRatio: () => 2,
      getViewport: (target: OverlayVec4Target) => writeVec4(viewport, target),
      setViewport: (x: number, y: number, width: number, height: number) => {
        viewport.x = x;
        viewport.y = y;
        viewport.z = width;
        viewport.w = height;
      },
      getScissor: (target: OverlayVec4Target) => writeVec4(scissor, target),
      setScissor: (x: number, y: number, width: number, height: number) => {
        scissor.x = x;
        scissor.y = y;
        scissor.z = width;
        scissor.w = height;
      },
      getScissorTest: () => scissorTest,
      setScissorTest: (value: boolean) => {
        scissorTest = value;
      },
      render() {
        seen.push({ viewport: { ...viewport }, scissorTest });
      },
    } as OverlayRendererLike;
    const left = createHudOverlayAdapter({
      renderer,
      cssViewport: { x: 0, y: 0, width: 200, height: 180 },
    });
    const right = createHudOverlayAdapter({
      renderer,
      cssViewport: { x: 200, y: 0, width: 200, height: 180 },
    });
    left.render([], { deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    expect(viewport).toEqual({ x: 12, y: 24, z: 800, w: 360 });
    expect(scissorTest).toBe(true);
    right.render([], { deltaSeconds: 0, elapsedSeconds: 0, frame: 2 });
    expect(viewport).toEqual({ x: 12, y: 24, z: 800, w: 360 });
    expect(seen[0]?.viewport).toEqual({ x: 0, y: 0, z: 400, w: 360 });
    expect(seen[1]?.viewport).toEqual({ x: 400, y: 0, z: 400, w: 360 });
    expect(seen[0]?.scissorTest).toBe(true);
    left.dispose();
    right.dispose();
  });
});
