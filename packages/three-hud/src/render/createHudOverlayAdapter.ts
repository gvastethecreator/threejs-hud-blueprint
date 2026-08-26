import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  Matrix4,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  Quaternion,
  RGBAFormat,
  SRGBColorSpace,
  Scene,
  UnsignedByteType,
  Vector3,
  type Texture,
} from "three";
import type { ReadonlyRect } from "../contracts/geometry.js";
import type { HudLayer } from "../core/HudLayer.js";
import type { HudNode } from "../core/HudNode.js";
import { cssRectToDevice } from "../viewport/hostSurface.js";
import { HudResourcePool } from "./resourcePool.js";
import {
  logicalSizeToClip,
  logicalToClip,
  resolveLayerViewport,
  type LayerViewportTransform,
} from "../viewport/layerTransform.js";
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
  const shapeMaterial = own(
    webgpuSafe
      ? new MeshBasicMaterial({
          transparent: true,
          depthTest: OVERLAY_COLOR_POLICY.depthTest,
          depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
          toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
        })
      : createOverlayShaderMaterial(false),
  );
  const sdfTextMaterial = own(
    webgpuSafe
      ? new MeshBasicMaterial({
          map: sdfAtlas,
          transparent: true,
          depthTest: OVERLAY_COLOR_POLICY.depthTest,
          depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
          toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
        })
      : createTextMaterial(sdfAtlas),
  );
  const pixelTextMaterial = own(
    webgpuSafe
      ? new MeshBasicMaterial({
          map: pixelAtlas,
          transparent: true,
          depthTest: OVERLAY_COLOR_POLICY.depthTest,
          depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
          toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
        })
      : createTextMaterial(pixelAtlas),
  );
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
  const rectMatrix = new Matrix4();
  const position = new Vector3();
  const scale = new Vector3();
  const quaternion = new Quaternion();
  const axisZ = new Vector3(0, 0, 1);

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
    pool.beginFrame();
    textPool.beginFrame();
    pixelTextPool.beginFrame();
    if (layers.length === 0 || queue.commands.length === 0) {
      pool.endFrame();
      textPool.endFrame();
      pixelTextPool.endFrame();
      return;
    }
    const hostViewport = cssViewport ?? readCssViewport(renderer);
    const dpr = renderer.getPixelRatio?.() ?? 1;
    const transforms = new Map<HudLayer, LayerViewportTransform>();
    const layerByNodeId = new Map<string, HudLayer>();
    for (const layer of layers) {
      if (!layer.enabled) continue;
      indexLayerNodes(layer, layer, layerByNodeId);
    }
    const fallback = layers.find((layer) => layer.enabled) ?? layers[0];
    if (!fallback) {
      pool.endFrame();
      textPool.endFrame();
      pixelTextPool.endFrame();
      return;
    }
    for (const command of queue.commands) {
      const layer = layerByNodeId.get(command.sourceNodeId) ?? fallback;
      let transform = transforms.get(layer);
      if (!transform) {
        const viewport = hostViewport ?? {
          x: 0,
          y: 0,
          width: layer.referenceSize.width,
          height: layer.referenceSize.height,
        };
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
    pool.endFrame();
    textPool.endFrame();
    pixelTextPool.endFrame();
  }

  function writeCommand(command: HudDrawCommand, transform: LayerViewportTransform): void {
    if (command.kind === "text") {
      if (webgpuSafe) return;
      const pixel = command.fontId === "pixel";
      const glyphs = pixel ? pixelTextPool : textPool;
      const snapTransform = pixel ? { ...transform, pixelSnap: true } : transform;
      for (const glyph of command.glyphs) {
        if (command.clip && !intersectRects(glyph, command.clip)) continue;
        placeRect(glyph, snapTransform);
        const slot = glyphs.acquireSlot();
        glyphs.writeInstance(slot, rectMatrix, command.fill, {
          shape: SHAPE_TEXT,
          params: [0, pixel ? 1 : 0, 0, command.opacity],
          uv: [glyph.u0, glyph.v0, glyph.u1, glyph.v1],
        });
      }
      return;
    }
    if (command.kind === "image") {
      if (command.clip && !intersectRects(command.bounds, command.clip)) return;
      placeRect(command.bounds, transform);
      const slot = pool.acquireSlot();
      pool.writeInstance(slot, rectMatrix, command.tint, {
        shape: SHAPE_IMAGE,
        params: [0, 0, 0, command.opacity],
        uv: clipToUv(command.bounds, command.clip),
      });
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
      const slot = pool.acquireSlot();
      pool.writeInstance(slot, rectMatrix, command.fill, {
        shape: SHAPE_LINE,
        params: [params.strokeWidth ?? 1, 0, 0, command.opacity],
      });
      return;
    }
    if (command.clip && !intersectRects(command.bounds, command.clip)) return;
    placeRect(command.bounds, transform);
    const slot = pool.acquireSlot();
    const clipUv = clipToUv(command.bounds, command.clip);
    if (command.shape === "ring") {
      const inner = params?.innerRadius ?? 0;
      const outer = params?.outerRadius ?? 1;
      pool.writeInstance(slot, rectMatrix, command.fill, {
        shape: SHAPE_RING,
        params: [
          outer <= 0 ? 0 : inner / outer,
          params?.startAngle ?? 0,
          params?.sweep ?? Math.PI * 2,
          command.opacity,
        ],
        uv: clipUv,
      });
      return;
    }
    if (command.shape === "rounded-rect") {
      const radius = params?.radius ?? 0;
      const minSide = Math.min(command.bounds.width, command.bounds.height);
      pool.writeInstance(slot, rectMatrix, command.fill, {
        shape: SHAPE_ROUNDED,
        params: [minSide <= 0 ? 0 : Math.min(0.5, radius / minSide), 0, 0, command.opacity],
        uv: clipUv,
      });
      return;
    }
    pool.writeInstance(slot, rectMatrix, command.fill, {
      shape: SHAPE_RECT,
      params: [0, 0, 0, command.opacity],
      uv: clipUv,
    });
  }

  function placeRect(
    bounds: { x: number; y: number; width: number; height: number },
    transform: LayerViewportTransform,
  ): void {
    const snapped = snapDrawBounds(bounds, transform);
    const clip = logicalToClip(
      { x: snapped.x + snapped.width / 2, y: snapped.y + snapped.height / 2 },
      transform,
    );
    const clipSize = logicalSizeToClip({ width: snapped.width, height: snapped.height }, transform);
    rectMatrix.makeScale(clipSize.width, clipSize.height, 1);
    rectMatrix.setPosition(clip.x, clip.y, 0);
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
    const clip = logicalToClip({ x: (x1 + x2) / 2, y: (y1 + y2) / 2 }, transform);
    const clipSize = logicalSizeToClip({ width: length, height: stroke }, transform);
    position.set(clip.x, clip.y, 0);
    scale.set(clipSize.width, clipSize.height, 1);
    quaternion.setFromAxisAngle(axisZ, -Math.atan2(dy, dx));
    rectMatrix.compose(position, quaternion, scale);
  }
}

