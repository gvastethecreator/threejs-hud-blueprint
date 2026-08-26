import { describe, expect, it } from "vitest";
import { Compass } from "./Compass.js";

describe("compass", () => {
  it("points the needle north at heading 0 and east at +90 degrees", () => {
    const compass = new Compass({ heading: 0 });
    expect(compass.needle.y2).toBeLessThan(compass.needle.y1);
    expect(compass.needle.x2).toBeCloseTo(compass.needle.x1, 5);
    expect(compass.headingLabel.text).toBe("N");
    compass.setHeading(Math.PI / 2);
    expect(compass.needle.x2).toBeGreaterThan(compass.needle.x1);
    expect(compass.needle.y2).toBeCloseTo(compass.needle.y1, 5);
    expect(compass.headingLabel.text).toBe("E");
    compass.setColor(0xffffff, 0x666666);
    expect(compass.bezel.fill).toBe(0xffffff);
    expect(compass.rose.fill).toBe(0x666666);
    compass.setSize(80, 80);
    expect(compass.size.width).toBe(80);
    expect(compass.bezel.outerRadius).toBe(39);
    compass.dispose();
  });

  it("keeps the needle instance when heading changes", () => {
    const compass = new Compass();
    const needle = compass.needle;
    compass.setHeading(1);
    expect(compass.needle).toBe(needle);
    compass.dispose();
  });
});
