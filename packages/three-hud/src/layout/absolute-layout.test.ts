import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { HudNode } from "../core/HudNode.js";
import { resolveViewport } from "../viewport/resolveViewport.js";
import { ANCHOR_PRESETS, anchorSheet, layoutAbsolute } from "./absolute.js";

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
    layoutAbsolute(node, {
      anchor: "top-left",
      pivot: { x: 0, y: 0 },
      target: "safe",
      reference,
      insets: { top: 16, right: 8, bottom: 8, left: 20 },
    });
    expect(node.position).toEqual({ x: 20, y: 16 });
  });

  it("anchors to logical visible bounds instead of the full reference on cover crop", () => {
    const node = new HudNode({ width: 20, height: 20 });
    const reference = { width: 1920, height: 1080 };
    const cover = resolveViewport({
      referenceSize: reference,
      viewport: { x: 0, y: 0, width: 1280, height: 1024 },
      mode: "cover",
    });
    layoutAbsolute(node, { anchor: "top-left", reference });
    const referenceOrigin = { ...node.position };
    layoutAbsolute(node, {
      anchor: "top-left",
      target: "visible",
      reference,
      visible: cover.logicalVisibleRect,
    });
    expect(node.position.x).toBeCloseTo(cover.logicalVisibleRect.x);
    expect(node.position.y).toBeCloseTo(cover.logicalVisibleRect.y);
    expect(node.position.x).not.toBe(referenceOrigin.x);
    expect(() =>
      layoutAbsolute(node, { anchor: "top-left", target: "visible", reference }),
    ).toThrow(HudError);
  });

  it("applies margins after the chosen frame", () => {
    const node = new HudNode({ width: 20, height: 10 });
    layoutAbsolute(node, {
      anchor: "top-left",
      reference,
      margin: { top: 4, right: 0, bottom: 0, left: 6 },
    });
    expect(node.position).toEqual({ x: 6, y: 4 });
  });

  it("writes a 9-preset anchor sheet that changes with aspect ratio", () => {
    const size = { width: 200, height: 80 };
    const wide = anchorSheet({ width: 1920, height: 1080 }, size);
    const tall = anchorSheet({ width: 1080, height: 1920 }, size);
    expect(Object.keys(wide)).toHaveLength(9);
    expect(wide["top-left"]).toEqual({ x: 0, y: 0 });
    expect(wide["bottom-right"]).toEqual({ x: 1720, y: 1000 });
    expect(tall["bottom-right"]).toEqual({ x: 880, y: 1840 });
    expect(wide.center.x).not.toBe(tall.center.x);
  });
});
