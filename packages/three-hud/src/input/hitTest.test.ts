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
});
