import { describe, expect, it } from "vitest";
import { HUD } from "../core/HUD.js";
import { bitmapScalePolicy } from "./bitmap.js";
import { createSdfTextBackend } from "./sdf.js";

describe("bitmap-scale-policy", () => {
  it("never claims pixel-perfect output on a fractional scale", () => {
    expect(bitmapScalePolicy(11, 22)).toEqual({
      integer: true,
      multiplier: 2,
      pixelPerfect: true,
      filter: "nearest",
      mipmaps: false,
    });
    const fractional = bitmapScalePolicy(11, 16);
    expect(fractional.integer).toBe(false);
    expect(fractional.pixelPerfect).toBe(false);
    expect(fractional.filter).toBe("nearest");
  });

  it("leaves a smooth SDF layer unaffected by bitmap scale policy", async () => {
    const hud = new HUD({ referenceSize: { width: 320, height: 180 } });
    const pixel = hud.createLayer({ id: "pixel", scaleMode: "integer", pixelSnap: true });
    const smooth = hud.createLayer({ id: "smooth", scaleMode: "contain" });
    expect(pixel.pixelSnap).toBe(true);
    expect(smooth.scaleMode).toBe("contain");
    const sdf = createSdfTextBackend();
    expect(sdf.capabilities.pixelPerfect).toBe(false);
    await hud.initialize();
    hud.dispose();
  });
});
