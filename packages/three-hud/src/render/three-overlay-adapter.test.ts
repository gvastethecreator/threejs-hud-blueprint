import { describe, expect, it, vi } from "vitest";
import { HudError } from "../contracts/errors.js";
import { HUD } from "../core/HUD.js";
import { HudNode } from "../core/HudNode.js";
import { Ring } from "../primitives/Ring.js";
import { createHudOverlayAdapter } from "./createHudOverlayAdapter.js";
import { OVERLAY_COLOR_POLICY } from "./overlayProfile.js";
import { SHAPE_RING } from "./overlayMaterial.js";
import {
  overlayStateDiff,
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

function createHostRenderer(kind: "webgl" | "webgpu") {
  const viewport = { x: 12, y: 24, z: 640, w: 360 };
  const scissor = { x: 40, y: 50, z: 200, w: 100 };
  let scissorTest = true;
  let renderTarget: unknown = { id: "host-rt" };
  let pixelRatio = 2;
  const clear = vi.fn();
  const renderer = {
    isWebGLRenderer: kind === "webgl",
    isWebGPURenderer: kind === "webgpu",
    autoClear: true,
    autoClearColor: true,
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
    clear,
    render: vi.fn(),
    viewport,
    scissor,
  };
  return renderer as OverlayRendererLike & typeof renderer;
}

async function hudWithRect(adapter: ReturnType<typeof createHudOverlayAdapter>) {
  const hud = new HUD({ referenceSize: { width: 100, height: 100 }, rendererAdapter: adapter });
  const layer = hud.createLayer({ id: "main" });
  const node = layer.add(new HudNode({ id: "panel", width: 40, height: 20, fill: 0x33ffaa }));
  node.setPosition(8, 4);
  await hud.initialize();
  return hud;
}

describe("three-overlay-adapter", () => {
  it("passes state-diff restore on WebGL and WebGPU host profiles", async () => {
    for (const kind of ["webgl", "webgpu"] as const) {
      const renderer = createHostRenderer(kind);
      const adapter = createHudOverlayAdapter({ renderer });
      expect(adapter.profile).toBe(kind);
      expect(adapter.colorPolicy).toEqual(OVERLAY_COLOR_POLICY);
      const before = snapshotRendererOverlayState(renderer);
      const hud = await hudWithRect(adapter);
      hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
      const after = snapshotRendererOverlayState(renderer);
      expect(overlayStateDiff(before, after)).toEqual([]);
      expect(adapter.lastQueue?.commands[0]?.kind).toBe("shape");
      expect(adapter.lastQueue?.commands[0]?.blend).toBe("premultiplied");
      hud.dispose();
    }
  });

  it("fails unsupported renderer kinds before allocating overlay resources", () => {
    expect(() =>
      createHudOverlayAdapter({ renderer: { isCSS2DRenderer: true } as OverlayRendererLike }),
    ).toThrow(HudError);
    expect(() => createHudOverlayAdapter({ renderer: {} as OverlayRendererLike })).toThrow(
      HudError,
    );
    try {
      createHudOverlayAdapter({ renderer: { isSVGRenderer: true } as OverlayRendererLike });
    } catch (error) {
      expect((error as HudError).code).toBe("CAPABILITY_MISMATCH");
    }
  });

  it("does not full-canvas clear unless clearDepth is explicitly configured", async () => {
    const renderer = createHostRenderer("webgl");
    const adapter = createHudOverlayAdapter({ renderer });
    const hud = await hudWithRect(adapter);
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    expect(renderer.clear).not.toHaveBeenCalled();
    hud.dispose();
    const depthRenderer = createHostRenderer("webgl");
    const depthAdapter = createHudOverlayAdapter({ renderer: depthRenderer, clearDepth: true });
    const depthHud = await hudWithRect(depthAdapter);
    depthHud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    expect(depthRenderer.clear).toHaveBeenCalledWith(false, true, false);
    depthHud.dispose();
  });

  it("restores host renderer state when a batch throws", async () => {
    const renderer = createHostRenderer("webgpu");
    renderer.render.mockImplementation(() => {
      throw new Error("batch failed");
    });
    const adapter = createHudOverlayAdapter({
      renderer,
      cssViewport: { x: 0, y: 0, width: 200, height: 100 },
    });
    const hud = await hudWithRect(adapter);
    const before = snapshotRendererOverlayState(renderer);
    expect(() => hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 })).toThrow(
      "batch failed",
    );
    expect(overlayStateDiff(before, snapshotRendererOverlayState(renderer))).toEqual([]);
    expect(renderer.autoClear).toBe(true);
    expect(renderer.viewport).toEqual({ x: 12, y: 24, z: 640, w: 360 });
    hud.dispose();
  });

  it("uploads encodeOverlayQueue ring instances, not leftover HUD-007 debug meshes", async () => {
    const renderer = createHostRenderer("webgl");
    const adapter = createHudOverlayAdapter({ renderer });
    const hud = new HUD({ referenceSize: { width: 100, height: 100 }, rendererAdapter: adapter });
    const layer = hud.createLayer({ id: "main" });
    layer.add(new Ring({ id: "ammo", innerRadius: 6, outerRadius: 12, fill: 0x3dff8a }));
    await hud.initialize();
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    const command = adapter.lastQueue?.commands.find(
      (item) => item.kind === "shape" && item.shape === "ring",
    );
    expect(command?.kind).toBe("shape");
    expect(adapter.debugInstanceShape(0)).toBe(SHAPE_RING);
    expect(adapter.debugMeshCount).toBeLessThanOrEqual(3);
    hud.dispose();
  });

  it("releases all adapter-owned Three.js resources on dispose", () => {
    const renderer = createHostRenderer("webgl");
    const adapter = createHudOverlayAdapter({ renderer });
    expect(adapter.ownedResourceCount).toBeGreaterThan(0);
    adapter.dispose();
    adapter.dispose();
    expect(adapter.ownedResourceCount).toBe(0);
    adapter.render([], { deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    expect(renderer.render).not.toHaveBeenCalled();
  });
});
