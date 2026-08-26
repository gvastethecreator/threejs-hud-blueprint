import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { Line } from "../primitives/Line.js";
import { Ring } from "../primitives/Ring.js";
import { RoundedRect } from "../primitives/RoundedRect.js";
import { Label } from "../widgets/Label.js";
import { InventoryGrid } from "../widgets/InventoryGrid.js";
import { createHudOverlayAdapter } from "./createHudOverlayAdapter.js";
import { createSdfTextBackend } from "../text/sdf.js";
import { rasterCommands, hashRgba } from "./overlayRaster.js";
import type { OverlayRendererLike, OverlayVec4Target } from "./overlayState.js";

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

function createHostRenderer() {
  const viewport = { x: 0, y: 0, z: 200, w: 100 };
  const scissor = { x: 0, y: 0, z: 200, w: 100 };
  return {
    isWebGLRenderer: true,
    autoClear: true,
    autoClearColor: true,
    autoClearDepth: true,
    autoClearStencil: true,
    getPixelRatio: () => 1,
    getViewport: (target: OverlayVec4Target) => writeVec4(viewport, target),
    setViewport: () => {},
    getScissor: (target: OverlayVec4Target) => writeVec4(scissor, target),
    setScissor: () => {},
    getScissorTest: () => false,
    setScissorTest: () => {},
    getRenderTarget: () => null,
    setRenderTarget: () => {},
    render: () => {},
    getSize: (target: { x: number; y: number; set?: (x: number, y: number) => unknown }) => {
      target.set?.(200, 100);
      target.x = 200;
      target.y = 100;
      return target;
    },
  } as OverlayRendererLike;
}

describe("overlay-queue", () => {
  it("encodes ring, line, rounded-rect, and label from the draw queue not AABB leftovers", async () => {
    const adapter = createHudOverlayAdapter({ renderer: createHostRenderer() });
    const hud = new HUD({
      referenceSize: { width: 200, height: 100 },
      rendererAdapter: adapter,
    });
    const layer = hud.createLayer({ id: "main", scaleMode: "native" });
    layer
      .add(new RoundedRect({ id: "round", width: 40, height: 20, radius: 6, fill: 0xff0000 }))
      .setPosition(4, 4);
    layer.add(
      new Line({ id: "line", x1: 10, y1: 40, x2: 80, y2: 40, strokeWidth: 3, fill: 0x00ff00 }),
    );
    layer
      .add(
        new Ring({
          id: "ring",
          innerRadius: 8,
          outerRadius: 16,
          startAngle: 0,
          sweep: Math.PI,
          fill: 0x0000ff,
        }),
      )
      .setPosition(120, 20);
    layer
      .add(new Label({ id: "label", text: "HP", fontSize: 12, color: 0xffffff }))
      .setPosition(4, 70);
    await hud.initialize();
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    const commands = adapter.lastQueue?.commands ?? [];
    expect(
      commands.some((command) => command.kind === "shape" && command.shape === "rounded-rect"),
    ).toBe(true);
    expect(commands.some((command) => command.kind === "shape" && command.shape === "line")).toBe(
      true,
    );
    expect(commands.some((command) => command.kind === "shape" && command.shape === "ring")).toBe(
      true,
    );
    const text = commands.find((command) => command.kind === "text");
    expect(text?.kind).toBe("text");
    if (text?.kind === "text") {
      expect(text.glyphCount).toBeGreaterThan(0);
      expect(text.glyphs.length).toBe(text.glyphCount);
    }
    expect(adapter.debugMeshCount).toBeLessThanOrEqual(3);
    const ringCmd = commands.find(
      (command) => command.kind === "shape" && command.shape === "ring",
    );
    const rectLike = commands.find(
      (command) => command.kind === "shape" && command.shape === "rounded-rect",
    );
    expect(ringCmd?.kind).toBe("shape");
    expect(rectLike?.kind).toBe("shape");
    if (ringCmd?.kind === "shape" && rectLike?.kind === "shape") {
      const ringLocal = {
        ...ringCmd,
        bounds: { x: 0, y: 0, width: 32, height: 32 },
        shapeParams: { innerRadius: 8, outerRadius: 16, startAngle: 0, sweep: Math.PI },
      };
      const rectLocal = {
        ...rectLike,
        bounds: { x: 0, y: 0, width: 32, height: 32 },
        shapeParams: { radius: 8 },
      };
      const ringHash = hashRgba(rasterCommands([ringLocal], 32, 32));
      const rectHash = hashRgba(rasterCommands([rectLocal], 32, 32));
      expect(ringHash).not.toBe(rectHash);
    }
    hud.dispose();
  });

  it("encodes inventory slots after they leave the origin, not only the grid backing rect", async () => {
    const adapter = createHudOverlayAdapter({ renderer: createHostRenderer() });
    const hud = new HUD({
      referenceSize: { width: 1920, height: 1080 },
      rendererAdapter: adapter,
    });
    const layer = hud.createLayer({ id: "main", scaleMode: "native" });
    const grid = new InventoryGrid({
      id: "pack",
      columns: 2,
      rows: 1,
      cellSize: 52,
      items: [
        { key: "rifle", quantity: 1 },
        { key: "med", quantity: 3 },
      ],
    });
    grid.setPosition(64, 860);
    layer.add(grid);
    await hud.initialize();
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    const commands = adapter.lastQueue?.commands ?? [];
    const slotCommands = commands.filter((command) => command.sourceNodeId.includes("slot"));
    expect(slotCommands.length).toBeGreaterThan(0);
    expect(commands.some((command) => command.bounds.y >= 860)).toBe(true);
    hud.dispose();
  });

  it("SDF prepare stores atlas texels and glyph UVs rather than glyphCount-only metadata", () => {
    const backend = createSdfTextBackend();
    const prepared = backend.prepare({
      fontId: "ui",
      fontSize: 16,
      text: "A",
      glyphs: [
        {
          glyphId: 65,
          glyphKey: "65",
          cluster: 0,
          x: 0,
          y: 0,
          advance: 8,
          advanceX: 8,
          advanceY: 0,
          offsetX: 0,
          offsetY: 0,
          line: 0,
        },
      ],
      lines: [],
      bounds: { x: 0, y: 0, width: 8, height: 16 },
      direction: "ltr",
    });
    expect(prepared.atlasWidth).toBeGreaterThan(0);
    expect(prepared.glyphs[0]?.u1).toBeGreaterThan(prepared.glyphs[0]?.u0 ?? 1);
    expect(prepared.sdf).toBe(false);
    backend.dispose();
  });
});
