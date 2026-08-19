import { describe, expect, it, vi } from "vitest";
import { createHudOverlayAdapter } from "../render/createHudOverlayAdapter.js";
import type { OverlayRendererLike } from "../render/overlayState.js";
import {
  cssRectToDevice,
  drawingBufferMismatchDiagnostic,
  readHostSurface,
} from "./hostSurface.js";

describe("drawing-buffer", () => {
  it("reports a mismatch when the drawing buffer is not CSS size times DPR", () => {
    const matched = readHostSurface({
      getPixelRatio: () => 2,
      getSize: (target) => {
        target.x = 100;
        target.y = 50;
        return target;
      },
      getDrawingBufferSize: (target) => {
        target.x = 200;
        target.y = 100;
        return target;
      },
    });
    expect(matched.drawingBufferMatchesCss).toBe(true);
    expect(drawingBufferMismatchDiagnostic(matched)).toBeNull();
    const mismatched = readHostSurface({
      getPixelRatio: () => 2,
      getSize: (target) => {
        target.x = 100;
        target.y = 50;
        return target;
      },
      getDrawingBufferSize: (target) => {
        target.x = 180;
        target.y = 50;
        return target;
      },
    });
    expect(mismatched.drawingBufferMatchesCss).toBe(false);
    expect(drawingBufferMismatchDiagnostic(mismatched)?.code).toBe("DRAWING_BUFFER_MISMATCH");
  });

  it("applies DPR once from CSS to device space and never calls renderer setSize", () => {
    const once = cssRectToDevice({ x: 10, y: 20, width: 400, height: 300 }, 2);
    expect(once).toEqual({ x: 20, y: 40, width: 800, height: 600 });
    const twice = cssRectToDevice(once, 2);
    expect(twice.width).toBe(1600);
    const setSize = vi.fn();
    const renderer = {
      getPixelRatio: () => 2,
      setSize,
      getViewport: (target: { x: number; y: number; z: number; w: number }) => {
        target.x = 0;
        target.y = 0;
        target.z = 800;
        target.w = 600;
        return target;
      },
      setViewport() {},
      getScissor: (target: { x: number; y: number; z: number; w: number }) => {
        target.x = 0;
        target.y = 0;
        target.z = 800;
        target.w = 600;
        return target;
      },
      setScissor() {},
      getScissorTest: () => false,
      setScissorTest() {},
      render() {},
    } as OverlayRendererLike & { setSize: typeof setSize };
    const adapter = createHudOverlayAdapter({
      renderer,
      cssViewport: { x: 0, y: 0, width: 400, height: 300 },
    });
    adapter.render([], { deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    expect(setSize).not.toHaveBeenCalled();
    adapter.dispose();
  });
});
