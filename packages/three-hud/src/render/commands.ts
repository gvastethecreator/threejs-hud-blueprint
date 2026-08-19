import type { HudBlendMode, ReadonlyRect } from "../contracts/geometry.js";

export type { HudBlendMode };
export type HudDrawKind = "shape" | "image" | "text" | "debug";
export type HudShapeKind = "rect" | "rounded-rect" | "line" | "ring";

export type ResourceHandle = Readonly<{
  kind: "texture" | "font" | "atlas";
  id: string;
}>;

export type DrawCommandBase = Readonly<{
  kind: HudDrawKind;
  layerOrder: number;
  zIndex: number;
  sequence: number;
  opacity: number;
  clip: ReadonlyRect | null;
  blend: HudBlendMode;
  sourceNodeId: string;
  batchKey: string;
  rendererProfile: string;
}>;

export type ShapeParams = Readonly<{
  radius?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  sweep?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  strokeWidth?: number;
}>;

export type ShapeInstanceCommand = DrawCommandBase &
  Readonly<{
    kind: "shape";
    shape: HudShapeKind;
    bounds: ReadonlyRect;
    fill: number;
    shapeParams?: ShapeParams;
  }>;

export type ImageInstanceCommand = DrawCommandBase &
  Readonly<{
    kind: "image";
    bounds: ReadonlyRect;
    resource: ResourceHandle;
    tint: number;
  }>;

export type GlyphQuad = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}>;

export type TextDrawableCommand = DrawCommandBase &
  Readonly<{
    kind: "text";
    bounds: ReadonlyRect;
    resource: ResourceHandle;
    glyphCount: number;
    fill: number;
    text: string;
    glyphs: readonly GlyphQuad[];
  }>;

export type DebugCommand = DrawCommandBase &
  Readonly<{
    kind: "debug";
    bounds: ReadonlyRect;
    label: string;
  }>;

export type HudDrawCommand =
  | ShapeInstanceCommand
  | ImageInstanceCommand
  | TextDrawableCommand
  | DebugCommand;

export type BatchKeySource = Readonly<{
  kind: HudDrawKind;
  rendererProfile: string;
  blend: HudBlendMode;
  clip: ReadonlyRect | null;
  shape?: HudShapeKind;
  resource?: ResourceHandle;
}>;

export function composeBatchKey(command: BatchKeySource): string {
  const resourceId = command.resource?.id ?? "-";
  const shape = command.kind === "shape" ? (command.shape ?? "rect") : command.kind;
  const clip = command.clip ? "clip" : "noclip";
  return `${command.rendererProfile}|${command.kind}|${shape}|${command.blend}|${clip}|${resourceId}`;
}

export function serializeDrawCommand(command: HudDrawCommand): HudDrawCommand {
  return JSON.parse(JSON.stringify(command)) as HudDrawCommand;
}
