import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  Matrix4,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  Quaternion,
  NoColorSpace,
  RGBAFormat,
  Scene,
  UnsignedByteType,
  Vector3,
  type Texture,
  type Material,
} from "three";
import type { ReadonlyRect } from "../contracts/geometry.js";
import type { HudLayer } from "../core/HudLayer.js";
import type { HudNode } from "../core/HudNode.js";
import { cssRectToDevice } from "../viewport/hostSurface.js";
import { HudResourcePool } from "./resourcePool.js";
import { resolveLayerViewport, type LayerViewportTransform } from "../viewport/layerTransform.js";
import { snapCssToDevicePixel } from "../viewport/resolveViewport.js";
import type { HudFrameInfo, HudRendererAdapter } from "./contracts.js";
import { intersectRects } from "./clip.js";
import { encodeOverlayQueue } from "./encodeOverlayQueue.js";
import {
  OVERLAY_COLOR_POLICY,
  resolveOverlayRendererProfile,
  type OverlayRendererProfile,
} from "./overlayProfile.js";
import type { RenderQueueSnapshot } from "./renderQueue.js";
import {
  restoreRendererOverlayState,
  snapshotRendererOverlayState,
  type OverlayRendererLike,
} from "./overlayState.js";
import {
  SHAPE_IMAGE,
  SHAPE_LINE,
  SHAPE_RECT,
  SHAPE_RING,
  SHAPE_ROUNDED,
  SHAPE_TEXT,
  createOverlayShaderMaterial,
  createTextMaterial,
} from "./overlayMaterial.js";
import { ASCII_ATLAS_HEIGHT, ASCII_ATLAS_WIDTH, rasterAsciiAtlas } from "../text/asciiAtlas.js";
import type { HudDrawCommand, ShapeParams } from "./commands.js";

export type HudOverlayAdapterOptions = Readonly<{
  renderer: OverlayRendererLike;
  clearDepth?: boolean;
  cssViewport?: ReadonlyRect;
  /** Host-owned textures keyed by HudTextureHandle.id. The adapter never disposes them. */
  textures?: ReadonlyMap<string, Texture>;
}>;

export type HudOverlayAdapter = HudRendererAdapter & {
  readonly clearDepth: boolean;
  readonly ownedResourceCount: number;
  readonly profile: OverlayRendererProfile;
  readonly colorPolicy: typeof OVERLAY_COLOR_POLICY;
  readonly lastQueue: RenderQueueSnapshot | null;
  readonly debugMeshCount: number;
  debugInstanceUv(index: number): readonly [number, number, number, number];
  debugInstanceShape(index: number): number;
  debugInstanceScale(index: number): { x: number; y: number };
  debugShapeUv(index: number): readonly [number, number, number, number];
  debugTextInstanceShape(index: number): number;
  debugShapeMaterial(): unknown;
  debugTextMaterial(): unknown;
};

type DisposableResource = { dispose: () => void };

