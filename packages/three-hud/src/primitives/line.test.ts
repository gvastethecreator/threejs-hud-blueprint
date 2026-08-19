import { describe, expect, it } from "vitest";
import { hitTest } from "../input/hitTest.js";
import { HudLayer } from "../core/HudLayer.js";
import { HudNode } from "../core/HudNode.js";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { Line } from "./Line.js";

describe("line", () => {
  it("builds hit bounds from endpoints and encodes as a line command", () => {
    const layer = new HudLayer({ id: "main", referenceSize: { width: 200, height: 200 } });
    const line = layer.add(
      new Line({ id: "rule", x1: 10, y1: 10, x2: 50, y2: 10, strokeWidth: 2 }),
    );
    expect(line.size).toEqual({ width: 40, height: 2 });
    const command = encodeOverlayQueue([layer], "webgl").snapshot().commands[0];
    expect(command && command.kind === "shape" ? command.shape : null).toBe("line");
    expect(hitTest(layer, 30, 11)?.id).toBe("rule");
  });

  it("encodes nested line endpoints in ancestor world space", () => {
    const layer = new HudLayer({ id: "main", referenceSize: { width: 800, height: 600 } });
    const parent = layer.add(new HudNode({ id: "holder", width: 80, height: 80 }));
    parent.setPosition(100, 50);
    parent.add(new Line({ id: "nested", x1: 10, y1: 4, x2: 40, y2: 4, strokeWidth: 2 }));
    const command = encodeOverlayQueue([layer], "webgl")
      .snapshot()
      .commands.find((entry) => entry.kind === "shape" && entry.shape === "line");
    expect(command?.kind).toBe("shape");
    if (command?.kind !== "shape") return;
    expect(command.shapeParams?.x1).toBe(110);
    expect(command.shapeParams?.y1).toBe(54);
    expect(command.shapeParams?.x2).toBe(140);
  });

  it("keeps a one-pixel stroke on whole device pixels when snapping", () => {
    const line = new Line({ x1: 0, y1: 0, x2: 10, y2: 0, strokeWidth: 1, pixelSnap: true });
    for (const dpr of [1, 1.5, 2, 3]) {
      const snapped = line.snapStroke(1, dpr);
      const device = snapped * 1 * dpr;
      expect(device).toBeCloseTo(Math.round(device), 10);
    }
    expect(line.alignment).toBe("center");
  });
});
