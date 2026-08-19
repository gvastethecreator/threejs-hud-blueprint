import { describe, expect, it } from "vitest";
import { DirtyFlag, dirtyFlagNames } from "./DirtyFlags.js";
import { HUD } from "./HUD.js";
import { HudNode } from "./HudNode.js";
import { LinearBar } from "../widgets/LinearBar.js";
import { Label } from "../widgets/Label.js";

describe("invalidation", () => {
  it("keeps a bar value change off unrelated text layout and parent structure", () => {
    const parent = new HudNode({ id: "hud" });
    const label = parent.add(new HudNode({ id: "label", width: 40, height: 12 }));
    const bar = parent.add(new LinearBar({ width: 100, height: 10, value: 10 }));
    parent.clearDirty();
    label.clearDirty();
    bar.clearDirty();
    bar.fillNode.clearDirty();
    bar.setValue(40);
    expect(bar.fillNode.size.width).toBe(40);
    expect(bar.fillNode.dirtyFlags & DirtyFlag.Geometry).toBeTruthy();
    expect(bar.fillNode.dirtyFlags & DirtyFlag.HitTest).toBeTruthy();
    expect(bar.dirtyFlags & DirtyFlag.Text).toBeFalsy();
    expect(label.dirtyFlags).toBe(DirtyFlag.None);
    expect(parent.dirtyFlags & DirtyFlag.Children).toBeFalsy();
    expect(parent.dirtyFlags & DirtyFlag.Text).toBeFalsy();
    const geometryMarks = bar.fillNode.invalidationCounters().geometry;
    bar.setValue(40);
    expect(bar.fillNode.invalidationCounters().geometry).toBe(geometryMarks);
    expect(bar.invalidationCounters().coalescedWrites).toBeGreaterThan(0);
  });

  it("marks measurement, layout, glyph drawable, and hit bounds when font size changes", () => {
    const parent = new HudNode({ id: "parent" });
    const text = parent.add(new HudNode({ id: "text", width: 80, height: 20 }));
    parent.clearDirty();
    text.clearDirty();
    text.setFontSize(22);
    expect(text.fontSize).toBe(22);
    expect(text.dirtyFlags & DirtyFlag.Text).toBeTruthy();
    expect(text.dirtyFlags & DirtyFlag.Layout).toBeTruthy();
    expect(text.dirtyFlags & DirtyFlag.Geometry).toBeTruthy();
    expect(text.dirtyFlags & DirtyFlag.HitTest).toBeTruthy();
    expect(parent.dirtyFlags & DirtyFlag.Layout).toBeTruthy();
    expect(dirtyFlagNames(text.dirtyFlags)).toEqual(
      expect.arrayContaining(["text", "layout", "geometry", "hitTest"]),
    );
    expect(text.dirtyReasons()).toEqual(
      expect.arrayContaining(["text", "layout", "geometry", "hitTest"]),
    );
  });

  it("does not rebuild geometry when opacity changes", () => {
    const node = new HudNode({ id: "fade", width: 8, height: 8 });
    node.clearDirty();
    node.setOpacity(0.4);
    expect(node.dirtyFlags & DirtyFlag.Style).toBeTruthy();
    expect(node.dirtyFlags & DirtyFlag.Geometry).toBeFalsy();
    expect(node.invalidationCounters().style).toBe(1);
    expect(node.invalidationCounters().geometry).toBe(0);
    node.setOpacity(0.4);
    expect(node.invalidationCounters().style).toBe(1);
    expect(node.invalidationCounters().coalescedWrites).toBeGreaterThan(0);
  });

  it("clears dirty flags only after HUD update runs owning stages", async () => {
    const hud = new HUD({ referenceSize: { width: 100, height: 100 } });
    const layer = hud.createLayer({ id: "main" });
    const node = layer.add(new HudNode({ id: "n", width: 10, height: 10 }));
    node.setOpacity(0.5);
    expect(node.dirtyFlags & DirtyFlag.Style).toBeTruthy();
    await hud.initialize();
    hud.update(0);
    expect(node.dirtyFlags).toBe(DirtyFlag.None);
    expect(layer.dirtyFlags).toBe(DirtyFlag.None);
    hud.dispose();
  });

  it("keeps dirty flags when an owning stage throws", () => {
    class FailingStageNode extends HudNode {
      protected override applyInvalidationStage(stage: DirtyFlag): void {
        if (stage === DirtyFlag.Style) throw new Error("style stage failed");
      }
    }
    const node = new FailingStageNode({ id: "boom", width: 8, height: 8 });
    node.setOpacity(0.2);
    expect(node.dirtyFlags & DirtyFlag.Style).toBeTruthy();
    expect(() => node.processInvalidation()).toThrow("style stage failed");
    expect(node.dirtyFlags & DirtyFlag.Style).toBeTruthy();
  });

  it("remeasures Label glyph bounds when font size changes", () => {
    const label = new Label({ id: "title", text: "HP", fontSize: 10 });
    const narrow = label.layout.width;
    label.setFontSize(24);
    expect(label.layout.width).toBeGreaterThan(narrow);
    expect(label.size.height).toBeGreaterThan(10);
    expect(label.dirtyFlags & DirtyFlag.Text).toBeTruthy();
    expect(label.dirtyFlags & DirtyFlag.Layout).toBeTruthy();
    expect(label.dirtyFlags & DirtyFlag.Geometry).toBeTruthy();
    expect(label.dirtyFlags & DirtyFlag.HitTest).toBeTruthy();
  });

  it("records recomputation counts for representative changes", () => {
    const node = new HudNode({ id: "counted", width: 10, height: 10 });
    node.clearDirty();
    node.setPosition(1, 2);
    node.setPosition(1, 2);
    node.setFontSize(18);
    node.setOpacity(0.8);
    const counts = node.invalidationCounters();
    expect(counts.transform).toBe(1);
    expect(counts.text).toBe(1);
    expect(counts.layout).toBe(1);
    expect(counts.geometry).toBe(1);
    expect(counts.hitTest).toBe(1);
    expect(counts.style).toBe(1);
    expect(counts.coalescedWrites).toBeGreaterThan(0);
    expect(node.dirtyReasons().length).toBeLessThanOrEqual(8);
  });
});