export function createHudOverlayAdapter(options: HudOverlayAdapterOptions): HudOverlayAdapter {
  const renderer = options.renderer;
  const profile = resolveOverlayRendererProfile(renderer);
  const clearDepth = options.clearDepth === true;
  const cssViewport = options.cssViewport;
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 10);
  camera.position.z = 1;
  const owned: DisposableResource[] = [];
  const sdfAtlas = own(createAtlasTexture(true, LinearFilter));
  const pixelAtlas = own(createAtlasTexture(false, NearestFilter));
  const webgpuSafe = profile === "webgpu";
  const shapeMaterial = webgpuSafe
    ? new MeshBasicMaterial({
        transparent: true,
        depthTest: OVERLAY_COLOR_POLICY.depthTest,
        depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
        toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
      })
    : createOverlayShaderMaterial(false);
  const sdfTextMaterial = webgpuSafe
    ? new MeshBasicMaterial({
        map: sdfAtlas,
        transparent: true,
        depthTest: OVERLAY_COLOR_POLICY.depthTest,
        depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
        toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
      })
    : createTextMaterial(sdfAtlas);
  const pixelTextMaterial = webgpuSafe
    ? new MeshBasicMaterial({
        map: pixelAtlas,
        transparent: true,
        depthTest: OVERLAY_COLOR_POLICY.depthTest,
        depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
        toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
      })
    : createTextMaterial(pixelAtlas);
  const pool = own(
    new HudResourcePool({ initialCapacity: 64, maxCapacity: 4096, material: shapeMaterial }),
  );
  pool.mesh.renderOrder = 1;
  scene.add(pool.mesh);
  const textPool = own(
    new HudResourcePool({
      initialCapacity: 64,
      maxCapacity: 4096,
      material: sdfTextMaterial,
    }),
  );
  textPool.mesh.renderOrder = 2;
  scene.add(textPool.mesh);
  const pixelTextPool = own(
    new HudResourcePool({
      initialCapacity: 64,
      maxCapacity: 4096,
      material: pixelTextMaterial,
    }),
  );
  pixelTextPool.mesh.renderOrder = 3;
  scene.add(pixelTextPool.mesh);
  const allPools = [pool, textPool, pixelTextPool];
  const materialFactories = new Map<HudResourcePool, () => Material>([
    [pool, () => shapeMaterial.clone()],
    [textPool, () => createTextMaterial(sdfAtlas)],
    [pixelTextPool, () => createTextMaterial(pixelAtlas)],
  ]);
  const extraRuns = new Map<HudResourcePool, HudResourcePool[]>();
  const runCounts = new Map<HudResourcePool, number>();
  const texturePools = new Map<string, HudResourcePool>();
  let previousPool: HudResourcePool | null = null;
  let activePool = pool;
  let runOrder = 0;
  function orderedPool(base: HudResourcePool): HudResourcePool {
    if (previousPool === base) return activePool;
    previousPool = base;
    const occurrence = runCounts.get(base) ?? 0;
    runCounts.set(base, occurrence + 1);
    activePool = base;
    if (occurrence > 0) {
      const extras = extraRuns.get(base) ?? [];
      extraRuns.set(base, extras);
      let extra = extras[occurrence - 1];
      if (!extra) {
        extra = own(
          new HudResourcePool({
            initialCapacity: 16,
            maxCapacity: 4096,
            material: materialFactories.get(base)!(),
          }),
        );
        extras.push(extra);
        allPools.push(extra);
        scene.add(extra.mesh);
        extra.beginFrame();
      }
      activePool = extra;
    }
    activePool.mesh.renderOrder = ++runOrder;
    return activePool;
  }
  const rectMatrix = new Matrix4();
  const position = new Vector3();
  const scale = new Vector3();
  const quaternion = new Quaternion();
  const axisZ = new Vector3(0, 0, 1);
  const transforms = new Map<HudLayer, LayerViewportTransform>();
  const layerByNodeId = new Map<string, HudLayer>();
  const sizeTarget = {
    x: 0,
    y: 0,
    set(x: number, y: number) {
      this.x = x;
      this.y = y;
      return this;
    },
  };
  const hostViewportRect = { x: 0, y: 0, width: 0, height: 0 };
  const fallbackViewport = { x: 0, y: 0, width: 0, height: 0 };
  const snappedBounds = { x: 0, y: 0, width: 0, height: 0 };
  const scratchUv: [number, number, number, number] = [0, 0, 1, 1];
  const scratchParams: [number, number, number, number] = [0, 0, 0, 1];
  const scratchExtras = {
    shape: 0,
    params: scratchParams,
    uv: scratchUv,
  };

  let disposed = false;
  let lastQueue: RenderQueueSnapshot | null = null;

  return {
    id: "three-hud-overlay",
    clearDepth,
    profile,
    colorPolicy: OVERLAY_COLOR_POLICY,
    get ownedResourceCount() {
      return owned.length;
    },
    get lastQueue() {
      return lastQueue;
    },
    get debugMeshCount() {
      return scene.children.length;
    },
    debugInstanceUv(index: number) {
      return textPool.instanceUv(index);
    },
    debugInstanceShape(index: number) {
      return pool.instanceShape(index);
    },
    debugInstanceScale(index: number) {
      const array = pool.mesh.instanceMatrix.array;
      const base = index * 16;
      return { x: Number(array[base] ?? 0), y: Number(array[base + 5] ?? 0) };
    },
    debugShapeUv(index: number) {
      return pool.instanceUv(index);
    },
    debugTextInstanceShape(index: number) {
      return textPool.instanceShape(index);
    },
    debugShapeMaterial() {
      return pool.mesh.material;
    },
    debugTextMaterial() {
      return textPool.mesh.material;
    },
    initialize() {},
    resize() {},
    render(layers: readonly HudLayer[], _frame: HudFrameInfo) {
      if (disposed) return;
      const snapshot = snapshotRendererOverlayState(renderer);
      try {
        lastQueue = encodeOverlayQueue(layers, profile).snapshot();
        syncQueue(layers, lastQueue);
        renderer.autoClear = false;
        renderer.autoClearColor = false;
        renderer.autoClearDepth = clearDepth;
        renderer.autoClearStencil = false;
        if (cssViewport) {
          const dpr = renderer.getPixelRatio?.() ?? 1;
          const device = cssRectToDevice(cssViewport, dpr);
          renderer.setViewport?.(device.x, device.y, device.width, device.height);
          renderer.setScissor?.(device.x, device.y, device.width, device.height);
          renderer.setScissorTest?.(true);
        } else {
          renderer.setScissorTest?.(false);
        }
        if (clearDepth) renderer.clear?.(false, true, false);
        scene.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
        renderer.render?.(scene, camera);
      } finally {
        restoreRendererOverlayState(renderer, snapshot);
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.clear();
      for (const resource of owned) {
        if (typeof resource.dispose === "function") resource.dispose();
      }
      owned.length = 0;
    },
  };

  function own<T extends DisposableResource>(resource: T): T {
    owned.push(resource);
    return resource;
  }

  function syncQueue(layers: readonly HudLayer[], queue: RenderQueueSnapshot): void {
    for (const target of allPools) target.beginFrame();
    runCounts.clear();
    previousPool = null;
    runOrder = 0;
    transforms.clear();
    layerByNodeId.clear();
    if (layers.length === 0 || queue.commands.length === 0) {
      for (const target of allPools) target.endFrame();
      return;
    }
    const hostViewport = cssViewport ?? readHostCssViewport();
    const dpr = renderer.getPixelRatio?.() ?? 1;
    for (const layer of layers) {
      if (!layer.enabled) continue;
      indexLayerNodes(layer, layer, layerByNodeId);
    }
    const fallback = layers.find((layer) => layer.enabled) ?? layers[0];
    if (!fallback) {
      for (const target of allPools) target.endFrame();
      return;
    }
    for (const command of queue.commands) {
      const layer = layerByNodeId.get(command.sourceNodeId) ?? fallback;
      let transform = transforms.get(layer);
      if (!transform) {
        let viewport = hostViewport;
        if (!viewport) {
          fallbackViewport.width = layer.referenceSize.width;
          fallbackViewport.height = layer.referenceSize.height;
          viewport = fallbackViewport;
        }
        transform = resolveLayerViewport({
          referenceSize: layer.referenceSize,
          viewport,
          mode: layer.scaleMode,
          zoom: layer.zoom,
          zoomAnchor: layer.zoomAnchor,
          dpr,
          safeInsets: layer.safeInsets,
          pixelSnap: layer.pixelSnap,
          integerDownscale: layer.integerDownscale,
        });
        transforms.set(layer, transform);
      }
      writeCommand(command, transform);
    }
    for (const target of allPools) target.endFrame();
  }

  function writeCommand(command: HudDrawCommand, transform: LayerViewportTransform): void {
    if (command.kind === "text") {
      if (webgpuSafe) return;
      const pixel = command.fontId === "pixel";
      const glyphs = pixel ? pixelTextPool : textPool;
      for (const glyph of command.glyphs) {
        const visible = command.clip ? intersectRects(glyph, command.clip) : glyph;
        if (!visible) continue;
        placeRect(visible, transform, pixel);
        const du = glyph.u1 - glyph.u0,
          dv = glyph.v1 - glyph.v0;
        scratchUv[0] = glyph.u0 + ((visible.x - glyph.x) / glyph.width) * du;
        scratchUv[1] =
          glyph.v0 + ((glyph.y + glyph.height - visible.y - visible.height) / glyph.height) * dv;
        scratchUv[2] = glyph.u0 + ((visible.x + visible.width - glyph.x) / glyph.width) * du;
        scratchUv[3] = glyph.v1 - ((visible.y - glyph.y) / glyph.height) * dv;
        writeSlot(glyphs, command.fill, SHAPE_TEXT, 0, pixel ? 1 : 0, 0, command.opacity);
      }
      return;
    }
    if (command.kind === "image") {
      if (webgpuSafe) return;
      const textureKey = command.resource.id.replace(/:(nearest|linear)$/, "");
      const texture = options.textures?.get(textureKey);
      if (!texture) return;
      let images = texturePools.get(command.resource.id);
      if (!images) {
        images = own(
          new HudResourcePool({
            initialCapacity: 16,
            maxCapacity: 4096,
            material: createTextMaterial(texture),
          }),
        );
        texturePools.set(command.resource.id, images);
        materialFactories.set(images, () => createTextMaterial(texture));
        allPools.push(images);
        scene.add(images.mesh);
        images.beginFrame();
      }
      const visible = command.clip ? intersectRects(command.bounds, command.clip) : command.bounds;
      if (!visible) return;
      placeRect(visible, transform);
      const uv = command.uv ?? { x: 0, y: 0, width: 1, height: 1 };
      const bounds = command.bounds;
      scratchUv[0] = uv.x + ((visible.x - bounds.x) / bounds.width) * uv.width;
      scratchUv[1] =
        uv.y +
        ((bounds.y + bounds.height - visible.y - visible.height) / bounds.height) * uv.height;
      scratchUv[2] = uv.x + ((visible.x + visible.width - bounds.x) / bounds.width) * uv.width;
      scratchUv[3] = uv.y + (1 - (visible.y - bounds.y) / bounds.height) * uv.height;
      writeSlot(images, command.tint, SHAPE_IMAGE, 0, 0, 0, command.opacity);
      return;
    }
    if (command.kind !== "shape") return;
    if (
      webgpuSafe &&
      (command.shape === "line" || command.shape === "ring" || command.shape === "rounded-rect")
    ) {
      return;
    }
    const params = command.shapeParams;
    if (command.shape === "line" && params) {
      placeLine(params, transform);
      scratchUv[0] = 0;
      scratchUv[1] = 0;
      scratchUv[2] = 1;
      scratchUv[3] = 1;
      writeSlot(pool, command.fill, SHAPE_LINE, params.strokeWidth ?? 1, 0, 0, command.opacity);
      return;
    }
    if (command.clip && !intersectRects(command.bounds, command.clip)) return;
    placeRect(command.bounds, transform);
    clipToUv(command.bounds, command.clip, scratchUv);
    if (command.shape === "ring") {
      const inner = params?.innerRadius ?? 0;
      const outer = params?.outerRadius ?? 1;
      writeSlot(
        pool,
        command.fill,
        SHAPE_RING,
        outer <= 0 ? 0 : inner / outer,
        params?.startAngle ?? 0,
        params?.sweep ?? Math.PI * 2,
        command.opacity,
      );
      return;
    }
    if (command.shape === "rounded-rect") {
      const radius = params?.radius ?? 0;
      const minSide = Math.min(command.bounds.width, command.bounds.height);
      writeSlot(
        pool,
        command.fill,
        SHAPE_ROUNDED,
        minSide <= 0 ? 0 : Math.min(0.5, radius / minSide),
        0,
        0,
        command.opacity,
      );
      return;
    }
    writeSlot(pool, command.fill, SHAPE_RECT, 0, 0, 0, command.opacity);
  }

  function writeSlot(
    target: HudResourcePool,
    fill: number,
    shape: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number,
  ): void {
    target = orderedPool(target);
    const slot = target.acquireSlot();
    scratchParams[0] = p0;
    scratchParams[1] = p1;
    scratchParams[2] = p2;
    scratchParams[3] = p3;
    scratchExtras.shape = shape;
    target.writeInstance(slot, rectMatrix, fill, scratchExtras);
  }

  function placeRect(
    bounds: { x: number; y: number; width: number; height: number },
    transform: LayerViewportTransform,
    pixelSnap = transform.pixelSnap,
  ): void {
    const snapped = snapDraw(bounds, transform, pixelSnap);
    const cx = snapped.x + snapped.width / 2;
    const cy = snapped.y + snapped.height / 2;
    const clipX =
      ((transform.offsetX + cx * transform.scaleX - transform.viewport.x) /
        transform.viewport.width) *
        2 -
      1;
    const clipY =
      1 -
      ((transform.offsetY + cy * transform.scaleY - transform.viewport.y) /
        transform.viewport.height) *
        2;
    const clipW = ((snapped.width * transform.scaleX) / transform.viewport.width) * 2;
    const clipH = ((snapped.height * transform.scaleY) / transform.viewport.height) * 2;
    rectMatrix.makeScale(clipW, clipH, 1);
    rectMatrix.setPosition(clipX, clipY, 0);
  }

  function placeLine(params: ShapeParams, transform: LayerViewportTransform): void {
    const x1 = params.x1 ?? 0;
    const y1 = params.y1 ?? 0;
    const x2 = params.x2 ?? 0;
    const y2 = params.y2 ?? 0;
    const stroke = Math.max(1, params.strokeWidth ?? 1);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.max(stroke, Math.hypot(dx, dy));
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    position.set(
      ((transform.offsetX + cx * transform.scaleX - transform.viewport.x) /
        transform.viewport.width) *
        2 -
        1,
      1 -
        ((transform.offsetY + cy * transform.scaleY - transform.viewport.y) /
          transform.viewport.height) *
          2,
      0,
    );
    scale.set(
      ((length * transform.scaleX) / transform.viewport.width) * 2,
      ((stroke * transform.scaleY) / transform.viewport.height) * 2,
      1,
    );
    quaternion.setFromAxisAngle(axisZ, -Math.atan2(dy, dx));
    rectMatrix.compose(position, quaternion, scale);
  }

  function snapDraw(
    bounds: { x: number; y: number; width: number; height: number },
    transform: LayerViewportTransform,
    pixelSnap: boolean,
  ): { x: number; y: number; width: number; height: number } {
    if (!pixelSnap || transform.scaleX === 0 || transform.scaleY === 0) return bounds;
    const dpr = transform.dpr;
    const x0 = snapCssToDevicePixel(transform.offsetX + bounds.x * transform.scaleX, dpr);
    const y0 = snapCssToDevicePixel(transform.offsetY + bounds.y * transform.scaleY, dpr);
    const x1 = snapCssToDevicePixel(
      transform.offsetX + (bounds.x + bounds.width) * transform.scaleX,
      dpr,
    );
    const y1 = snapCssToDevicePixel(
      transform.offsetY + (bounds.y + bounds.height) * transform.scaleY,
      dpr,
    );
    snappedBounds.x = (x0 - transform.offsetX) / transform.scaleX;
    snappedBounds.y = (y0 - transform.offsetY) / transform.scaleY;
    snappedBounds.width = Math.max(0, x1 - x0) / transform.scaleX;
    snappedBounds.height = Math.max(0, y1 - y0) / transform.scaleY;
    return snappedBounds;
  }

  function readHostCssViewport(): ReadonlyRect | null {
    const size = renderer.getSize?.(sizeTarget) ?? sizeTarget;
    if (!Number.isFinite(size.x) || !Number.isFinite(size.y) || size.x <= 0 || size.y <= 0) {
      return null;
    }
    hostViewportRect.width = size.x;
    hostViewportRect.height = size.y;
    return hostViewportRect;
  }
}

