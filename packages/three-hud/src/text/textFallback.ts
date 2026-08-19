import type { HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { emitDiagnostic } from "../contracts/diagnostics.js";
import { HudError } from "../contracts/errors.js";
import type { GlyphRun } from "./contracts.js";
import { layoutText, type LayoutFontFace, type LayoutTextResult } from "./layoutText.js";
import type { TextStyle } from "./textStyle.js";

export const NOTDEF_GLYPH_ID = 0;

export type FallbackLayout = Readonly<{
  runs: readonly GlyphRun[];
  missingCodePoints: readonly number[];
  replacementCount: number;
}>;

export function detectFallbackCycle(ids: readonly string[]): string[] | null {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) return [...seen, id];
    seen.add(id);
  }
  return null;
}

export function layoutWithFallbacks(
  text: string,
  style: TextStyle,
  faces: readonly LayoutFontFace[],
  onDiagnostic?: HudDiagnosticHandler,
  debugText = false,
): FallbackLayout {
  if (faces.length === 0)
    throw new HudError("INVALID_ARGUMENT", "At least one font face is required.");
  const cycle = detectFallbackCycle(faces.map((face) => face.id));
  if (cycle) {
    emitDiagnostic(onDiagnostic, {
      severity: "error",
      code: "FALLBACK_CYCLE",
      message: "Font fallback chain contains a cycle.",
      details: { cycle: cycle.join(">"), text: debugText ? text.slice(0, 32) : null },
    });
    throw new HudError("INVALID_ARGUMENT", "Font fallback chain contains a cycle.", {
      cycle: cycle.join(">"),
    });
  }
  const missing: number[] = [];
  const diagnosed = new Set<number>();
  const runs: GlyphRun[] = [];
  let currentId = faces[0]?.id;
  let buffer = "";

  const flush = (): void => {
    if (buffer.length === 0 || !currentId) return;
    const face = faces.find((item) => item.id === currentId) ?? faces[0];
    if (!face) return;
    const laid = layoutText(buffer, style, face, onDiagnostic);
    runs.push(laid.run);
    buffer = "";
  };

  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const resolved = resolveFace(code, faces);
    if (!resolved.hasGlyph && code !== 32 && code !== 10) {
      missing.push(code);
      if (!diagnosed.has(code)) {
        diagnosed.add(code);
        emitDiagnostic(onDiagnostic, {
          severity: "warning",
          code: "MISSING_GLYPH",
          message: "Missing glyph replaced with .notdef.",
          details: { codePoint: code, fontId: resolved.face.id, text: debugText ? char : null },
        });
      }
    }
    if (resolved.face.id !== currentId) {
      flush();
      currentId = resolved.face.id;
    }
    buffer += char;
  }
  flush();
  return Object.freeze({
    runs: Object.freeze(runs),
    missingCodePoints: Object.freeze(missing),
    replacementCount: missing.length,
  });
}

function resolveFace(
  codePoint: number,
  faces: readonly LayoutFontFace[],
): { face: LayoutFontFace; hasGlyph: boolean } {
  for (const face of faces) {
    const glyphId = face.glyphId(codePoint);
    if (glyphId !== NOTDEF_GLYPH_ID || codePoint === 32)
      return { face, hasGlyph: glyphId !== NOTDEF_GLYPH_ID || codePoint === 32 };
  }
  const fallback = faces[0];
  if (!fallback) throw new HudError("INVALID_ARGUMENT", "At least one font face is required.");
  return { face: fallback, hasGlyph: false };
}

export function measureFallback(
  text: string,
  style: TextStyle,
  faces: readonly LayoutFontFace[],
): LayoutTextResult {
  const primary = faces[0];
  if (!primary) throw new HudError("INVALID_ARGUMENT", "At least one font face is required.");
  return layoutText(text, style, primary);
}
