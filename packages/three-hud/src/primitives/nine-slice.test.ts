import { describe, expect, it } from "vitest";
import { HudLayer } from "../core/HudLayer.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { NineSlice } from "./NineSlice.js";

describe("nine-slice", () => {
  it("preserves authored corner size when the destination is scaled", () => {
    const panel = new NineSlice({
      id: "skin",
      width: 200,
      height: 120,
      insets: { top: 8, right: 10, bottom: 8, left: 10 },
      texture: { id: "panel", ownership: "borrowed", filter: "linear", ready: true },
    });
    const slices = panel.sliceRects();
    expect(slices).toHaveLength(9);
    expect(slices[0]).toEqual({ x: 0, y: 0, width: 10, height: 8 });
    expect(slices[2]).toEqual({ x: 190, y: 0, width: 10, height: 8 });
    expect(slices[6]).toEqual({ x: 0, y: 112, width: 10, height: 8 });
    expect(slices[8]).toEqual({ x: 190, y: 112, width: 10, height: 8 });
    expect(slices[4]?.width).toBe(180);
    const layer = new HudLayer({ id: "main", referenceSize: { width: 400, height: 300 } });
    layer.add(panel);
    expect(encodeOverlayQueue([layer], "webgl").size).toBe(9);
  });
});
