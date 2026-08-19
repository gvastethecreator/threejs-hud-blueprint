import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import * as publicApi from "../index.js";
import { LinearBar } from "../widgets/LinearBar.js";
import { DeterministicClock } from "./clock.js";
import { createCanonicalTreeFixture, createHudFixture } from "./fixtures.js";
import {
  createIdFactory,
  createMockRenderer,
  createMockResource,
  createMockTextBackend,
  createMockViewport,
} from "./mocks.js";

describe("testing-harness", () => {
  it("runs in Node without WebGPU or document", () => {
    expect(typeof document).toBe("undefined");
    expect(typeof navigator === "undefined" || !("gpu" in (navigator as object))).toBe(true);
    expect(() => createMockRenderer("webgpu")).not.toThrow();
  });

  it("does not read navigator.gpu when creating a WebGPU renderer mock", () => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      get() {
        throw new Error("navigator accessed");
      },
    });
    try {
      expect(() => createMockRenderer("webgpu")).not.toThrow();
    } finally {
      if (previous) Object.defineProperty(globalThis, "navigator", previous);
      else Reflect.deleteProperty(globalThis, "navigator");
    }
  });

  it("injects a deterministic clock into HUD elapsed time and pointer input", async () => {
    const { hud, clock, adapter } = createHudFixture();
    await hud.initialize();
    expect(hud.clock).toBe(clock);
    hud.update(clock.tick(16));
    expect(hud.elapsedSeconds).toBeCloseTo(0.016);
    expect(hud.frame).toBe(1);
    const layer = hud.createLayer({ id: "ui", scaleMode: "native" });
    const bar = layer.add(new LinearBar({ id: "hp", width: 80, height: 12, value: 20 }));
    const types: string[] = [];
    hud.pointer.addListener(bar, (event) => types.push(event.type));
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "down",
        clientX: 8,
        clientY: 8,
        button: 0,
        buttons: 1,
        pointerType: "mouse",
        time: clock.nowMs(),
      },
      { canvasOrigin: { x: 0, y: 0 }, viewport: { x: 0, y: 0, width: 1920, height: 1080 }, dpr: 1 },
    );
    clock.tick(8);
    hud.dispatchPointer(
      {
        pointerId: 1,
        type: "up",
        clientX: 8,
        clientY: 8,
        button: 0,
        buttons: 0,
        pointerType: "mouse",
        time: clock.nowMs(),
      },
      { canvasOrigin: { x: 0, y: 0 }, viewport: { x: 0, y: 0, width: 1920, height: 1080 }, dpr: 1 },
    );
    expect(clock.nowMs()).toBe(24);
    expect(types.length).toBeGreaterThan(0);
    hud.render({ deltaSeconds: 0.016, elapsedSeconds: hud.elapsedSeconds, frame: hud.frame });
    expect(adapter.frames).toBe(1);
    hud.dispose();
  });

  it("lets host-controlled widget time follow the injected clock", () => {
    const clock = new DeterministicClock();
    const bar = new LinearBar({ width: 100, height: 10, value: 20, delayedValue: 80 });
    clock.tick(250);
    expect(clock.nowMs()).toBe(250);
    expect(bar.delayedValue).toBe(80);
    bar.setDelayedValue(bar.value);
    expect(bar.delayedValue).toBe(20);
    expect(bar.delayedNode.size.width).toBeCloseTo(20);
  });

  it("rejects double-dispose and borrowed-resource dispose", async () => {
    const clock = new DeterministicClock(1000);
    expect(clock.advance(16)).toBe(1016);
    const renderer = createMockRenderer("webgl");
    renderer.dispose();
    expect(() => renderer.dispose()).toThrow(HudError);
    const backend = createMockTextBackend();
    await backend.prepare({
      fontId: "mock",
      fontSize: 12,
      text: "",
      glyphs: [],
      lines: [],
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      direction: "ltr",
    });
    backend.dispose();
    expect(() =>
      backend.prepare({
        fontId: "mock",
        fontSize: 12,
        text: "",
        glyphs: [],
        lines: [],
        bounds: { x: 0, y: 0, width: 0, height: 0 },
        direction: "ltr",
      }),
    ).toThrow(HudError);
    expect(() => backend.dispose()).toThrow(HudError);
    const owned = createMockResource({ id: "atlas", ownership: "owned" });
    owned.dispose();
    expect(() => owned.dispose()).toThrow(HudError);
    const borrowed = createMockResource({ id: "host-texture", ownership: "borrowed" });
    expect(() => borrowed.dispose()).toThrow(HudError);
    const viewport = createMockViewport();
    viewport.dispose();
    expect(() => viewport.dispose()).toThrow(HudError);
  });

  it("exposes helpers only through the testing subpath, not the main package export", () => {
    expect("DeterministicClock" in publicApi).toBe(false);
    expect("createMockRenderer" in publicApi).toBe(false);
    expect("createHudFixture" in publicApi).toBe(false);
    const ids = createIdFactory("node");
    expect(ids()).toBe("node-1");
    expect(ids()).toBe("node-2");
    const tree = createCanonicalTreeFixture();
    expect(tree.root.children).toHaveLength(2);
    expect(tree.bar.value).toBe(40);
  });
});
