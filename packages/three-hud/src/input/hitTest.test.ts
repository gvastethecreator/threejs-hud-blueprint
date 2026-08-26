import { describe, expect, it } from "vitest";
import { HudNode } from "../core/HudNode.js";
import { hitTest } from "./hitTest.js";

describe("hitTest", () => {
  it("returns the top-most visible node containing the point", () => {
    const root = new HudNode({ id: "root", width: 200, height: 200 });
    const back = root.add(new HudNode({ id: "back", width: 100, height: 40 }));
    const front = root.add(new HudNode({ id: "front", width: 40, height: 40 }));
    back.setPosition(0, 0);
    front.setPosition(20, 0);
    expect(hitTest(root, 25, 10)?.id).toBe("front");
    expect(hitTest(root, 90, 10)?.id).toBe("back");
    expect(hitTest(root, 180, 180)?.id).toBe("root");
    expect(hitTest(root, 400, 10)).toBeNull();
  });

  it("ignores clipped-out regions and pointerEvents none", () => {
    const root = new HudNode({ id: "root", width: 80, height: 40 });
    const clipped = root.add(new HudNode({ id: "clipped", width: 80, height: 40 }));
    clipped.setPosition(0, 0);
    clipped.setClip({ x: 0, y: 0, width: 40, height: 40 });
    expect(hitTest(root, 10, 10)?.id).toBe("clipped");
    expect(hitTest(root, 60, 10)?.id).toBe("root");
    clipped.setPointerEvents("none");
    expect(hitTest(root, 10, 10)?.id).toBe("root");
  });

  it("hits a child using ancestor scale in world bounds", () => {
    const root = new HudNode({ id: "root", width: 50, height: 50 });
    const child = root.add(new HudNode({ id: "child", width: 10, height: 10 }));
    root.scaleX = 2;
    root.scaleY = 2;
    child.setPosition(5, 5);
    expect(hitTest(root, 15, 15)?.id).toBe("child");
    expect(hitTest(root, 5, 5)?.id).toBe("root");
  });

  it("ignores debug overlays even when they cover the point", () => {
    const root = new HudNode({ id: "root", width: 40, height: 40 });
    const overlay = root.add(
      new HudNode({
        id: "debug",
        width: 40,
        height: 40,
        debugOverlay: true,
        pointerEvents: "none",
      }),
    );
    overlay.setPosition(0, 0);
    expect(hitTest(root, 10, 10)?.id).toBe("root");
  });
});
