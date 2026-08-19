import type { HudDrawCommand } from "./commands.js";

export function rasterCommands(
  commands: readonly HudDrawCommand[],
  width: number,
  height: number,
): Uint8Array {
  const data = new Uint8Array(width * height * 4);
  for (const command of commands) paint(data, width, height, command);
  return data;
}

export function hashRgba(data: Uint8Array): string {
  let hash = 2166136261;
  for (let index = 0; index < data.length; index += 1) {
    hash ^= data[index] ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function paint(data: Uint8Array, width: number, height: number, command: HudDrawCommand): void {
  if (command.kind === "text") {
    for (const glyph of command.glyphs)
      fillRect(data, width, height, glyph.x, glyph.y, glyph.width, glyph.height, command.fill, 1);
    return;
  }
  if (command.kind === "image") {
    fillRect(
      data,
      width,
      height,
      command.bounds.x,
      command.bounds.y,
      command.bounds.width,
      command.bounds.height,
      command.tint,
      1,
    );
    return;
  }
  if (command.kind !== "shape") return;
  const bounds = command.bounds;
  if (command.shape === "ring") {
    const params = command.shapeParams;
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const outer = params?.outerRadius ?? bounds.width / 2;
    const inner = params?.innerRadius ?? outer * 0.5;
    const start = params?.startAngle ?? 0;
    const sweep = params?.sweep ?? Math.PI * 2;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const r = Math.hypot(dx, dy);
        if (r < inner || r > outer) continue;
        let ang = Math.atan2(dy, dx);
        let rel = ang - start;
        while (rel < 0) rel += Math.PI * 2;
        if (Math.abs(sweep) < Math.PI * 2 - 0.001 && rel > Math.abs(sweep)) continue;
        put(data, width, x, y, command.fill);
      }
    }
    return;
  }
  if (command.shape === "line") {
    const params = command.shapeParams;
    const x1 = params?.x1 ?? bounds.x;
    const y1 = params?.y1 ?? bounds.y;
    const x2 = params?.x2 ?? bounds.x + bounds.width;
    const y2 = params?.y2 ?? bounds.y;
    const stroke = Math.max(1, params?.strokeWidth ?? 1);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (distToSegment(x + 0.5, y + 0.5, x1, y1, x2, y2) <= stroke / 2)
          put(data, width, x, y, command.fill);
      }
    }
    return;
  }
  if (command.shape === "rounded-rect") {
    const radius = command.shapeParams?.radius ?? 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (insideRounded(x + 0.5, y + 0.5, bounds, radius)) put(data, width, x, y, command.fill);
      }
    }
    return;
  }
  fillRect(data, width, height, bounds.x, bounds.y, bounds.width, bounds.height, command.fill, 1);
}

function fillRect(
  data: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
  _alpha: number,
): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(width, Math.ceil(x + w));
  const y1 = Math.min(height, Math.ceil(y + h));
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) put(data, width, px, py, fill);
  }
}

function insideRounded(
  px: number,
  py: number,
  bounds: { x: number; y: number; width: number; height: number },
  radius: number,
): boolean {
  if (
    px < bounds.x ||
    py < bounds.y ||
    px >= bounds.x + bounds.width ||
    py >= bounds.y + bounds.height
  )
    return false;
  const r = Math.min(radius, bounds.width / 2, bounds.height / 2);
  const cx = Math.min(Math.max(px, bounds.x + r), bounds.x + bounds.width - r);
  const cy = Math.min(Math.max(py, bounds.y + r), bounds.y + bounds.height - r);
  if (px === cx || py === cy) return true;
  return Math.hypot(px - cx, py - cy) <= r;
}

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = dx * dx + dy * dy;
  if (length === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / length));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function put(data: Uint8Array, width: number, x: number, y: number, fill: number): void {
  const index = (y * width + x) * 4;
  data[index] = (fill >> 16) & 255;
  data[index + 1] = (fill >> 8) & 255;
  data[index + 2] = fill & 255;
  data[index + 3] = 255;
}
