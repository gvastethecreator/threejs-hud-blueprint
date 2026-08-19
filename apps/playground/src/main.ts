import {
  Crosshair,
  HUD,
  Hotbar,
  InventoryGrid,
  Label,
  LinearBar,
  Panel,
  RadialBar,
  THREE_HUD_IMPLEMENTATION_STATUS,
  connectHudPointerEvents,
  createHudOverlayAdapter,
  probeRendererCapabilities,
  resolveViewport,
  type OverlayRendererLike,
} from "@scope/three-hud";
import { createWindfoilThreeSpike, preprocessWindfoilFace } from "@scope/three-hud/text/windfoil";
import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";

const hostElement = document.querySelector<HTMLDivElement>("#app");
const statusElement = document.querySelector<HTMLDivElement>("#status");
if (hostElement === null || statusElement === null) throw new Error("Playground host is missing.");
const host = hostElement;
const status = statusElement;

const useWebgpu = new URLSearchParams(location.search).get("webgpu") === "1";
const renderer = useWebgpu ? await createWebGpuRenderer() : createWebGlRenderer();
renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
host.append(renderer.domElement);

const gameScene = new THREE.Scene();
gameScene.background = new THREE.Color(0x151a24);
const gameCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
gameCamera.position.set(3.4, 2.2, 4.4);
gameCamera.lookAt(0, 0.55, 0);

gameScene.add(new THREE.HemisphereLight(0xb9d6ff, 0x1b140c, 1.15));
const sun = new THREE.DirectionalLight(0xffe4c4, 1.7);
sun.position.set(4.5, 7, 2.5);
gameScene.add(sun);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(4.4, 64),
  new THREE.MeshStandardMaterial({ color: 0x2a3346, roughness: 0.78, metalness: 0.08 }),
);
floor.rotation.x = -Math.PI / 2;
gameScene.add(floor);

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.72, 0.24, 140, 28),
  new THREE.MeshStandardMaterial({ color: 0x4aa3ff, roughness: 0.28, metalness: 0.42 }),
);
knot.position.y = 0.92;
gameScene.add(knot);

const overlay = createHudOverlayAdapter({
  renderer: renderer as unknown as OverlayRendererLike,
  clearDepth: false,
});
const hud = new HUD({ referenceSize: { width: 1920, height: 1080 }, rendererAdapter: overlay });
const layer = hud.createLayer({ id: "smooth-ui", scaleMode: "contain" });

const title = new Label({
  id: "title",
  text: "THREE HUD",
  fontSize: 56,
  color: 0xe8f6ff,
  width: 420,
  height: 56,
});
title.setPosition(64, 18);
const health = new LinearBar({
  id: "health",
  width: 420,
  height: 36,
  value: 72,
  fill: 0x102030,
  delayedValue: 88,
  label: "HP",
});
health.setPosition(64, 64);
const ammo = new RadialBar({
  id: "ammo",
  width: 72,
  height: 72,
  value: 18,
  max: 30,
  fill: 0x1c2c3c,
});
ammo.setPosition(64, 120);
const panel = new Panel({ id: "tray", width: 280, height: 120, fill: 0x1c3a58 });
panel.setPosition(1600, 64);
panel.content.add(
  new Label({
    id: "tray-title",
    text: "TRAY",
    fontSize: 28,
    color: 0xe8f6ff,
    width: 160,
    height: 28,
  }),
);
const crosshair = new Crosshair({ id: "cross", dot: true });
crosshair.setPosition(948, 528);
const inventory = new InventoryGrid({
  id: "pack",
  columns: 4,
  rows: 2,
  cellSize: 64,
  gap: 8,
  fill: 0x1c3a58,
  items: [
    { key: "rifle", quantity: 1 },
    { key: "med", quantity: 3 },
    { key: "nade", quantity: 2 },
    { key: "empty-3", empty: true },
  ],
});
inventory.setPosition(64, 820);
const inventoryFills = [0x3d6d9e, 0x2f8a5a, 0xa85a2a, 0x2a4058] as const;
for (const [index, slot] of inventory.slots.entries()) {
  const fill = inventoryFills[index] ?? 0x2a4058;
  slot.fill = fill;
  slot.frame.fill = fill;
}
const hotbar = new Hotbar({
  id: "hotbar",
  cellSize: 64,
  fill: 0x1c3a58,
  slots: [
    { key: "gun" },
    { key: "medkit" },
    { key: "nade" },
    { key: "tool" },
    { key: "flare" },
    { key: "empty", empty: true },
  ],
});
hotbar.setPosition(680, 960);
const hotbarFills = [0x3d6d9e, 0x2f8a5a, 0xa85a2a, 0x6a5a2a, 0x8a3a5a, 0x2a4058] as const;
for (const [index, slot] of hotbar.slots.entries()) {
  const fill = hotbarFills[index] ?? 0x2a4058;
  slot.fill = fill;
  slot.frame.fill = fill;
}

