import {
  Crosshair,
  DEFAULT_THEME,
  Gauge,
  HUD,
  Hotbar,
  HudNode,
  InventoryGrid,
  Label,
  LinearBar,
  PIXEL_THEME,
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
import {
  buildMazeScene,
  cellCenter,
  facingCardinal,
  facingOpenYaw,
  generateMaze,
  isBlocked,
  isWallCell,
  turnIntent,
  worldToCell,
  yawToLook,
  yawToRight,
} from "./maze.js";

const STYLE_DIRTY = 1 << 2;
const QUEUE_DIRTY = 1 << 7;
const MOUSE_SENSITIVITY = 0.002;
const TURN_RATE = 2.15;
const PITCH_LIMIT = 1.15;
const MOVE_ACCEL = 14;
const REF_W = 1920;
const REF_H = 1080;
const SAFE = 40;

const hostElement = document.querySelector<HTMLDivElement>("#app");
const statusElement = document.querySelector<HTMLDivElement>("#status");
if (hostElement === null || statusElement === null) throw new Error("Playground host is missing.");
const host = hostElement;
const status = statusElement;
for (const leftover of [...host.querySelectorAll("canvas")]) leftover.remove();

const useWebgpu = new URLSearchParams(location.search).get("webgpu") === "1";
const renderer = useWebgpu ? await createWebGpuRenderer() : createWebGlRenderer();
configureRenderer(renderer);
renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
host.append(renderer.domElement);
renderer.domElement.tabIndex = 0;
renderer.domElement.style.touchAction = "none";

const fogColor = 0x100c0a;
const gameScene = new THREE.Scene();
gameScene.background = new THREE.Color(fogColor);
gameScene.fog = new THREE.Fog(fogColor, 14, 48);
const gameCamera = new THREE.PerspectiveCamera(62, 1, 0.08, 60);
const baseFov = 62;

const maze = generateMaze(17, 17, 95);
const start = cellCenter(maze, maze.start.x, maze.start.z);
const spawnYaw = facingOpenYaw(maze);
const look0 = yawToLook(spawnYaw);
const player = {
  x: start.x + look0.x * 0.4,
  y: 1.22,
  z: start.z + look0.z * 0.4,
  yaw: spawnYaw,
  pitch: 0,
  vx: 0,
  vz: 0,
};
gameCamera.position.set(player.x, player.y, player.z);
const anisotropy =
  renderer instanceof THREE.WebGLRenderer ? renderer.capabilities.getMaxAnisotropy() : 8;
const mazeScene = buildMazeScene(gameScene, maze, Math.min(8, anisotropy));

const overlay = createHudOverlayAdapter({
  renderer: renderer as unknown as OverlayRendererLike,
  clearDepth: false,
});
const hud = new HUD({ referenceSize: { width: REF_W, height: REF_H }, rendererAdapter: overlay });
const layer = hud.createLayer({ id: "smooth-ui", scaleMode: "contain" });

const title = new Label({
  id: "title",
  text: "3D MAZE",
  fontSize: 22,
  color: 0xe8f6ff,
});
title.setPosition(SAFE, 48);
const lookHint = new Label({
  id: "look-hint",
  text: "CLICK LOOK - QE TURN - T THEME - F FONT",
  fontSize: 12,
  color: 0xb8c8d8,
});
lookHint.setPosition(SAFE, 76);

const health = new LinearBar({
  id: "health",
  width: 300,
  height: 22,
  value: 92,
  fill: 0x102030,
  delayedValue: 92,
  label: "HP",
});
const stamina = new LinearBar({
  id: "stamina",
  width: 300,
  height: 18,
  value: 100,
  fill: 0x102030,
  segments: 5,
  gap: 4,
  label: "ST",
});
stamina.fillNode.fill = 0x4ec4ff;
for (const segment of stamina.segmentFills) segment.fill = 0x4ec4ff;
const ammo = new RadialBar({
  id: "ammo",
  width: 76,
  height: 76,
  value: 30,
  max: 30,
  fill: 0x1c2c3c,
});
const ammoCaption = new Label({
  id: "ammo-caption",
  text: "TORCH 30 OF 30",
  fontSize: 13,
  color: 0xd8e8f4,
});

const inventory = new InventoryGrid({
  id: "pack",
  columns: 4,
  rows: 2,
  cellSize: 56,
  gap: 6,
  fill: 0x1c3a58,
  items: [
    { key: "empty-0", empty: true },
    { key: "empty-1", empty: true },
    { key: "empty-2", empty: true },
    { key: "empty-3", empty: true },
  ],
});
const inventoryFills = [0x35506a, 0x35506a, 0x35506a, 0x35506a] as const;
for (const [index, slot] of inventory.slots.entries()) {
  const fill = inventoryFills[index] ?? 0x2a4058;
  slot.fill = fill;
  slot.frame.fill = fill;
}

const hotbar = new Hotbar({
  id: "hotbar",
  cellSize: 58,
  fill: 0x1c3a58,
  slots: [
    { key: "torch" },
    { key: "map" },
    { key: "compass" },
    { key: "boots" },
    { key: "flare" },
    { key: "empty", empty: true },
  ],
  onActivate: (key) => activateTool(key),
});
hotbar.setPosition((REF_W - hotbar.size.width) / 2, REF_H - SAFE - hotbar.size.height);
const hotbarFills = [0xd4a24a, 0x3d6d9e, 0x2f8a5a, 0x6a5a2a, 0x8a3a5a, 0x2a4058] as const;
for (const [index, slot] of hotbar.slots.entries()) {
  const fill = hotbarFills[index] ?? 0x2a4058;
  slot.fill = fill;
  slot.frame.fill = fill;
}

inventory.setPosition(SAFE, hotbar.position.y - 14 - inventory.size.height);
health.setPosition(SAFE, inventory.position.y - 12 - health.size.height - stamina.size.height);
stamina.setPosition(SAFE, health.position.y + health.size.height + 6);
ammo.setPosition(SAFE + health.size.width + 16, health.position.y - 8);
ammoCaption.setPosition(ammo.position.x, ammo.position.y + ammo.size.height + 4);

const panel = new Panel({
  id: "tray",
  width: 268,
  height: 292,
  fill: 0x1c3a58,
  padding: { top: 10, right: 10, bottom: 10, left: 10 },
});
panel.setPosition(REF_W - SAFE - panel.size.width, 48);
const trayTitle = new Label({
  id: "tray-title",
  text: "MAP",
  fontSize: 16,
  color: 0xe8f6ff,
});
const trayPos = new Label({
  id: "tray-pos",
  text: "CELL 1 1",
  fontSize: 13,
  color: 0xd0e0ee,
});
const trayHead = new Label({
  id: "tray-head",
  text: "FACE N",
  fontSize: 13,
  color: 0xd0e0ee,
});
const trayHelp = new Label({
  id: "tray-help",
  text: "WASD  QE  SHIFT",
  fontSize: 16,
  color: 0xa8b8c8,
});
const MAP_CELLS = 11;
const MAP_DOT = 12;
const MAP_GAP = 2;
const mapRoot = new HudNode({
  id: "minimap",
  width: MAP_CELLS * MAP_DOT + (MAP_CELLS - 1) * MAP_GAP,
  height: MAP_CELLS * MAP_DOT + (MAP_CELLS - 1) * MAP_GAP,
  fill: 0x000000,
});
const mapDots: HudNode[] = [];
for (let row = 0; row < MAP_CELLS; row += 1) {
  for (let col = 0; col < MAP_CELLS; col += 1) {
    const dot = new HudNode({
      id: `map-${col}-${row}`,
      width: MAP_DOT,
      height: MAP_DOT,
      fill: 0x1a120e,
    });
    dot.setPosition(col * (MAP_DOT + MAP_GAP), row * (MAP_DOT + MAP_GAP));
    mapRoot.add(dot);
    mapDots.push(dot);
  }
}
panel.content.add(trayTitle);
panel.content.add(trayPos);
panel.content.add(trayHead);
panel.content.add(trayHelp);
panel.content.add(mapRoot);
panel.layoutChildren("vertical", 6);

const compass = new Gauge({
  id: "speed",
  width: 112,
  height: 112,
  value: 0,
  min: 0,
  max: 360,
  ticks: 4,
  fill: 0x4aa3ff,
});
compass.setPosition(
  REF_W - SAFE - compass.size.width,
  inventory.position.y + inventory.size.height - compass.size.height,
);
for (const label of compass.tickLabels) {
  label.setText("");
  label.visible = false;
}
compass.face.value = compass.max;

const crosshair = new Crosshair({ id: "cross", dot: true, length: 10, gap: 5 });
crosshair.setPosition(REF_W / 2 - crosshair.size.width / 2, REF_H / 2 - crosshair.size.height / 2);

layer.add(title);
layer.add(lookHint);
layer.add(health);
layer.add(stamina);
layer.add(ammo);
layer.add(ammoCaption);
layer.add(panel);
layer.add(compass);
layer.add(crosshair);
layer.add(inventory);
layer.add(hotbar);
await hud.initialize();
let themeName: "default" | "pixel" = "default";
let fontName: "ui" | "pixel" = "ui";
const showcaseLabels = [
  title,
  lookHint,
  trayTitle,
  trayPos,
  trayHead,
  trayHelp,
  ammoCaption,
];

function applyShowcaseSkin(): void {
  const theme = themeName === "pixel" ? PIXEL_THEME : DEFAULT_THEME;
  const fill = Number(theme.colors["fill"]);
  const panelFill = Number(theme.colors["panel"]);
  const text = Number(theme.colors["text"]);
  panel.fill = panelFill;
  panel.markDirty(STYLE_DIRTY | QUEUE_DIRTY);
  health.fillNode.fill = fill;
  health.fillNode.markDirty(STYLE_DIRTY | QUEUE_DIRTY);
  stamina.fillNode.fill = fill;
  stamina.fillNode.markDirty(STYLE_DIRTY | QUEUE_DIRTY);
  for (const label of showcaseLabels) {
    label.color = text;
    label.setFontId(fontName);
  }
}

applyShowcaseSkin();
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
if (windfoilSpike.mesh && capability.windfoil.supported) {
  windfoilSpike.mesh.position.set(start.x, 1.6, start.z - 0.4);
  windfoilSpike.mesh.scale.set(0.8, 0.25, 1);
  gameScene.add(windfoilSpike.mesh);
}

const held = new Set<string>();
const tools = { torch: true, map: true, compass: true, boots: false, flare: 0 };
const bag: Array<{ key: string; quantity?: number; empty?: boolean }> = [
  { key: "empty-0", empty: true },
  { key: "empty-1", empty: true },
  { key: "empty-2", empty: true },
  { key: "empty-3", empty: true },
];
let pointerLocked = false;
let shake = 0;
let fovPunch = 0;
const pickupKeys = new Set(maze.pickups.map((item) => `${item.x},${item.z}`));

const diagnostics = {
  player,
  held,
  last: { forward: 0, wishX: 0, delta: 0, blockedX: false },
  isBlockedAhead: (): boolean => isBlocked(maze, player.x + 0.6, player.z),
  cell: (): { x: number; z: number } => worldToCell(maze, player.x, player.z),
  get pointerLocked(): boolean {
    return pointerLocked;
  },
};
(globalThis as { __PLAYGROUND__?: typeof diagnostics }).__PLAYGROUND__ = diagnostics;

function setHudVisible(node: HudNode, visible: boolean): void {
  node.visible = visible;
  node.markDirty(STYLE_DIRTY | QUEUE_DIRTY);
}

function activateTool(key: string): void {
  if (key === "torch") tools.torch = !tools.torch;
  if (key === "map") {
    tools.map = !tools.map;
    setHudVisible(panel, tools.map);
  }
  if (key === "compass") {
    tools.compass = !tools.compass;
    setHudVisible(compass, tools.compass);
  }
  if (key === "boots") tools.boots = !tools.boots;
  if (key === "flare") tools.flare = 2.4;
  mazeScene.torch.intensity = tools.torch ? 22 : 4;
  trayTitle.setText(tools.map ? "MAP" : "TRAY");
  writeStatus();
}

function pickupIfClose(): void {
  for (const mesh of mazeScene.collectibles) {
    if (!mesh.visible) continue;
    const dx = mesh.position.x - player.x;
    const dz = mesh.position.z - player.z;
    if (dx * dx + dz * dz > 0.7) continue;
    mesh.visible = false;
    const cell = worldToCell(maze, mesh.position.x, mesh.position.z);
    pickupKeys.delete(`${cell.x},${cell.z}`);
    const key = String(mesh.userData["key"] ?? "star");
    const empty = bag.findIndex((item) => item.empty === true);
    const slot = empty >= 0 ? empty : 0;
    bag[slot] = { key, quantity: 1 };
    inventory.setItems(bag);
    const painted = inventory.slots[slot];
    if (painted) {
      painted.fill = 0xd4a24a;
      painted.frame.fill = 0xd4a24a;
    }
    shake = Math.min(1, shake + 0.18);
  }
}

function refreshMinimap(): void {
  const here = worldToCell(maze, player.x, player.z);
  const radius = (MAP_CELLS - 1) / 2;
  for (let row = 0; row < MAP_CELLS; row += 1) {
    for (let col = 0; col < MAP_CELLS; col += 1) {
      const dot = mapDots[row * MAP_CELLS + col];
      if (!dot) continue;
      const mx = here.x + col - radius;
      const mz = here.z + row - radius;
      let fill = 0x0c0806;
      if (mx === here.x && mz === here.z) fill = 0xe8c547;
      else if (pickupKeys.has(`${mx},${mz}`) && !isWallCell(maze, mx, mz)) fill = 0x5fcde4;
      else if (!isWallCell(maze, mx, mz)) fill = 0x6a5340;
      else fill = 0x1a120e;
      if (dot.fill === fill) continue;
      dot.fill = fill;
      dot.markDirty(STYLE_DIRTY);
    }
  }
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
    `HUD: title + health + ammo + inventory + hotbar + crosshair`,
    `renderer: ${useWebgpu ? "WebGPURenderer" : "WebGLRenderer"} ${capability.kind}/${capability.backend}`,
    `viewport: ${width}×${height} css px / DPR ${renderer.getPixelRatio()} / contain ${viewport.scaleX.toFixed(3)}`,
    `theme: ${themeName}`,
    `font: ${fontName}`,
    `hotbar: slot ${hotbar.activeIndex + 1} (${hotbar.slots[hotbar.activeIndex]?.key ?? "none"})`,
    `windfoil: ${capability.windfoil.supported ? "supported" : "unsupported"}  spike=${windfoilDraw.status}`,
  ].join(" · ");
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

function onKey(event: KeyboardEvent, down: boolean): void {
  if (
    event.code.startsWith("Arrow") ||
    event.code === "Space" ||
    event.code === "KeyW" ||
    event.code === "KeyA" ||
    event.code === "KeyS" ||
    event.code === "KeyD"
  ) {
    event.preventDefault();
  }
  if (down) held.add(event.code);
  else held.delete(event.code);
  if (!down) return;
  const digit = event.code.startsWith("Digit") ? Number(event.code.slice(5)) : 0;
  if (digit >= 1 && digit <= 6) {
    hotbar.activate(digit - 1);
    writeStatus();
  }
  if (event.code === "KeyT") {
    themeName = themeName === "pixel" ? "default" : "pixel";
    applyShowcaseSkin();
    writeStatus();
  }
  if (event.code === "KeyF") {
    fontName = fontName === "pixel" ? "ui" : "pixel";
    applyShowcaseSkin();
    writeStatus();
  }
}

function onMouseMove(event: MouseEvent): void {
  if (!pointerLocked) return;
  player.yaw += event.movementX * MOUSE_SENSITIVITY;
  player.pitch -= event.movementY * MOUSE_SENSITIVITY;
  player.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, player.pitch));
}

