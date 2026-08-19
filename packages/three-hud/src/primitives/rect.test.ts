import { describe, expect, it } from "vitest";
import { hitTest } from "../input/hitTest.js";
import { HudLayer } from "../core/HudLayer.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { Rect } from "./Rect.js";

describe("rect", () => {
  it("treats zero size as non-drawable and rejects negative size", () => {
    const rect = new Rect({ id: "box", width: 0, height: 12 });
    const layer = new HudLayer({ id: "main", referenceSize: { width: 100, height: 100 } });
    layer.add(rect);
    expect(encodeOverlayQueue([layer], "webgl").size).toBe(0);
    expect(() => rect.setSize(-1, 10)).toThrow(RangeError);
  });

  it("keeps the border inside the authored bounds", () => {
    const rect = new Rect({ width: 40, height: 20, strokeWidth: 4 });
    rect.setPosition(10, 8);
    expect(rect.borderPolicy).toBe("inside");
    expect(rect.innerFillBounds()).toEqual({ x: 14, y: 12, width: 32, height: 12 });
  });

  it("encodes clip/opacity/z-order and participates in hit testing", () => {
    const layer = new HudLayer({
      id: "main",
      referenceSize: { width: 100, height: 100 },
      order: 2,
    });
    const back = layer.add(
      new Rect({ id: "back", width: 50, height: 50, zIndex: 0, fill: 0x111111 }),
    );
    const front = layer.add(
      new Rect({ id: "front", width: 20, height: 20, zIndex: 3, fill: 0xffffff }),
    );
    back.setPosition(0, 0);
    front.setPosition(5, 5);
    front.setOpacity(0.5);
    const queue = encodeOverlayQueue([layer], "webgl");
    const snapshot = queue.snapshot();
    expect(snapshot.commands.map((command) => command.sourceNodeId)).toEqual(["back", "front"]);
    expect(snapshot.commands[1]?.opacity).toBe(0.5);
    expect(snapshot.commands[1]?.layerOrder).toBe(2);
    expect(hitTest(layer, 8, 8)?.id).toBe("front");
  });
});