function indexLayerNodes(layer: HudLayer, node: HudNode, into: Map<string, HudLayer>): void {
  into.set(node.id, layer);
  for (const child of node.children) indexLayerNodes(layer, child, into);
}

function clipToUv(
  bounds: { x: number; y: number; width: number; height: number },
  clip: { x: number; y: number; width: number; height: number } | null | undefined,
  out: [number, number, number, number],
): void {
  if (!clip || bounds.width === 0 || bounds.height === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 1;
    out[3] = 1;
    return;
  }
  const u0 = (clip.x - bounds.x) / bounds.width;
  const u1 = (clip.x + clip.width - bounds.x) / bounds.width;
  const vHud0 = (clip.y - bounds.y) / bounds.height;
  const vHud1 = (clip.y + clip.height - bounds.y) / bounds.height;
  out[0] = Math.min(1, Math.max(0, u0));
  out[1] = Math.min(1, Math.max(0, 1 - vHud1));
  out[2] = Math.min(1, Math.max(0, u1));
  out[3] = Math.min(1, Math.max(0, 1 - vHud0));
}

function createAtlasTexture(
  sdf: boolean,
  filter: typeof NearestFilter | typeof LinearFilter,
): Texture {
  const data = rasterAsciiAtlas(sdf);
  const texture = new DataTexture(
    data,
    ASCII_ATLAS_WIDTH,
    ASCII_ATLAS_HEIGHT,
    RGBAFormat,
    UnsignedByteType,
  );
  texture.magFilter = filter;
  texture.minFilter = filter;
  texture.generateMipmaps = false;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.colorSpace = NoColorSpace;
  texture.needsUpdate = true;
  texture.flipY = true;
  return texture;
}
