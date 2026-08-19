export type OverlayVec4 = Readonly<{ x: number; y: number; z: number; w: number }>;

export type RendererOverlayState = Readonly<{
  autoClear: boolean;
  autoClearColor: boolean;
  autoClearDepth: boolean;
  autoClearStencil: boolean;
  scissorTest: boolean;
  viewport: OverlayVec4;
  scissor: OverlayVec4;
  renderTarget: unknown;
  pixelRatio: number | null;
  toneMapping: unknown;
  outputColorSpace: unknown;
}>;

export type OverlayRendererLike = {
  autoClear?: boolean;
  autoClearColor?: boolean;
  autoClearDepth?: boolean;
  autoClearStencil?: boolean;
  toneMapping?: unknown;
  outputColorSpace?: unknown;
  getPixelRatio?: () => number;
  setPixelRatio?: (value: number) => void;
  getSize?: (target: { x: number; y: number }) => { x: number; y: number };
  getDrawingBufferSize?: (target: { x: number; y: number }) => { x: number; y: number };
  getViewport?: (target: OverlayVec4Target) => unknown;
  setViewport?: (x: number, y: number, width: number, height: number) => void;
  getScissor?: (target: OverlayVec4Target) => unknown;
  setScissor?: (x: number, y: number, width: number, height: number) => void;
  getScissorTest?: () => boolean;
  setScissorTest?: (value: boolean) => void;
  getRenderTarget?: () => unknown;
  setRenderTarget?: (target: unknown) => void;
  isWebGLRenderer?: boolean;
  isWebGPURenderer?: boolean;
  clear?: (color?: boolean, depth?: boolean, stencil?: boolean) => void;
  render?: (scene: unknown, camera: unknown) => void;
};

export type OverlayVec4Target = {
  x: number;
  y: number;
  z: number;
  w: number;
  copy?: (vector: OverlayVec4) => OverlayVec4Target;
};

const emptyVec4: OverlayVec4 = Object.freeze({ x: 0, y: 0, z: 0, w: 0 });

export function snapshotRendererOverlayState(renderer: OverlayRendererLike): RendererOverlayState {
  return Object.freeze({
    autoClear: renderer.autoClear !== false,
    autoClearColor: renderer.autoClearColor !== false,
    autoClearDepth: renderer.autoClearDepth !== false,
    autoClearStencil: renderer.autoClearStencil !== false,
    scissorTest: renderer.getScissorTest?.() === true,
    viewport: readVec4(renderer, "getViewport"),
    scissor: readVec4(renderer, "getScissor"),
    renderTarget: renderer.getRenderTarget?.() ?? null,
    pixelRatio: finiteNumber(renderer.getPixelRatio?.()),
    toneMapping: renderer.toneMapping ?? null,
    outputColorSpace: renderer.outputColorSpace ?? null,
  });
}

export function restoreRendererOverlayState(
  renderer: OverlayRendererLike,
  snapshot: RendererOverlayState,
): void {
  renderer.autoClear = snapshot.autoClear;
  renderer.autoClearColor = snapshot.autoClearColor;
  renderer.autoClearDepth = snapshot.autoClearDepth;
  renderer.autoClearStencil = snapshot.autoClearStencil;
  renderer.setScissorTest?.(snapshot.scissorTest);
  renderer.setViewport?.(
    snapshot.viewport.x,
    snapshot.viewport.y,
    snapshot.viewport.z,
    snapshot.viewport.w,
  );
  renderer.setScissor?.(
    snapshot.scissor.x,
    snapshot.scissor.y,
    snapshot.scissor.z,
    snapshot.scissor.w,
  );
  renderer.setRenderTarget?.(snapshot.renderTarget);
  if (snapshot.pixelRatio !== null) renderer.setPixelRatio?.(snapshot.pixelRatio);
  if ("toneMapping" in renderer) renderer.toneMapping = snapshot.toneMapping;
  if ("outputColorSpace" in renderer) renderer.outputColorSpace = snapshot.outputColorSpace;
}

export function overlayStateDiff(
  before: RendererOverlayState,
  after: RendererOverlayState,
): string[] {
  const keys: string[] = [];
  (Object.keys(before) as Array<keyof RendererOverlayState>).forEach((key) => {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) keys.push(key);
  });
  return keys;
}

function readVec4(
  renderer: OverlayRendererLike,
  method: "getViewport" | "getScissor",
): OverlayVec4 {
  const reader = renderer[method];
  if (typeof reader !== "function") return emptyVec4;
  const target: OverlayVec4Target = {
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    copy(vector) {
      this.x = vector.x;
      this.y = vector.y;
      this.z = vector.z;
      this.w = vector.w;
      return this;
    },
  };
  reader.call(renderer, target);
  return Object.freeze({ x: target.x, y: target.y, z: target.z, w: target.w });
}

function finiteNumber(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
