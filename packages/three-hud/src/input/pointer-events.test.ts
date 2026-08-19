import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { HudNode } from "../core/HudNode.js";
import { connectHudPointerEvents } from "./connectPointer.js";

describe("pointer-events", () => {
  it("walks capture, target, then bubble and honors click/capture", () => {
    const hud = new HUD({ referenceSize: { width: 200, height: 200 } });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    const parent = layer.add(new HudNode({ id: "parent", width: 80, height: 40 }));
    const child = parent.add(new HudNode({ id: "child", width: 40, height: 40 }));
    parent.setPosition(0, 0);
    child.setPosition(0, 0);
    const types: string[] = [];
    hud.pointer.addListener(parent, (event) =>
      types.push(`${event.phase}:${event.type}:${event.currentTarget.id}`),
    );
    hud.pointer.addListener(child, (event) =>
      types.push(`${event.phase}:${event.type}:${event.currentTarget.id}`),
    );
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "down",
        clientX: 10,
        clientY: 10,
        button: 0,
        buttons: 1,
        pointerType: "mouse",
        time: 0,
      },
      { canvasOrigin: { x: 0, y: 0 }, viewport: { x: 0, y: 0, width: 200, height: 200 }, dpr: 1 },
    );
    hud.pointer.capture(1, child);
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "move",
        clientX: 400,
        clientY: 400,
        button: 0,
        buttons: 1,
        pointerType: "mouse",
        time: 16,
      },
      { canvasOrigin: { x: 0, y: 0 }, viewport: { x: 0, y: 0, width: 200, height: 200 }, dpr: 1 },
    );
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "up",
        clientX: 12,
        clientY: 10,
        button: 0,
        buttons: 0,
        pointerType: "mouse",
        time: 32,
      },
      { canvasOrigin: { x: 0, y: 0 }, viewport: { x: 0, y: 0, width: 200, height: 200 }, dpr: 1 },
    );
    expect(types.some((item) => item.includes("capture:pointerdown"))).toBe(true);
    expect(types.some((item) => item.includes("bubble:pointerdown"))).toBe(true);
    expect(types.some((item) => item.includes("pointermove") && item.includes("child"))).toBe(true);
    expect(types.some((item) => item.includes("click"))).toBe(true);
    hud.dispose();
  });

  it("cancels capture when the captured node is removed", () => {
    const hud = new HUD({ referenceSize: { width: 100, height: 100 } });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    const node = layer.add(new HudNode({ id: "held", width: 20, height: 20 }));
    hud.dispatchPointer(
      {
        pointerId: 7,
        type: "down",
        clientX: 5,
        clientY: 5,
        button: 0,
        buttons: 1,
        pointerType: "mouse",
        time: 0,
      },
      { viewport: { x: 0, y: 0, width: 100, height: 100 } },
    );
    hud.pointer.capture(7, node);
    const events = hud.pointer.cancelNode(node);
    expect(events.some((event) => event.type === "pointercancel")).toBe(true);
    hud.dispose();
  });

  it("does not fire click when movement exceeds the configured threshold", () => {
    const hud = new HUD({ referenceSize: { width: 200, height: 200 } });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    const node = layer.add(new HudNode({ id: "btn", width: 80, height: 80 }));
    const types: string[] = [];
    hud.pointer.addListener(node, (event) => types.push(event.type));
    const opts = {
      canvasOrigin: { x: 0, y: 0 },
      viewport: { x: 0, y: 0, width: 200, height: 200 },
      dpr: 1,
      clickMoveThreshold: 6,
    };
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "down",
        clientX: 10,
        clientY: 10,
        button: 0,
        buttons: 1,
        pointerType: "mouse",
        time: 0,
      },
      opts,
    );
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "up",
        clientX: 40,
        clientY: 10,
        button: 0,
        buttons: 0,
        pointerType: "mouse",
        time: 20,
      },
      opts,
    );
    expect(types).not.toContain("click");
    expect(types[0] === "pointerdown" || types.includes("pointerdown")).toBe(true);
    hud.dispose();
  });

  it("recomputes hover from the last client point after layout moves the target", () => {
    const hud = new HUD({ referenceSize: { width: 200, height: 200 } });
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    const node = layer.add(new HudNode({ id: "btn", width: 20, height: 20 }));
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "move",
        clientX: 8,
        clientY: 8,
        button: 0,
        buttons: 0,
        pointerType: "mouse",
        time: 0,
      },
      { viewport: { x: 0, y: 0, width: 200, height: 200 }, dpr: 1 },
    );
    expect(hud.pointer.hovered?.id).toBe("btn");
    node.setPosition(80, 80);
    hud.pointer.recomputeHover({ viewport: { x: 0, y: 0, width: 200, height: 200 }, dpr: 1 });
    expect(hud.pointer.hovered?.id).not.toBe("btn");
    hud.dispose();
  });

  it("repeats the same scripted sequence as the same event trace", () => {
    const run = (): string[] => {
      const hud = new HUD({ referenceSize: { width: 80, height: 40 } });
      const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
      const node = layer.add(new HudNode({ id: "btn", width: 40, height: 20 }));
      const types: string[] = [];
      hud.pointer.addListener(node, (event) => types.push(`${event.phase}:${event.type}`));
      const opts = { viewport: { x: 0, y: 0, width: 80, height: 40 }, dpr: 1 };
      hud.dispatchPointer(
        {
          pointerId: 1,
          type: "down",
          clientX: 5,
          clientY: 5,
          button: 0,
          buttons: 1,
          pointerType: "mouse",
          time: 0,
        },
        opts,
      );
      hud.dispatchPointer(
        {
          pointerId: 1,
          type: "up",
          clientX: 5,
          clientY: 5,
          button: 0,
          buttons: 0,
          pointerType: "mouse",
          time: 8,
        },
        opts,
      );
      hud.dispose();
      return types;
    };
    expect(run()).toEqual(run());
  });

  it("removes every canvas listener on disconnect", () => {
    const added: string[] = [];
    const removed: string[] = [];
    const canvas = {
      addEventListener: (type: string) => {
        added.push(type);
      },
      removeEventListener: (type: string) => {
        removed.push(type);
      },
    };
    const hud = new HUD({ referenceSize: { width: 40, height: 40 } });
    const connected = connectHudPointerEvents(hud, canvas, hud.pointer);
    connected.disconnect();
    expect(removed.sort()).toEqual(added.sort());
    expect(added.length).toBeGreaterThan(0);
    hud.dispose();
  });
});
