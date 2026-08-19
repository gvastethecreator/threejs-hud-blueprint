/** First-party 5×7 ASCII atlas. No third-party font files. */
export const ASCII_ATLAS_CELL = 8;
export const ASCII_ATLAS_COLUMNS = 16;
export const ASCII_ATLAS_ROWS = 6;
export const ASCII_ATLAS_FIRST = 32;
export const ASCII_ATLAS_COUNT = 96;
export const ASCII_ATLAS_WIDTH = ASCII_ATLAS_COLUMNS * ASCII_ATLAS_CELL;
export const ASCII_ATLAS_HEIGHT = ASCII_ATLAS_ROWS * ASCII_ATLAS_CELL;

type GlyphBits = readonly [number, number, number, number, number, number, number];

const FONT: Partial<Record<number, GlyphBits>> = {
  33: [4, 4, 4, 4, 4, 0, 4],
  43: [0, 4, 4, 31, 4, 4, 0],
  45: [0, 0, 0, 31, 0, 0, 0],
  46: [0, 0, 0, 0, 0, 0, 4],
  48: [14, 17, 19, 21, 25, 17, 14],
  49: [4, 12, 4, 4, 4, 4, 14],
  50: [14, 17, 1, 2, 4, 8, 31],
  51: [14, 17, 1, 6, 1, 17, 14],
  52: [2, 6, 10, 18, 31, 2, 2],
  53: [31, 16, 30, 1, 1, 17, 14],
  54: [6, 8, 16, 30, 17, 17, 14],
  55: [31, 1, 2, 4, 4, 4, 4],
  56: [14, 17, 17, 14, 17, 17, 14],
  57: [14, 17, 17, 15, 1, 2, 12],
  58: [0, 4, 0, 0, 0, 4, 0],
  65: [14, 17, 17, 31, 17, 17, 17],
  66: [30, 17, 17, 30, 17, 17, 30],
  67: [14, 17, 16, 16, 16, 17, 14],
  68: [30, 17, 17, 17, 17, 17, 30],
  69: [31, 16, 16, 30, 16, 16, 31],
  70: [31, 16, 16, 30, 16, 16, 16],
  71: [14, 17, 16, 19, 17, 17, 15],
  72: [17, 17, 17, 31, 17, 17, 17],
  73: [14, 4, 4, 4, 4, 4, 14],
  74: [1, 1, 1, 1, 17, 17, 14],
  75: [17, 18, 20, 24, 20, 18, 17],
  76: [16, 16, 16, 16, 16, 16, 31],
  77: [17, 27, 21, 21, 17, 17, 17],
  78: [17, 25, 21, 19, 17, 17, 17],
  79: [14, 17, 17, 17, 17, 17, 14],
  80: [30, 17, 17, 30, 16, 16, 16],
  81: [14, 17, 17, 17, 21, 18, 13],
  82: [30, 17, 17, 30, 20, 18, 17],
  83: [14, 17, 16, 14, 1, 17, 14],
  84: [31, 4, 4, 4, 4, 4, 4],
  85: [17, 17, 17, 17, 17, 17, 14],
  86: [17, 17, 17, 17, 17, 10, 4],
  87: [17, 17, 17, 21, 21, 21, 10],
  88: [17, 17, 10, 4, 10, 17, 17],
  89: [17, 17, 10, 4, 4, 4, 4],
  90: [31, 1, 2, 4, 8, 16, 31],
};

function bitsFor(code: number): GlyphBits {
  const mapped = code >= 97 && code <= 122 ? code - 32 : code;
  return FONT[mapped] ?? [0, 0, 0, 0, 0, 0, 0];
}

export type AtlasUv = Readonly<{ u0: number; v0: number; u1: number; v1: number }>;