layer.add(title);
layer.add(health);
layer.add(ammo);
layer.add(panel);
layer.add(crosshair);
layer.add(inventory);
layer.add(hotbar);
await hud.initialize();
const connected = connectHudPointerEvents(hud, renderer.domElement, hud.pointer);
hud.pointer.addListener(hotbar, (event) => {
  if (event.type === "click" && (event.phase === "target" || event.phase === "bubble")) {
    const index = hotbar.slots.findIndex((slot) => {
      const bounds = slot.worldBounds();
      return (
        event.logicalX >= bounds.x &&
        event.logicalX < bounds.x + bounds.width &&
        event.logicalY >= bounds.y &&
        event.logicalY < bounds.y + bounds.height
      );
    });
    if (index >= 0) {
      hotbar.activate(index);
      writeStatus();
    }
  }
});

const capability = await probeRendererCapabilities(renderer);
const preprocess = preprocessWindfoilFace({
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  lineGap: 0,
  unicodeToGlyph: { "65": 0 },
  kerning: {},
  glyphs: [
    {
      glyphId: 0,
      advanceWidth: 500,
      leftSideBearing: 0,
      empty: false,
      contours: [
        [
          { type: "move", p: { x: 0, y: 0 } },
          { type: "line", p: { x: 400, y: 0 } },
          { type: "line", p: { x: 400, y: 700 } },
          { type: "line", p: { x: 0, y: 700 } },
          { type: "close" },
        ],
      ],
    },
  ],
});
const windfoilSpike = createWindfoilThreeSpike({ capability: capability.windfoil, preprocess });
const windfoilDraw = windfoilSpike.draw([
  { glyphId: 0, x: 0, y: 0, scale: 1, color: [1, 1, 1, 1] },
  { glyphId: 0, x: 12, y: 0, scale: 1, color: [0.2, 1, 0.8, 1] },
]);
if (windfoilSpike.mesh) {
  windfoilSpike.mesh.position.set(-1.6, 1.55, 0.2);
  windfoilSpike.mesh.scale.set(1.6, 0.45, 1);
  gameScene.add(windfoilSpike.mesh);
}

function writeStatus(): void {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  const viewport = resolveViewport({
    referenceSize: hud.referenceSize,
    viewport: { x: 0, y: 0, width, height },
    mode: "contain",
    dpr: renderer.getPixelRatio(),
  });
  status.textContent = [
    `package: ${THREE_HUD_IMPLEMENTATION_STATUS}`,
    `overlay: encodeOverlayQueue shapes + 5x7 atlas text after the game scene`,
    `HUD: title + health + ammo + inventory + hotbar + crosshair over the game scene`,
    `renderer: ${useWebgpu ? "WebGPURenderer" : "WebGLRenderer"} ${capability.kind}/${capability.backend}`,
    `viewport: ${width}×${height} css px / DPR ${renderer.getPixelRatio()} / contain ${viewport.scaleX.toFixed(3)}`,
    `hotbar: slot ${hotbar.activeIndex + 1} (${hotbar.slots[hotbar.activeIndex]?.key ?? "none"})`,
    `windfoil: ${capability.windfoil.supported ? "supported" : "unsupported"}  spike=${windfoilDraw.status}`,
  ].join("\n");
}

function resize(): void {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setSize(width, height, false);
  gameCamera.aspect = width / height;
  gameCamera.updateProjectionMatrix();
  writeStatus();
  hud.resize();
}

const observer = new ResizeObserver(resize);
observer.observe(host);
resize();

let previous = performance.now();
let frameId = 0;
let stopped = false;
function frame(now: number): void {
  if (stopped) return;
  frameId = requestAnimationFrame(frame);
  const delta = Math.max(0, (now - previous) / 1000);
  previous = now;
  knot.rotation.y += delta * 0.45;
  knot.rotation.x += delta * 0.12;
  renderer.render(gameScene, gameCamera);
  if (hud.state !== "ready") return;
  try {
    health.setValue(55 + Math.sin(hud.elapsedSeconds * 1.4) * 35);
    ammo.setValue(18 + Math.sin(hud.elapsedSeconds * 0.7) * 8);
    const info = hud.update(delta);
    hud.render(info);
  } catch (error) {
    status.textContent = `HUD render failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
frameId = requestAnimationFrame(frame);

function shutdown(): void {
  if (stopped) return;
  stopped = true;
  cancelAnimationFrame(frameId);
  connected.disconnect();
  observer.disconnect();
  if (hud.state !== "disposed") hud.dispose();
  renderer.dispose();
}

addEventListener("beforeunload", shutdown);
const hot = (import.meta as { hot?: { dispose: (cb: () => void) => void } }).hot;
hot?.dispose(shutdown);

function createWebGlRenderer(): THREE.WebGLRenderer {
  return new THREE.WebGLRenderer({ antialias: true, alpha: false });
}

async function createWebGpuRenderer(): Promise<WebGPURenderer> {
  const gpu = new WebGPURenderer({ antialias: true, alpha: false });
  await gpu.init();
  return gpu;
}
