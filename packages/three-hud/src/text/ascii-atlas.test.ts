import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { Label } from "../widgets/Label.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import {
  ASCII_ATLAS_CELL,
  ASCII_ATLAS_COLUMNS,
  ASCII_ATLAS_HEIGHT,
  ASCII_ATLAS_WIDTH,
  atlasUv,
  rasterAsciiAtlas,
  rasterText,
} from "./asciiAtlas.js";

function cellInk(code: number): boolean[][] {
  const data = rasterAsciiAtlas(false);
  const index = code - 32;
  const column = index % ASCII_ATLAS_COLUMNS;
  const row = Math.floor(index / ASCII_ATLAS_COLUMNS);
  const originX = column * ASCII_ATLAS_CELL;
  const originY = row * ASCII_ATLAS_CELL;
  const grid: boolean[][] = [];
  for (let y = 0; y < ASCII_ATLAS_CELL; y += 1) {
    const line: boolean[] = [];
    for (let x = 0; x < ASCII_ATLAS_CELL; x += 1) {
      const i = ((originY + y) * ASCII_ATLAS_WIDTH + originX + x) * 4 + 3;
      line.push((data[i] ?? 0) > 127);
    }
    grid.push(line);
  }
  return grid;
}

describe("ascii-atlas", () => {
  it("stores a slash and a W with distinct ink, not a blank cell", () => {
    const slash = cellInk(47);
    const w = cellInk(87);
    const v = cellInk(86);
    expect(slash.flat().filter(Boolean).length).toBeGreaterThan(4);
    expect(w.flat().filter(Boolean).length).toBeGreaterThan(8);
    expect(w.flat().filter(Boolean).length).not.toBe(v.flat().filter(Boolean).length);
  });

  it("stores a T as a full top bar plus a stem, not an O", () => {
    const t = cellInk(84);
    const o = cellInk(79);
    const tInk = t.flat().filter(Boolean).length;
    const oInk = o.flat().filter(Boolean).length;
    expect(tInk).toBeGreaterThan(8);
    expect(tInk).not.toBe(oInk);
    const top = t[1] ?? [];
    expect(top.slice(1, 6).every(Boolean)).toBe(true);
  });

  it("maps atlas UVs to the 5x7 ink, not the 8x8 padded cell", () => {
    const uv = atlasUv(84);
    const cell = 1 / ASCII_ATLAS_COLUMNS;
    expect(uv.u1 - uv.u0).toBeCloseTo((5 / 8) * cell, 5);
    expect(uv.v1 - uv.v0).toBeCloseTo(7 / ASCII_ATLAS_HEIGHT, 5);
    expect(uv.u1 - uv.u0).toBeLessThan(cell);
  });

  it("places Label glyphs on a 5:7 pixel aspect", () => {
    const hud = new HUD({ referenceSize: { width: 200, height: 100 } });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    layer.add(new Label({ id: "a", text: "A", fontSize: 14, color: 0xffffff }));
    const queue = encodeOverlayQueue([layer], "webgl").snapshot();
    const command = queue.commands.find((item) => item.kind === "text");
    expect(command?.kind).toBe("text");
    if (command?.kind !== "text") return;
    const glyph = command.glyphs[0];
    expect(glyph).toBeTruthy();
    if (!glyph) return;
    expect(glyph.width / glyph.height).toBeCloseTo(5 / 7, 5);
    expect(glyph.height).toBeCloseTo(14);
    hud.dispose();
  });

  it("encodes Label text T with the T atlas cell UVs", () => {
    const hud = new HUD({ referenceSize: { width: 200, height: 100 } });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    layer.add(new Label({ id: "t", text: "T", fontSize: 16, color: 0xffffff }));
    const queue = encodeOverlayQueue([layer], "webgl").snapshot();
    const command = queue.commands.find((item) => item.kind === "text");
    expect(command?.kind).toBe("text");
    if (command?.kind !== "text") return;
    expect(command.glyphs).toHaveLength(1);
    const uv = atlasUv(84);
    expect(command.glyphs[0]?.u0).toBeCloseTo(uv.u0);
    expect(command.glyphs[0]?.v0).toBeCloseTo(uv.v0);
    expect(command.glyphs[0]?.u1).toBeCloseTo(uv.u1);
    expect(command.glyphs[0]?.v1).toBeCloseTo(uv.v1);
    hud.dispose();
  });

  it("rasterText paints a T as a top bar plus stem, not a solid block", () => {
    const raster = rasterText("T", 0xffffff, 2);
    const inkAt = (x: number, y: number): number =>
      raster.data[(y * raster.width + x) * 4 + 3] ?? 0;
    expect(raster.width).toBeGreaterThan(8);
    expect(inkAt(2, 2)).toBe(255);
    expect(inkAt(6, 2)).toBe(255);
    expect(inkAt(6, 8)).toBe(255);
    expect(inkAt(1, 8)).toBe(0);
  });

  it("uploads T atlas UVs onto the overlay instance buffer", async () => {
    const { createHudOverlayAdapter } = await import("../render/createHudOverlayAdapter.js");
    const renderer = {
      isWebGLRenderer: true,
      autoClear: true,
      autoClearColor: true,
      autoClearDepth: true,
      autoClearStencil: true,
      getPixelRatio: () => 1,
      getViewport: (target: { x: number; y: number; z: number; w: number }) => target,
      setViewport: () => {},
      getScissor: (target: { x: number; y: number; z: number; w: number }) => target,
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
    };
    const adapter = createHudOverlayAdapter({ renderer: renderer as never });
    const hud = new HUD({ referenceSize: { width: 200, height: 100 }, rendererAdapter: adapter });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    layer.add(new Label({ id: "t", text: "T", fontSize: 16, color: 0xffffff }));
    await hud.initialize();
    hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 });
    const uv = atlasUv(84);
    const uploaded = adapter.debugInstanceUv(0);
    expect(adapter.debugTextInstanceShape(0)).toBe(5);
    expect(uploaded[0]).toBeCloseTo(uv.u0);
    expect(uploaded[1]).toBeCloseTo(uv.v0);
    expect(uploaded[2]).toBeCloseTo(uv.u1);
    expect(uploaded[3]).toBeCloseTo(uv.v1);
    hud.dispose();
  });
});
