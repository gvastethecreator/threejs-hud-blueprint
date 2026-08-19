import { describe, expect, it } from "vitest";
import { createHudOverlayAdapter } from "./createHudOverlayAdapter.js";
import {
  restoreRendererOverlayState,
  snapshotRendererOverlayState,
  type OverlayRendererLike,
  type OverlayVec4Target,
} from "./overlayState.js";

function writeVec4(
  source: { x: number; y: number; z: number; w: number },
  target: OverlayVec4Target,
): OverlayVec4Target {
  if (target.copy) return target.copy(source);
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
  target.w = source.w;
  return target;
}

function createMockRenderer() {
  const viewport = { x: 12, y: 24, z: 640, w: 360 };
  const scissor = { x: 40, y: 50, z: 200, w: 100 };
  let scissorTest = true;
  let renderTarget: unknown = { id: "host-rt" };
  let pixelRatio = 2.5;
  const renders: Array<{
    autoClear: boolean;
    autoClearColor: boolean;
    autoClearDepth: boolean;
    scissorTest: boolean;
    scene: unknown;
    camera: unknown;
  }> = [];
  const renderer = {
    autoClear: false,
    autoClearColor: false,
    autoClearDepth: true,
    autoClearStencil: true,
    toneMapping: 4,
    outputColorSpace: "srgb",
    getPixelRatio: () => pixelRatio,
    setPixelRatio: (value: number) => {
      pixelRatio = value;
    },
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
    getRenderTarget: () => renderTarget,
    setRenderTarget: (target: unknown) => {
      renderTarget = target;
    },
    render: (scene: unknown, camera: unknown) => {
      renders.push({
        autoClear: renderer.autoClear,
        autoClearColor: renderer.autoClearColor,
        autoClearDepth: renderer.autoClearDepth,
        scissorTest,
        scene,
        camera,
      });
    },
    renders,
  };
  return renderer as OverlayRendererLike & { renders: typeof renders };
}

describe("overlay-state", () => {
  it("restores a non-default viewport, scissor, render target, auto-clear, and pixel ratio", () => {
    const renderer = createMockRenderer();
    const adapter = createHudOverlayAdapter({ renderer });
    adapter.render([], { deltaSeconds: 0.016, elapsedSeconds: 1, frame: 1 });
    expect(renderer.autoClear).toBe(false);
    expect(renderer.autoClearColor).toBe(false);
    expect(renderer.autoClearDepth).toBe(true);
    expect(renderer.autoClearStencil).toBe(true);
    expect(renderer.getScissorTest?.()).toBe(true);
    expect(renderer.getPixelRatio?.()).toBe(2.5);
    expect(renderer.getRenderTarget?.()).toEqual({ id: "host-rt" });
    const viewport = renderer.getViewport?.({
      x: 0,
      y: 0,
      z: 0,
      w: 0,
      copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        this.w = vector.w;
        return this;
      },
    });
    expect(viewport).toMatchObject({ x: 12, y: 24, z: 640, w: 360 });
    expect(renderer.renders).toHaveLength(1);
    expect(renderer.renders[0]?.autoClearColor).toBe(false);
    expect(renderer.renders[0]?.scissorTest).toBe(false);
    adapter.dispose();
  });

  it("does not clear color during the overlay pass", () => {
    const renderer = createMockRenderer();
    renderer.autoClear = true;
    renderer.autoClearColor = true;
    const snapshot = snapshotRendererOverlayState(renderer);
    const adapter = createHudOverlayAdapter({ renderer });
    adapter.render([], { deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    expect(renderer.renders[0]?.autoClear).toBe(false);
    expect(renderer.renders[0]?.autoClearColor).toBe(false);
    restoreRendererOverlayState(renderer, snapshot);
    expect(renderer.autoClear).toBe(true);
    expect(renderer.autoClearColor).toBe(true);
    adapter.dispose();
  });

  it("honors explicit clearDepth without leaving that flag on the host", () => {
    const renderer = createMockRenderer();
    renderer.autoClearDepth = false;
    const adapter = createHudOverlayAdapter({ renderer, clearDepth: true });
    adapter.render([], { deltaSeconds: 0, elapsedSeconds: 0, frame: 2 });
    expect(renderer.renders[0]?.autoClearDepth).toBe(true);
    expect(renderer.autoClearDepth).toBe(false);
    adapter.dispose();
  });

  it("disposes overlay-owned Three.js resources", () => {
    const renderer = createMockRenderer();
    const adapter = createHudOverlayAdapter({ renderer });
    expect(adapter.ownedResourceCount).toBeGreaterThan(0);
    adapter.dispose();
    adapter.dispose();
    expect(adapter.ownedResourceCount).toBe(0);
    adapter.render([], { deltaSeconds: 0, elapsedSeconds: 0, frame: 3 });
    expect(renderer.renders).toHaveLength(0);
  });
});
