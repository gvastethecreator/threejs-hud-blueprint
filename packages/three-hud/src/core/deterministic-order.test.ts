import { describe, expect, it } from "vitest";
import { HUD } from "./HUD.js";
import { HudNode } from "./HudNode.js";
import { collectHitOrder, collectPaintOrder, HUD_ORDER_AUTHORITY } from "./order.js";
import { snapshotHud, snapshotHudTree, type HudTreeSnapshot } from "./snapshot.js";
import { hitTest } from "../input/hitTest.js";

const canonical: HudTreeSnapshot = {
  root: {
    id: "root",
    userKey: "hud-root",
    debugLabel: "root",
    insertionSeq: 0,
    renderSeq: 0,
    zIndex: 0,
    visible: true,
    opacity: 1,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    children: [
      {
        id: "back",
        userKey: "panel",
        debugLabel: "back",
        insertionSeq: 0,
        renderSeq: 1,
        zIndex: 0,
        visible: true,
        opacity: 1,
        position: { x: 0, y: 0 },
        size: { width: 100, height: 40 },
        children: [],
      },
      {
        id: "mid",
        userKey: "label",
        debugLabel: "mid",
        insertionSeq: 1,
        renderSeq: 2,
        zIndex: 0,
        visible: true,
        opacity: 1,
        position: { x: 10, y: 0 },
        size: { width: 80, height: 40 },
        children: [],
      },
      {
        id: "front",
        userKey: "badge",
        debugLabel: "front",
        insertionSeq: 2,
        renderSeq: 3,
        zIndex: 2,
        visible: true,
        opacity: 1,
        position: { x: 20, y: 0 },
        size: { width: 40, height: 40 },
        children: [],
      },
    ],
  },
  drawOrder: ["root", "back", "mid", "front"],
  hitOrder: ["front", "mid", "back", "root"],
  duplicateUserKeys: [],
};

function authoredTree(): HudNode {
  const root = new HudNode({
    id: "root",
    userKey: "hud-root",
    debugLabel: "root",
    width: 200,
    height: 200,
  });
  const back = root.add(
    new HudNode({
      id: "back",
      userKey: "panel",
      debugLabel: "back",
      width: 100,
      height: 40,
      zIndex: 0,
    }),
  );
  const mid = root.add(
    new HudNode({
      id: "mid",
      userKey: "label",
      debugLabel: "mid",
      width: 80,
      height: 40,
      zIndex: 0,
    }),
  );
  const front = root.add(
    new HudNode({
      id: "front",
      userKey: "badge",
      debugLabel: "front",
      width: 40,
      height: 40,
      zIndex: 2,
    }),
  );
  back.setPosition(0, 0);
  mid.setPosition(10, 0);
  front.setPosition(20, 0);
  return root;
}

describe("deterministic-order", () => {
  it("keeps the documented visual-order authority", () => {
    expect(HUD_ORDER_AUTHORITY).toEqual(["layerOrder", "zIndex", "ancestry", "insertionSeq", "id"]);
  });

  it("yields the same snapshot for the same authored tree across independent constructions", () => {
    const first = snapshotHudTree(authoredTree());
    const second = snapshotHudTree(authoredTree());
    expect(first).toEqual(second);
    expect(first).toEqual(canonical);
  });

  it("diagnoses duplicate user keys within HUD scope", () => {
    const diagnostics: string[] = [];
    const hud = new HUD({
      referenceSize: { width: 100, height: 100 },
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic.code),
    });
    const left = hud.createLayer({ id: "left" });
    const right = hud.createLayer({ id: "right" });
    left.add(new HudNode({ id: "a", userKey: "health" }));
    right.add(new HudNode({ id: "b", userKey: "health" }));
    const snapshot = snapshotHud(hud);
    expect(snapshot.duplicateUserKeys).toEqual([
      { userKey: "health", firstNodeId: "a", duplicateNodeId: "b", scope: "hud" },
    ]);
    expect(diagnostics).toEqual(["DUPLICATE_USER_KEY"]);
    hud.dispose();
  });

  it("shares render and hit-test ordering and puts later insertion above equal z-index", () => {
    const root = authoredTree();
    const snapshot = snapshotHudTree(root);
    expect(snapshot.drawOrder).toEqual(["root", "back", "mid", "front"]);
    expect(snapshot.hitOrder).toEqual(["front", "mid", "back", "root"]);
    expect(collectHitOrder(root).map((node) => node.id)).toEqual(snapshot.hitOrder);
    expect(collectPaintOrder(root).map((node) => node.id)).toEqual(snapshot.drawOrder);
    expect(hitTest(root, 25, 10)?.id).toBe("front");
    expect(hitTest(root, 90, 10)?.id).toBe("back");
    const equal = new HudNode({ id: "stack", width: 50, height: 50 });
    const first = equal.add(new HudNode({ id: "first", width: 50, height: 50 }));
    const second = equal.add(new HudNode({ id: "second", width: 50, height: 50 }));
    first.setPosition(0, 0);
    second.setPosition(0, 0);
    expect(collectPaintOrder(equal).map((node) => node.id)).toEqual(["stack", "first", "second"]);
    expect(hitTest(equal, 10, 10)?.id).toBe("second");
  });

  it("snapshots omit GPU objects, functions, and circular parent links", () => {
    const root = authoredTree();
    Object.assign(root, {
      gpu: { dispose() {} },
      tick: () => 1,
    });
    const snapshot = snapshotHudTree(root);
    const json = JSON.stringify(snapshot);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(json).not.toContain("gpu");
    expect(json).not.toContain("tick");
    expect(json).not.toContain("parent");
    const roundTrip = JSON.parse(json) as HudTreeSnapshot;
    expect(roundTrip).toEqual(snapshot);
    expect(typeof roundTrip).toBe("object");
  });

  it("uses sequential node ids rather than random ids when none are authored", () => {
    const node = new HudNode();
    expect(node.id).toMatch(/^hud-node-\d+$/);
  });
});
