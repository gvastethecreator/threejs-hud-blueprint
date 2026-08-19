import { describe, expect, it } from "vitest";
import { HudNode } from "../core/HudNode.js";
import { ANCHOR_PRESETS, layoutAbsolute } from "./absolute.js";

describe("absolute-layout", () => {
  const reference = { width: 100, height: 80 };

  it("matches all nine common anchor presets on the reference frame", () => {
    const expected: Record<string, { x: number; y: number }> = {
      "top-left": { x: 0, y: 0 },
      top: { x: 40, y: 0 },
      "top-right": { x: 80, y: 0 },
      left: { x: 0, y: 30 },
      center: { x: 40, y: 30 },
      right: { x: 80, y: 30 },
      "bottom-left": { x: 0, y: 60 },
      bottom: { x: 40, y: 60 },
      "bottom-right": { x: 80, y: 60 },
    };
    expect(ANCHOR_PRESETS).toHaveLength(9);
    for (const preset of ANCHOR_PRESETS) {
      const node = new HudNode({ width: 20, height: 20 });
      layoutAbsolute(node, { anchor: preset, reference });
      expect(node.position).toEqual(expected[preset]);
    }
  });

  it("keeps the anchored edge when content size changes and follows safe insets", () => {
    const node = new HudNode({ width: 20, height: 10 });
    layoutAbsolute(node, { anchor: "top-right", pivot: { x: 1, y: 0 }, reference });
    expect(node.position).toEqual({ x: 80, y: 0 });
    node.setSize(40, 10);
    layoutAbsolute(node, { anchor: "top-right", pivot: { x: 1, y: 0 }, reference });
    expect(node.position).toEqual({ x: 60, y: 0 });
    layoutAbsolute(node, {
      anchor: "top-left",
      pivot: { x: 0, y: 0 },
      target: "safe",
      reference,
      insets: { top: 8, right: 8, bottom: 8, left: 12 },
    });
    expect(node.position).toEqual({ x: 12, y: 8 });
  });
});
