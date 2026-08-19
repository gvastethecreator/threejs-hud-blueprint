import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { HudNode } from "../core/HudNode.js";
import { getLayoutBox, layoutNode, measureNode, setLayoutProps } from "./box.js";

describe("layout-measure", () => {
  it("measures a content-sized label before the parent stack resolves", () => {
    const parent = new HudNode({ id: "stack", width: 200, height: 40 });
    const label = parent.add(new HudNode({ id: "label", width: 48, height: 12 }));
    setLayoutProps(label, { width: "auto", height: "auto" });
    setLayoutProps(parent, { width: 200, height: 40 });
    const parentBox = layoutNode(parent, { width: 200, height: 100 });
    expect(measureNode(label, { width: 200, height: 100 }).width).toBe(48);
    expect(parentBox.width).toBe(200);
    expect(getLayoutBox(label)?.width).toBe(48);
  });

  it("caches fixed measurements and rejects fill without remaining space", () => {
    const node = new HudNode({ id: "fixed", width: 10, height: 10 });
    setLayoutProps(node, { width: 32, height: 16 });
    const first = measureNode(node, { width: 100, height: 100 });
    const second = measureNode(node, { width: 100, height: 100 });
    expect(second).toBe(first);
    const filler = new HudNode({ id: "fill" });
    setLayoutProps(filler, { width: "fill", height: 8 });
    expect(() => layoutNode(filler, { width: Number.NaN, height: 8 })).toThrow(HudError);
  });

  it("fails deterministically when a fill child sits in an auto parent", () => {
    const parent = new HudNode({ id: "auto", width: 10, height: 10 });
    const child = parent.add(new HudNode({ id: "fill", width: 4, height: 4 }));
    setLayoutProps(parent, { width: "auto" });
    setLayoutProps(child, { width: "fill" });
    const codes: string[] = [];
    expect(() =>
      measureNode(parent, { width: 100, height: 100 }, (diagnostic) => codes.push(diagnostic.code)),
    ).toThrow(HudError);
    expect(codes).toEqual(["LAYOUT_CYCLE"]);
  });
});
