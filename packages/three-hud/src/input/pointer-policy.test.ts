import { describe, expect, it } from "vitest";
import { HudNode } from "../core/HudNode.js";
import { hitTest } from "./hitTest.js";

describe("pointer-policy", () => {
  it("covers auto, none, box-only, and box-none nesting", () => {
    const root = new HudNode({ id: "root", width: 100, height: 40 });
    const parent = root.add(
      new HudNode({ id: "parent", width: 80, height: 40, pointerEvents: "box-only" }),
    );
    const child = parent.add(new HudNode({ id: "child", width: 40, height: 40 }));
    child.setPosition(0, 0);
    expect(hitTest(root, 10, 10)?.id).toBe("parent");
    parent.setPointerEvents("box-none");
    expect(hitTest(root, 10, 10)?.id).toBe("child");
    parent.setPointerEvents("none");
    expect(hitTest(root, 10, 10)?.id).toBe("root");
    parent.setPointerEvents("auto");
    expect(hitTest(root, 10, 10)?.id).toBe("child");
  });

  it("does not hit disabled or pass-through nodes", () => {
    const root = new HudNode({ id: "root", width: 80, height: 40 });
    const pass = root.add(
      new HudNode({ id: "pass", width: 80, height: 40, pointerEvents: "none" }),
    );
    pass.setPosition(0, 0);
    expect(hitTest(root, 10, 10)?.id).toBe("root");
    const disabled = root.add(new HudNode({ id: "off", width: 20, height: 20 }));
    disabled.setPosition(0, 0);
    disabled.setDisabled(true);
    expect(hitTest(root, 10, 10)?.disabled).toBe(true);
  });
});