function indexLayerNodes(
  layer: HudLayer,
  node: HudNode,
  into: Map<string, HudLayer>,
): void {
  into.set(node.id, layer);
  for (const child of node.children) indexLayerNodes(layer, child, into);
}

function clipToUv(
  bounds: { x: number; y: number; width: number; height: number },
  clip: { x: number; y: number; width: number; height: number } | null | undefined,
): readonly [number, number, number, number] {
  if (!clip || bounds.width === 0 || bounds.height === 0) return [0, 0, 1, 1];
  const u0 = (clip.x - bounds.x) / bounds.width;
  const u1 = (clip.x + clip.width - bounds.x) / bounds.width;
  const vHud0 = (clip.y - bounds.y) / bounds.height;
  const vHud1 = (clip.y + clip.height - bounds.y) / bounds.height;
  return [
    Math.min(1, Math.max(0, u0)),
    Math.min(1, Math.max(0, 1 - vHud1)),
    Math.min(1, Math.max(0, u1)),
    Math.min(1, Math.max(0, 1 - vHud0)),
  ];
}

function readCssViewport(renderer: OverlayRendererLike): ReadonlyRect | null {
  const target = {
    x: 0,
    y: 0,
    set(x: number, y: number) {
      this.x = x;
      this.y = y;
      return this;
    },
  };
  const size = renderer.getSize?.(target) ?? target;
  if (!Number.isFinite(size.x) || !Number.isFinite(size.y) || size.x <= 0 || size.y <= 0)
    return null;
  return { x: 0, y: 0, width: size.x, height: size.y };
}

function snapDrawBounds(
  bounds: { x: number; y: number; width: number; height: number },
  transform: LayerViewportTransform,
): { x: number; y: number; width: number; height: number } {
  if (!transform.pixelSnap || transform.scaleX === 0 || transform.scaleY === 0) return bounds;
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
  return {
    x: (x0 - transform.offsetX) / transform.scaleX,
    y: (y0 - transform.offsetY) / transform.scaleY,
    width: Math.max(0, x1 - x0) / transform.scaleX,
    height: Math.max(0, y1 - y0) / transform.scaleY,
  };
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
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  texture.flipY = true;
  return texture;
}
