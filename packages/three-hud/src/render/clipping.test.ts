import { describe, expect, it } from "vitest";
import { HudLayer } from "../core/HudLayer.js";
import { HudImage } from "../primitives/Image.js";
import { Rect } from "../primitives/Rect.js";
import { Ring } from "../primitives/Ring.js";
import { effectiveClip, intersectRects } from "./clip.js";
import { encodeOverlayQueue } from "./encodeOverlayQueue.js";

describe("clipping", () => {
  it("intersects nested rectangular clips to the same visible bounds for shapes and images", () => {
    const layer = new HudLayer({ id: "main", referenceSize: { width: 200, height: 200 } });
    const parent = layer.add(new Rect({ id: "parent", width: 80, height: 80 }));
    parent.setClip({ x: 10, y: 10, width: 40, height: 40 });
    const child = parent.add(new Rect({ id: "child", width: 80, height: 80 }));
    child.setClip({ x: 20, y: 0, width: 40, height: 30 });
    const image = parent.add(
      new HudImage({
        id: "icon",
        width: 80,
        height: 80,
        texture: { id: "t", ownership: "borrowed", filter: "nearest", ready: true },
      }),
    );
    image.setClip({ x: 20, y: 0, width: 40, height: 30 });
    const expected = intersectRects(
      { x: 10, y: 10, width: 40, height: 40 },
      { x: 20, y: 0, width: 40, height: 30 },
    );
    expect(effectiveClip(child)).toEqual(expected);
    expect(effectiveClip(image)).toEqual(expected);
    const snapshot = encodeOverlayQueue([layer], "webgl").snapshot();
    const childCommand = snapshot.commands.find((command) => command.sourceNodeId === "child");
    const imageCommand = snapshot.commands.find((command) => command.sourceNodeId === "icon");
    expect(childCommand?.clip).toEqual(expected);
    expect(imageCommand?.clip).toEqual(expected);
  });

  it("skips draw work when clip intersection is empty", () => {
    const layer = new HudLayer({ id: "main", referenceSize: { width: 100, height: 100 } });
    const rect = layer.add(new Rect({ id: "hidden", width: 20, height: 20 }));
    rect.setPosition(0, 0);
    rect.setClip({ x: 50, y: 50, width: 10, height: 10 });
    expect(encodeOverlayQueue([layer], "webgl").size).toBe(0);
    const ring = layer.add(new Ring({ id: "ring", outerRadius: 10, innerRadius: 4 }));
    ring.setPosition(0, 0);
    ring.setClip({ x: 80, y: 80, width: 5, height: 5 });
    expect(encodeOverlayQueue([layer], "webgl").size).toBe(0);
  });
});