function onPointerLockChange(): void {
  pointerLocked = document.pointerLockElement === renderer.domElement;
  lookHint.setText(pointerLocked ? "ESC UNLOCK LOOK" : "CLICK LOOK - QE TURN");
}

function onCanvasClick(event: MouseEvent): void {
  if (pointerLocked) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const y = (event.clientY - rect.top) / Math.max(1, rect.height);
  if (y > 0.88) return;
  const lock = renderer.domElement.requestPointerLock();
  if (lock && typeof (lock as Promise<void>).catch === "function") {
    void (lock as Promise<void>).catch(() => undefined);
  }
}

function onKeyDown(event: KeyboardEvent): void {
  onKey(event, true);
}

function onKeyUp(event: KeyboardEvent): void {
  onKey(event, false);
}

addEventListener("keydown", onKeyDown);
addEventListener("keyup", onKeyUp);
addEventListener("mousemove", onMouseMove);
document.addEventListener("pointerlockchange", onPointerLockChange);
renderer.domElement.addEventListener("click", onCanvasClick);
renderer.domElement.focus();

let previous = performance.now();
let frameId = 0;
let stopped = false;
function frame(now: number): void {
  if (stopped) return;
  frameId = requestAnimationFrame(frame);
  const delta = Math.max(0, Math.min(0.05, (now - previous) / 1000));
  previous = now;
  const sprintHeld = held.has("ShiftLeft") || held.has("ShiftRight");
  const canSprint = sprintHeld && stamina.value > 8;
  player.yaw +=
    turnIntent(
      held.has("KeyQ") || held.has("ArrowLeft"),
      held.has("KeyE") || held.has("ArrowRight"),
    ) *
    TURN_RATE *
    delta;
  const forward =
    (held.has("KeyW") || held.has("ArrowUp") ? 1 : 0) -
    (held.has("KeyS") || held.has("ArrowDown") ? 1 : 0);
  const strafe = (held.has("KeyD") ? 1 : 0) - (held.has("KeyA") ? 1 : 0);
  const pace = (canSprint && tools.boots ? 4.6 : canSprint ? 3.35 : 2.2) * (tools.flare > 0 ? 1.08 : 1);
  const look = yawToLook(player.yaw);
  const right = yawToRight(player.yaw);
  const wishX = (look.x * forward + right.x * strafe) * pace;
  const wishZ = (look.z * forward + right.z * strafe) * pace;
  const blend = 1 - Math.exp(-MOVE_ACCEL * delta);
  player.vx += (wishX - player.vx) * blend;
  player.vz += (wishZ - player.vz) * blend;
  const nx = player.x + player.vx * delta;
  const nz = player.z + player.vz * delta;
  let bumped = false;
  const blockedX = isBlocked(maze, nx, player.z);
  diagnostics.last = { forward, wishX, delta, blockedX };
  if (!blockedX) player.x = nx;
  else {
    player.vx = 0;
    bumped = true;
  }
  if (!isBlocked(maze, player.x, nz)) player.z = nz;
  else {
    player.vz = 0;
    bumped = true;
  }
  if (bumped) shake = Math.min(1, shake + (canSprint ? 0.28 : 0.12));
  shake = Math.max(0, shake - 1.6 * delta);
  const shakeAmt = shake * shake;
  const lookPitched = yawToLook(player.yaw, player.pitch);
  gameCamera.position.set(
    player.x + Math.sin(now * 0.031) * 0.04 * shakeAmt,
    player.y + Math.sin(now * 0.037) * 0.03 * shakeAmt,
    player.z + Math.cos(now * 0.029) * 0.04 * shakeAmt,
  );
  gameCamera.lookAt(
    player.x + lookPitched.x,
    player.y + lookPitched.y,
    player.z + lookPitched.z,
  );
  const moving = forward !== 0 || strafe !== 0;
  fovPunch = canSprint && moving ? Math.min(6, fovPunch + 18 * delta) : fovPunch * Math.exp(-delta / 0.18);
  gameCamera.fov = baseFov + fovPunch;
  gameCamera.updateProjectionMatrix();
  mazeScene.torch.position.set(player.x, 1.32, player.z);
  if (tools.flare > 0) {
    tools.flare = Math.max(0, tools.flare - delta);
    mazeScene.torch.intensity = 34;
    mazeScene.torch.distance = 26;
  } else {
    mazeScene.torch.intensity = tools.torch ? 22 : 3.4;
    mazeScene.torch.distance = tools.torch ? 18 : 8;
  }
  const globe = gameScene.getObjectByName("start-globe");
  if (globe) globe.rotation.y += delta * 0.35;
  for (const [index, item] of mazeScene.collectibles.entries()) {
    if (!item.visible) continue;
    const baseY = Number(item.userData["baseY"] ?? 0.82);
    item.position.y = baseY + Math.sin(now * 0.003 + index) * 0.08;
    item.rotation.y += delta * 1.2;
  }
  pickupIfClose();
  renderer.render(gameScene, gameCamera);
  if (hud.state !== "ready") return;
  try {
    stamina.setValue(
      Math.max(8, Math.min(100, stamina.value + (canSprint && moving ? -32 : 16) * delta)),
    );
    health.setDelayedValue(Math.min(100, health.value + 6 * delta));
    const torchFuel = Math.max(0, ammo.value - (tools.torch ? 0.28 : 0.03) * delta);
    ammo.setValue(Math.round(torchFuel));
    ammoCaption.setText(`TORCH ${Math.round(torchFuel)} OF 30`);
    const heading = ((player.yaw * 180) / Math.PI + 3600) % 360;
    compass.setValue(Math.round(heading));
    const cell = worldToCell(maze, player.x, player.z);
    trayPos.setText(`CELL ${cell.x} ${cell.z}`);
    trayHead.setText(`FACE ${facingCardinal(player.yaw)}`);
    compass.face.value = compass.max;
    refreshMinimap();
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
  removeEventListener("keydown", onKeyDown);
  removeEventListener("keyup", onKeyUp);
  removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("pointerlockchange", onPointerLockChange);
  renderer.domElement.removeEventListener("click", onCanvasClick);
  if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
  mazeScene.dispose();
  if (hud.state !== "disposed") hud.dispose();
  renderer.dispose();
  renderer.domElement.remove();
}

addEventListener("beforeunload", shutdown);
const hot = (import.meta as { hot?: { dispose: (cb: () => void) => void } }).hot;
hot?.dispose(shutdown);

function configureRenderer(target: THREE.WebGLRenderer | WebGPURenderer): void {
  target.outputColorSpace = THREE.SRGBColorSpace;
  target.toneMapping = THREE.ACESFilmicToneMapping;
  target.toneMappingExposure = 1.08;
}

function createWebGlRenderer(): THREE.WebGLRenderer {
  const gpu = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  return gpu;
}

async function createWebGpuRenderer(): Promise<WebGPURenderer> {
  const gpu = new WebGPURenderer({ antialias: true, alpha: false });
  await gpu.init();
  return gpu;
}
