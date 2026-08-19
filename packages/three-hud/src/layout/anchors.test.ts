import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { anchorPoint } from "./absolute.js";

describe("anchors", () => {
  it("allows custom anchors outside 0-1 and rejects non-finite values", () => {
    expect(anchorPoint({ x: 1.5, y: -0.25 })).toEqual({ x: 1.5, y: -0.25 });
    expect(() => anchorPoint({ x: Number.NaN, y: 0 })).toThrow(HudError);
  });
});
