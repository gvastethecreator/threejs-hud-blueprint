import type { HudDiagnostic } from "../contracts/diagnostics.js";
import type { ReadonlyRect, ReadonlySize } from "../contracts/geometry.js";

export type HostSurfaceLike = Readonly<{
  getPixelRatio?: () => number;
  getSize?: (target: { x: number; y: number }) => { x: number; y: number };
  getDrawingBufferSize?: (target: { x: number; y: number }) => { x: number; y: number };
}>;

export type HostSurfaceState = Readonly<{
  cssSize: ReadonlySize;
  drawingBufferSize: ReadonlySize;
  dpr: number;
  drawingBufferMatchesCss: boolean;
}>;

export function readHostSurface(renderer: HostSurfaceLike): HostSurfaceState {
  const dpr = finitePositive(renderer.getPixelRatio?.() ?? 1);
  const css = readVec2(renderer.getSize) ?? { width: 1, height: 1 };
  const derived = { width: css.width * dpr, height: css.height * dpr };
  const drawingBuffer = readVec2(renderer.getDrawingBufferSize) ?? derived;
  const drawingBufferMatchesCss =
    almostEqual(drawingBuffer.width, derived.width) &&
    almostEqual(drawingBuffer.height, derived.height);
  return Object.freeze({
    cssSize: Object.freeze(css),
    drawingBufferSize: Object.freeze(drawingBuffer),
    dpr,
    drawingBufferMatchesCss,
  });
}

export function drawingBufferMismatchDiagnostic(surface: HostSurfaceState): HudDiagnostic | null {
  if (surface.drawingBufferMatchesCss) return null;
  return {
    severity: "warning",
    code: "DRAWING_BUFFER_MISMATCH",
    message: "Drawing-buffer size does not match CSS size multiplied by DPR.",
    details: {
      cssWidth: surface.cssSize.width,
      cssHeight: surface.cssSize.height,
      dpr: surface.dpr,
      bufferWidth: surface.drawingBufferSize.width,
      bufferHeight: surface.drawingBufferSize.height,
    },
  };
}

export function cssRectToDevice(rect: ReadonlyRect, dpr: number): ReadonlyRect {
  const ratio = finitePositive(dpr);
  return Object.freeze({
    x: rect.x * ratio,
    y: rect.y * ratio,
    width: rect.width * ratio,
    height: rect.height * ratio,
  });
}

function readVec2(reader: HostSurfaceLike["getSize"]): ReadonlySize | null {
  if (typeof reader !== "function") return null;
  const size = reader({ x: 0, y: 0 });
  if (!size || !Number.isFinite(size.x) || !Number.isFinite(size.y) || size.x <= 0 || size.y <= 0)
    return null;
  return { width: size.x, height: size.y };
}

function finitePositive(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function almostEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-3;
}
