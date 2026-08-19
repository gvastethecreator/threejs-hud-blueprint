import { describe, expect, it } from "vitest";
import { encodeOverlayQueue } from "../render/encodeOverlayQueue.js";
import { HudLayer } from "../core/HudLayer.js";
import { RoundedRect } from "./RoundedRect.js";

describe("rounded-rect", () => {
  it("encodes a uniform radius rounded rect", () => {
    const layer = new HudLayer({ id: "main", referenceSize: { width: 100, height: 100 } });
    const node = layer.add(new RoundedRect({ id: "card", width: 40, height: 24, radius: 6 }));
    const snapshot = encodeOverlayQueue([layer], "webgl").snapshot();
    const command = snapshot.commands[0];
    expect(command && command.kind === "shape" ? command.shape : null).toBe("rounded-rect");
    expect(node.radius).toBe(6);
    expect(node.borderPolicy).toBe("inside");
  });

  it("diagnoses non-uniform stretch instead of silently warping the radius", () => {
    const node = new RoundedRect({ id: "card", width: 40, height: 24, radius: 8 });
    node.scaleX = 2;
    node.scaleY = 1;
    const codes: string[] = [];
    expect(node.diagnoseNonUniformStretch((diagnostic) => codes.push(diagnostic.code))).toBe(false);
    expect(codes).toEqual(["ROUNDED_NONUNIFORM_STRETCH"]);
    node.scaleX = 1;
    expect(node.diagnoseNonUniformStretch()).toBe(true);
  });
});
