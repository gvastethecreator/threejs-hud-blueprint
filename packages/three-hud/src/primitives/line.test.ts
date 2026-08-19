import { describe, expect, it } from "vitest";
import { hitTest } from "../input/hitTest.js";
import { HudLayer } from "../core/HudLayer.js";
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