export function atlasUv(codePoint: number): AtlasUv {
  const index = Math.min(ASCII_ATLAS_COUNT - 1, Math.max(0, codePoint - ASCII_ATLAS_FIRST));
  const column = index % ASCII_ATLAS_COLUMNS;
  const row = Math.floor(index / ASCII_ATLAS_COLUMNS);
  const u0 = column / ASCII_ATLAS_COLUMNS;
  const v0 = 1 - (row + 1) / ASCII_ATLAS_ROWS;
  const u1 = (column + 1) / ASCII_ATLAS_COLUMNS;
  const v1 = 1 - row / ASCII_ATLAS_ROWS;
  return { u0, v0, u1, v1 };
}

export function rasterAsciiAtlas(sdf = false): Uint8Array {
  const data = new Uint8Array(ASCII_ATLAS_WIDTH * ASCII_ATLAS_HEIGHT * 4);
  for (let glyph = 0; glyph < ASCII_ATLAS_COUNT; glyph += 1) {
    const code = ASCII_ATLAS_FIRST + glyph;
    const bits = bitsFor(code);
    const column = glyph % ASCII_ATLAS_COLUMNS;
    const row = Math.floor(glyph / ASCII_ATLAS_COLUMNS);
    const originX = column * ASCII_ATLAS_CELL + 1;
    const originY = row * ASCII_ATLAS_CELL + 1;
    for (let y = 0; y < 7; y += 1) {
      const rowBits = bits[y] ?? 0;
      for (let x = 0; x < 5; x += 1) {
        const on = ((rowBits >> (4 - x)) & 1) === 1;
        const px = originX + x;
        const py = originY + y;
        const index = (py * ASCII_ATLAS_WIDTH + px) * 4;
        const cover = on ? 255 : 0;
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
        data[index + 3] = cover;
      }
    }
  }
  if (sdf) writeSignedDistanceField(data, ASCII_ATLAS_WIDTH, ASCII_ATLAS_HEIGHT, 4);
  return data;
}

export type RasterText = Readonly<{
  width: number;
  height: number;
  data: Uint8Array;
}>;

export function rasterText(text: string, color: number, pixelSize = 2): RasterText {
  const gw = 6 * pixelSize;
  const gh = 8 * pixelSize;
  const width = Math.max(1, text.length * gw);
  const height = gh;
  const data = new Uint8Array(width * height * 4);
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.codePointAt(i) ?? 63;
    const bits = bitsFor(code);
    const ox = i * gw + pixelSize;
    const oy = pixelSize;
    for (let y = 0; y < 7; y += 1) {
      const rowBits = bits[y] ?? 0;
      for (let x = 0; x < 5; x += 1) {
        if (((rowBits >> (4 - x)) & 1) !== 1) continue;
        for (let py = 0; py < pixelSize; py += 1) {
          for (let px = 0; px < pixelSize; px += 1) {
            const index = ((oy + y * pixelSize + py) * width + (ox + x * pixelSize + px)) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
          }
        }
      }
    }
  }
  return { width, height, data };
}

function writeSignedDistanceField(
  data: Uint8Array,
  width: number,
  height: number,
  spread: number,
): void {
  const inside = new Uint8Array(width * height);
  for (let i = 0; i < inside.length; i += 1) {
    inside[i] = (data[i * 4 + 3] ?? 0) > 127 ? 1 : 0;
  }
  const spreadSq = spread * spread;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const on = inside[y * width + x] === 1;
      let best = spreadSq;
      const y0 = Math.max(0, y - spread);
      const y1 = Math.min(height - 1, y + spread);
      const x0 = Math.max(0, x - spread);
      const x1 = Math.min(width - 1, x + spread);
      for (let sy = y0; sy <= y1; sy += 1) {
        for (let sx = x0; sx <= x1; sx += 1) {
          if ((inside[sy * width + sx] === 1) === on) continue;
          const distSq = (sx - x) * (sx - x) + (sy - y) * (sy - y);
          if (distSq < best) best = distSq;
        }
      }
      const signed = (on ? 1 : -1) * Math.min(spread, Math.sqrt(best));
      const encoded = 128 + Math.round((signed / spread) * 127);
      data[(y * width + x) * 4 + 3] = Math.max(0, Math.min(255, encoded));
    }
  }
}
