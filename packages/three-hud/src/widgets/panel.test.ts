import { describe, expect, it } from "vitest";
import { Label } from "./Label.js";
import { Panel } from "./Panel.js";

describe("panel", () => {
  it("applies padding to the content container", () => {
    const panel = new Panel({
      width: 200,
      height: 100,
      padding: { top: 10, right: 8, bottom: 10, left: 12 },
    });
    expect(panel.content.position).toEqual({ x: 12, y: 10 });
    expect(panel.content.size).toEqual({ width: 180, height: 80 });
    panel.content.add(new Label({ text: "Hi" }));
    panel.layoutChildren();
    panel.dispose();
  });
});
