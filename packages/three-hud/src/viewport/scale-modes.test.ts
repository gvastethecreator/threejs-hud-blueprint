import { describe, expect, it } from "vitest";
import { resolveLayerViewport, stretchTextDiagnostic } from "./layerTransform.js";

const reference = { width: 1920, height: 1080 } as const;
const aspects = [
  { id: "landscape-16-9", viewport: { x: 0, y: 0, width: 1920, height: 1080 } },
  { id: "portrait", viewport: { x: 0, y: 0, width: 1080, height: 1920 } },
  { id: "square", viewport: { x: 0, y: 0, width: 1000, height: 1000 } },
  { id: "ultrawide", viewport: { x: 0, y: 0, width: 3440, height: 1440 } },
] as const;

describe("scale-modes", () => {
  it("never crops the reference frame under contain", () => {
    for (const aspect of aspects) {
      const transform = resolveLayerViewport({
        referenceSize: reference,
        viewport: aspect.viewport,
        mode: "contain",
      });
      expect(transform.contentRect.width).toBeLessThanOrEqual(aspect.viewport.width + 1e-9);
      expect(transform.contentRect.height).toBeLessThanOrEqual(aspect.viewport.height + 1e-9);
      expect(transform.logicalVisibleRect.x).toBeLessThanOrEqual(1e-9);
      expect(transform.logicalVisibleRect.y).toBeLessThanOrEqual(1e-9);
      expect(
        transform.logicalVisibleRect.x + transform.logicalVisibleRect.width,
      ).toBeGreaterThanOrEqual(reference.width - 1e-9);
      expect(
        transform.logicalVisibleRect.y + transform.logicalVisibleRect.height,
      ).toBeGreaterThanOrEqual(reference.height - 1e-9);
      expect(Number.isFinite(transform.offsetX)).toBe(true);
      expect(Number.isFinite(transform.offsetY)).toBe(true);
    }
  });

  it("always fills the host viewport under cover", () => {
    for (const aspect of aspects) {
      const transform = resolveLayerViewport({
        referenceSize: reference,
        viewport: aspect.viewport,
        mode: "cover",
      });
      expect(transform.contentRect.width).toBeGreaterThanOrEqual(aspect.viewport.width - 1e-9);
      expect(transform.contentRect.height).toBeGreaterThanOrEqual(aspect.viewport.height - 1e-9);
      expect(transform.scaleX).toBe(transform.scaleY);
      expect(Number.isFinite(transform.scaleX)).toBe(true);
    }
  });

  it("maps one logical unit to one CSS pixel in native mode before DPR", () => {
    const transform = resolveLayerViewport({
      referenceSize: reference,
      viewport: { x: 10, y: 20, width: 800, height: 600 },
      mode: "native",
      dpr: 3,
      zoom: 1,
    });
    expect(transform.scaleX).toBe(1);
    expect(transform.scaleY).toBe(1);
    expect(logicalSpan(transform)).toEqual({ x: 1, y: 1 });
  });

  it("reports independent stretch scales and diagnoses text aspect risk", () => {
    const transform = resolveLayerViewport({
      referenceSize: reference,
      viewport: { x: 0, y: 0, width: 1000, height: 1000 },
      mode: "stretch",
    });
    expect(transform.scaleX).toBeCloseTo(1000 / 1920);
    expect(transform.scaleY).toBeCloseTo(1000 / 1080);
    expect(transform.scaleX).not.toBeCloseTo(transform.scaleY);
    const diagnostic = stretchTextDiagnostic(transform);
    expect(diagnostic?.code).toBe("STRETCH_TEXT_RISK");
    expect(stretchTextDiagnostic({ ...transform, mode: "contain" })).toBeNull();
    expect(
      [transform.scaleX, transform.scaleY, transform.offsetX, transform.offsetY].every(
        Number.isFinite,
      ),
    ).toBe(true);
  });
});

function logicalSpan(transform: { scaleX: number; scaleY: number }): { x: number; y: number } {
  return { x: transform.scaleX, y: transform.scaleY };
}
