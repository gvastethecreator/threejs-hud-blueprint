import { ShaderMaterial, DataTexture, type Scene, type InstancedMesh } from "three";
import { describe, expect, it, vi } from "vitest";
import { HudError } from "../contracts/errors.js";
import { HUD } from "../core/HUD.js";
import { HudNode } from "../core/HudNode.js";
import { Ring } from "../primitives/Ring.js";
import { Label } from "../widgets/Label.js";
import { HudImage } from "../primitives/Image.js";
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
  it("keeps mixed paint order, crops partial glyphs, and borrows bound image textures", async () => {
    const renderer = createHostRenderer("webgl");
    const texture = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    const disposeTexture = vi.spyOn(texture, "dispose");
    const adapter = createHudOverlayAdapter({
      renderer,
      textures: new Map([["checker", texture]]),
    });
    const hud = new HUD({ referenceSize: { width: 100, height: 100 }, rendererAdapter: adapter });
    const layer = hud.createLayer({ id: "mixed" });
    layer.add(new HudNode({ width: 40, height: 30, fill: 0x333333 }));
    const label = layer.add(new Label({ text: "M", fontSize: 20 }));
    label.setClip({ x: 0, y: 0, width: label.size.width / 2, height: 40 });
    layer.add(new HudNode({ width: 10, height: 10, fill: 0xffffff }));
    layer.add(
      new HudImage({
        texture: { id: "checker", ready: true, filter: "nearest", ownership: "borrowed" },
      }),
    );
    layer.add(new Label({ text: "TOP", fontSize: 12 }));
    await hud.initialize();
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    const scene = renderer.render.mock.calls[0]?.[0] as Scene;
    const draws = (scene.children as InstancedMesh[])
      .filter((mesh) => mesh.count > 0)
      .sort((a, b) => a.renderOrder - b.renderOrder);
    expect(draws.map((mesh) => mesh.geometry.getAttribute("aShape").getX(0))).toEqual([
      0, 5, 0, 4, 5,
    ]);
    const glyph = adapter.lastQueue?.commands.find((command) => command.kind === "text");
    if (glyph?.kind !== "text") throw new Error("Missing text command");
    expect(adapter.debugInstanceUv(0)[2]).toBeLessThan(glyph.glyphs[0]!.u1);
    expect((draws[3]!.material as ShaderMaterial).uniforms["map"]?.value).toBe(texture);
    expect((draws[4]!.material as ShaderMaterial).uniforms["map"]?.value).toBe(
      (draws[1]!.material as ShaderMaterial).uniforms["map"]?.value,
    );
    const disposeMaterial = vi.spyOn(draws[0]!.material as ShaderMaterial, "dispose");
    hud.dispose();
    expect(disposeMaterial).toHaveBeenCalledTimes(1);
    expect(disposeTexture).not.toHaveBeenCalled();
    texture.dispose();
  });
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

  it("does not install ShaderMaterial on a WebGPU host renderer", () => {
    const renderer = createHostRenderer("webgpu");
    const adapter = createHudOverlayAdapter({ renderer });
    expect(adapter.profile).toBe("webgpu");
    expect(adapter.debugShapeMaterial()).not.toBeInstanceOf(ShaderMaterial);
    expect(adapter.debugTextMaterial()).not.toBeInstanceOf(ShaderMaterial);
    adapter.dispose();
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

  it("keeps authored instance scale and stores clip as local UV, not AABB squash", async () => {
    const renderer = createHostRenderer("webgl");
    const adapter = createHudOverlayAdapter({ renderer });
    const hud = new HUD({ referenceSize: { width: 100, height: 100 }, rendererAdapter: adapter });
    const layer = hud.createLayer({ id: "main" });
    const panel = layer.add(new HudNode({ id: "panel", width: 40, height: 20, fill: 0x33ffaa }));
    panel.setPosition(8, 4);
    panel.setClip({ x: 8, y: 4, width: 10, height: 20 });
    await hud.initialize();
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    const scale = adapter.debugInstanceScale(0);
    expect(scale.x).toBeCloseTo(0.8);
    expect(scale.y).toBeCloseTo(0.4);
    expect(scale.x).not.toBeCloseTo(0.2);
    const uv = adapter.debugShapeUv(0);
    expect(uv[0]).toBeCloseTo(0);
    expect(uv[1]).toBeCloseTo(0);
    expect(uv[2]).toBeCloseTo(0.25);
    expect(uv[3]).toBeCloseTo(1);
    hud.dispose();
  });

  it("maps a HUD y-down top-half clip onto PlaneGeometry v-up", async () => {
    const renderer = createHostRenderer("webgl");
    const adapter = createHudOverlayAdapter({ renderer });
    const hud = new HUD({ referenceSize: { width: 100, height: 100 }, rendererAdapter: adapter });
    const layer = hud.createLayer({ id: "main" });
    const panel = layer.add(new HudNode({ id: "panel", width: 40, height: 20, fill: 0x33ffaa }));
    panel.setPosition(8, 4);
    panel.setClip({ x: 8, y: 4, width: 40, height: 10 });
    await hud.initialize();
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    const scale = adapter.debugInstanceScale(0);
    expect(scale.x).toBeCloseTo(0.8);
    expect(scale.y).toBeCloseTo(0.4);
    const uv = adapter.debugShapeUv(0);
    expect(uv[0]).toBeCloseTo(0);
    expect(uv[2]).toBeCloseTo(1);
    expect(uv[1]).toBeCloseTo(0.5);
    expect(uv[3]).toBeCloseTo(1);
    expect(uv[1]).not.toBeCloseTo(0);
    hud.dispose();
  });

  it("places overlay instances with each layer's scale transform", async () => {
    const renderer = createHostRenderer("webgl");
    const adapter = createHudOverlayAdapter({
      renderer,
      cssViewport: { x: 0, y: 0, width: 200, height: 100 },
    });
    const hud = new HUD({
      referenceSize: { width: 400, height: 200 },
      rendererAdapter: adapter,
    });
    const contain = hud.createLayer({ id: "contain", scaleMode: "contain" });
    const native = hud.createLayer({ id: "native", scaleMode: "native" });
    contain.add(new HudNode({ id: "contain-rect", width: 80, height: 40, fill: 0xff3344 }));
    const nest = native.add(new HudNode({ id: "native-host", width: 80, height: 40 }));
    nest.add(new HudNode({ id: "native-rect", width: 80, height: 40, fill: 0x33ff44 }));
    await hud.initialize();
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    const containScale = adapter.debugInstanceScale(0);
    const nativeScale = adapter.debugInstanceScale(1);
    expect(nativeScale.x).not.toBeCloseTo(containScale.x);
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
