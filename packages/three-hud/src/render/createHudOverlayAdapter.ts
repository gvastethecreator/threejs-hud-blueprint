import {
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
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
import {
  ASCII_ATLAS_HEIGHT,
  ASCII_ATLAS_WIDTH,
  rasterAsciiAtlas,
  rasterText,
} from "../text/asciiAtlas.js";
import type { HudDrawCommand, ShapeParams, TextDrawableCommand } from "./commands.js";

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
  const atlas = own(createAtlasTexture());
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
  const textMaterial = own(
    webgpuSafe
      ? new MeshBasicMaterial({
          map: atlas,
          transparent: true,
          depthTest: OVERLAY_COLOR_POLICY.depthTest,
          depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
          toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
        })
      : createTextMaterial(atlas),
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
      material: textMaterial,
    }),
  );
  textPool.mesh.renderOrder = 2;
  textPool.mesh.visible = false;
  scene.add(textPool.mesh);
  const labels = new Group();
  labels.renderOrder = 3;
  scene.add(labels);
  const labelCache = new Map<
    string,
    { mesh: Mesh; texture: DataTexture; material: MeshBasicMaterial; key: string }
  >();
  const usedLabels = new Set<string>();
  const labelGeometry = own(new PlaneGeometry(1, 1));
  const rectMatrix = new Matrix4();
  const labelColor = new Color();
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
    usedLabels.clear();
    const hostViewport = cssViewport ?? readCssViewport(renderer);
    const dpr = renderer.getPixelRatio?.() ?? 1;
    const transforms = new Map<HudLayer, LayerViewportTransform>();
    const layerOf = (sourceNodeId: string): HudLayer => {
      for (const layer of layers) {
        if (!layer.enabled) continue;
        const match = findLayer(layer, sourceNodeId);
        if (match) return match;
      }
      const fallback = layers.find((layer) => layer.enabled) ?? layers[0];
      if (!fallback) throw new Error("HUD overlay has no layer.");
      return fallback;
    };
    for (const command of queue.commands) {
      const layer = layerOf(command.sourceNodeId);
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
    for (const [key, gpu] of labelCache) {
      gpu.mesh.visible = usedLabels.has(key);
    }
  }

  function writeCommand(command: HudDrawCommand, transform: LayerViewportTransform): void {
    if (command.kind === "text") {
      for (const glyph of command.glyphs) {
        const visible = command.clip ? intersectRects(glyph, command.clip) : glyph;
        if (!visible) continue;
        placeRect(visible, transform);
        const slot = textPool.acquireSlot();
        textPool.writeInstance(slot, rectMatrix, command.fill, {
          shape: SHAPE_TEXT,
          params: [0, 0, 0, command.opacity],
          uv: [glyph.u0, glyph.v0, glyph.u1, glyph.v1],
        });
      }
      writeRasterLabel(command, transform);
      return;
    }
    if (command.kind === "image") {
      const visible = command.clip ? intersectRects(command.bounds, command.clip) : command.bounds;
      if (!visible) return;
      placeRect(visible, transform);
      const slot = pool.acquireSlot();
      pool.writeInstance(slot, rectMatrix, command.tint, {
        shape: SHAPE_IMAGE,
        params: [0, 0, 0, command.opacity],
      });
      return;
    }
    if (command.kind !== "shape") return;
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
    const visible = command.clip ? intersectRects(command.bounds, command.clip) : command.bounds;
    if (!visible) return;
    placeRect(visible, transform);
    const slot = pool.acquireSlot();
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
      });
      return;
    }
    if (command.shape === "rounded-rect") {
      const radius = params?.radius ?? 0;
      const minSide = Math.min(command.bounds.width, command.bounds.height);
      pool.writeInstance(slot, rectMatrix, command.fill, {
        shape: SHAPE_ROUNDED,
        params: [minSide <= 0 ? 0 : Math.min(0.5, radius / minSide), 0, 0, command.opacity],
      });
      return;
    }
    pool.writeInstance(slot, rectMatrix, command.fill, {
      shape: SHAPE_RECT,
      params: [0, 0, 0, command.opacity],
    });
  }

  function placeRect(
    bounds: { x: number; y: number; width: number; height: number },
    transform: LayerViewportTransform,
  ): void {
    const clip = logicalToClip(
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
      transform,
    );
    const clipSize = logicalSizeToClip({ width: bounds.width, height: bounds.height }, transform);
    rectMatrix.makeScale(clipSize.width, clipSize.height, 1);
    rectMatrix.setPosition(clip.x, clip.y, 0);
  }

  function writeRasterLabel(command: TextDrawableCommand, transform: LayerViewportTransform): void {
    if (command.text.length === 0 || command.bounds.width <= 0 || command.bounds.height <= 0)
      return;
    const pixelSize = Math.max(2, Math.round(command.bounds.height / 8));
    const key = `${command.sourceNodeId}|${command.text}|${command.fill}|${pixelSize}`;
    usedLabels.add(key);
    let gpu = labelCache.get(key);
    if (!gpu) {
      const raster = rasterText(command.text, 0xffffff, pixelSize);
      const texture = new DataTexture(
        raster.data,
        raster.width,
        raster.height,
        RGBAFormat,
        UnsignedByteType,
      );
      texture.magFilter = NearestFilter;
      texture.minFilter = NearestFilter;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
      texture.flipY = true;
      const material = new MeshBasicMaterial({
        map: texture,
        color: 0xffffff,
        transparent: true,
        depthTest: OVERLAY_COLOR_POLICY.depthTest,
        depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
        toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
        opacity: command.opacity,
        alphaTest: 0.05,
      });
      labelColor.setHex(command.fill);
      material.color.copy(labelColor);
      const mesh = new Mesh(labelGeometry, material);
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      mesh.renderOrder = 3;
      labels.add(mesh);
      gpu = { mesh, texture, material, key };
      labelCache.set(key, gpu);
      own({
        dispose() {
          texture.dispose();
          material.dispose();
        },
      });
    }
    const visible = command.clip ? intersectRects(command.bounds, command.clip) : command.bounds;
    if (!visible) {
      gpu.mesh.visible = false;
      return;
    }
    placeRect(visible, transform);
    gpu.mesh.matrix.copy(rectMatrix);
    gpu.mesh.matrixWorldNeedsUpdate = true;
    gpu.mesh.visible = true;
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

function findLayer(root: HudLayer, sourceNodeId: string): HudLayer | null {
  return containsNode(root, sourceNodeId) ? root : null;
}

function containsNode(node: HudNode, sourceNodeId: string): boolean {
  if (node.id === sourceNodeId) return true;
  for (const child of node.children) {
    if (containsNode(child, sourceNodeId)) return true;
  }
  return false;
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

function createAtlasTexture(): Texture {
  const data = rasterAsciiAtlas(false);
  const texture = new DataTexture(
    data,
    ASCII_ATLAS_WIDTH,
    ASCII_ATLAS_HEIGHT,
    RGBAFormat,
    UnsignedByteType,
  );
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  texture.flipY = true;
  return texture;
}
