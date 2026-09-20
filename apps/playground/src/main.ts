import { createStudioShell, download } from "./studio.js";
import { createReviewLab, guides, snapPixelText, text as addText } from "./labs/review.js";
import {
  Compass,
  Crosshair,
  HUD,
  Hotbar,
  HudNode,
  InventoryGrid,
  Label,
  LinearBar,
  MONOCHROME_INVERT_THEME,
  MONOCHROME_THEME,
  Panel,
  RadialBar,
  connectHudPointerEvents,
  createHudOverlayAdapter,
  probeRendererCapabilities,
  resolveViewport,
  themeColor,
  type HudTheme,
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
  mazeTour,
  shortestTurn,
  turnIntent,
  worldToCell,
  yawToLook,
  yawToRight,
  yawToward,
} from "./maze.js";

const STYLE_DIRTY = 1 << 2;
const QUEUE_DIRTY = 1 << 7;
const MOUSE_SENSITIVITY = 0.00115;
const TURN_RATE = 1.25;
const PITCH_LIMIT = 1.05;
const MOVE_ACCEL = 9;
const LOOK_DAMP = 14;
const SHAKE_POS = 0.012;
const REF_W = 1920;
const REF_H = 1080;
const SAFE_X = 24;
const SAFE_TOP = 40;
const SAFE_BOTTOM = 20;
const SPACE = 12;
const STATUS_H = 22;

const studio = createStudioShell();
let studioReady = false;
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

const fogColor = 0x000000;
const gameScene = new THREE.Scene();
const labScene = new THREE.Scene();
labScene.background = new THREE.Color(0x111111);
gameScene.background = new THREE.Color(fogColor);
gameScene.fog = new THREE.Fog(fogColor, 22, 58);
const gameCamera = new THREE.PerspectiveCamera(62, 1, 0.08, 80);
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
const startGlobe = gameScene.getObjectByName("start-globe") ?? null;
const lookScratch = { x: 0, y: 0, z: 0 };
const lookPitchedScratch = { x: 0, y: 0, z: 0 };
const rightScratch = { x: 0, z: 0 };
const destScratch = { x: 0, z: 0 };
const cellScratch = { x: 0, z: 0 };
const tour = mazeTour(maze);
let tourIndex = 0;
let autoNav = true;

const checkerBytes = new Uint8Array(8 * 8 * 4);
for (let y = 0; y < 8; y++)
  for (let x = 0; x < 8; x++) {
    const value = (x + y) % 2 ? 220 : 40;
    checkerBytes.set([value, value, value, 255], (y * 8 + x) * 4);
  }
const checkerTexture = new THREE.DataTexture(checkerBytes, 8, 8);
checkerTexture.magFilter = checkerTexture.minFilter = THREE.NearestFilter;
checkerTexture.colorSpace = THREE.SRGBColorSpace;
checkerTexture.needsUpdate = true;
const overlay = createHudOverlayAdapter({
  renderer: renderer as unknown as OverlayRendererLike,
  clearDepth: false,
  textures: new Map([["review-checker", checkerTexture]]),
});
const hud = new HUD({ referenceSize: { width: REF_W, height: REF_H }, rendererAdapter: overlay });
const layer = hud.createLayer({
  id: "smooth-ui",
  scaleMode: "contain",
  safeInsets: { top: 24, right: 24, bottom: 24, left: 24 },
});

const starterTheme = MONOCHROME_THEME;
const ink = themeColor(starterTheme, "text");
const paper = themeColor(starterTheme, "panel");
const track = themeColor(starterTheme, "track");
const slotFill = themeColor(starterTheme, "slot");

const title = new Label({
  id: "title",
  text: "3D MAZE",
  fontSize: 21,
  fontId: "pixel",
  color: ink,
});
const lookHint = new Label({
  id: "look-hint",
  text: "CLICK LOOK  WASD  P  I  F  1-6",
  fontSize: 14,
  fontId: "pixel",
  color: ink,
});

const BAR_W = 220;
const health = new LinearBar({
  id: "health",
  width: BAR_W,
  height: 16,
  value: 92,
  fill: track,
  delayedValue: 92,
  label: "HP",
});
const stamina = new LinearBar({
  id: "stamina",
  width: BAR_W,
  height: 16,
  value: 100,
  fill: track,
  segments: 5,
  gap: 3,
  label: "ST",
});
stamina.fillNode.fill = ink;
for (const segment of stamina.segmentFills) segment.fill = ink;
const explore = new LinearBar({
  id: "explore",
  width: BAR_W,
  height: 14,
  value: 1,
  fill: track,
  label: "MAP",
});
explore.fillNode.fill = ink;
const speedBar = new LinearBar({
  id: "speed",
  width: BAR_W,
  height: 14,
  value: 0,
  fill: track,
  label: "SPD",
});
speedBar.fillNode.fill = ink;
const ammo = new RadialBar({
  id: "ammo",
  width: 52,
  height: 52,
  value: 30,
  max: 30,
  fill: track,
});
const ammoCaption = new Label({
  id: "ammo-caption",
  text: "TORCH 30/30",
  fontSize: 14,
  fontId: "pixel",
  color: ink,
});

const inventory = new InventoryGrid({
  id: "pack",
  columns: 4,
  rows: 2,
  cellSize: 56,
  gap: 6,
  fill: slotFill,
  items: [
    { key: "empty-0", empty: true },
    { key: "empty-1", empty: true },
    { key: "empty-2", empty: true },
    { key: "empty-3", empty: true },
  ],
});
for (const slot of inventory.slots) {
  slot.fill = slotFill;
  slot.frame.fill = slotFill;
}

const hotbar = new Hotbar({
  id: "hotbar",
  cellSize: 58,
  fill: slotFill,
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
hotbar.fill = 0x000000;
hotbar.setPosition((REF_W - hotbar.size.width) / 2, REF_H - SAFE_BOTTOM - hotbar.size.height);
const HOT_MARKS = ["T", "M", "C", "B", "F", ""] as const;
const hotMarks: Label[] = [];
for (const [index, slot] of hotbar.slots.entries()) {
  slot.fill = slotFill;
  slot.frame.fill = slotFill;
  const mark = new Label({
    id: `hot-mark-${index}`,
    text: HOT_MARKS[index] ?? "",
    fontSize: 14,
    fontId: "pixel",
    color: ink,
  });
  slot.add(mark);
  hotMarks.push(mark);
}
inventory.fill = 0x000000;

inventory.setPosition(SAFE_X, hotbar.position.y - SPACE - inventory.size.height);
stamina.setPosition(SAFE_X, inventory.position.y - SPACE - stamina.size.height);
health.setPosition(SAFE_X, stamina.position.y - 8 - health.size.height);
ammo.setPosition(
  SAFE_X + health.size.width + SPACE,
  health.position.y + (health.size.height + stamina.size.height + 8 - ammo.size.height) / 2,
);
ammoCaption.setPosition(ammo.position.x, ammo.position.y + ammo.size.height + 4);

const panel = new Panel({
  id: "tray",
  width: 268,
  height: 292,
  fill: paper,
  radius: 0,
  padding: { top: 10, right: 10, bottom: 10, left: 10 },
});
panel.setPosition(REF_W - SAFE_X - panel.size.width, SAFE_TOP);
const trayTitle = new Label({
  id: "tray-title",
  text: "MAP",
  fontSize: 14,
  fontId: "pixel",
  color: ink,
});
const trayPos = new Label({
  id: "tray-pos",
  text: "CELL 1 1",
  fontSize: 14,
  fontId: "pixel",
  color: ink,
});
const trayHead = new Label({
  id: "tray-head",
  text: "FACE N",
  fontSize: 14,
  fontId: "pixel",
  color: ink,
});
const trayHelp = new Label({
  id: "tray-help",
  text: "WASD  QE  SHIFT",
  fontSize: 14,
  fontId: "pixel",
  color: ink,
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
      fill: 0x111111,
    });
    dot.setPosition(col * (MAP_DOT + MAP_GAP), row * (MAP_DOT + MAP_GAP));
    mapRoot.add(dot);
    mapDots.push(dot);
  }
}
panel.content.add(mapRoot);

const compass = new Compass({
  id: "compass",
  heading: spawnYaw,
  fontId: "pixel",
});
const LOG_CAP = 4;
const logPanel = new Panel({
  id: "log",
  width: 248,
  height: 86,
  fill: paper,
  radius: 0,
  clip: true,
  padding: { top: 6, right: 8, bottom: 6, left: 8 },
});
const logTitle = new Label({
  id: "log-title",
  text: "LOG",
  fontSize: 14,
  fontId: "pixel",
  color: ink,
});
const logLabels: Label[] = [];
for (let index = 0; index < LOG_CAP; index += 1) {
  logLabels.push(
    new Label({
      id: `log-${index}`,
      text: "",
      fontSize: 14,
      fontId: "pixel",
      color: ink,
    }),
  );
}

const crosshair = new Crosshair({ id: "cross", dot: true, length: 10, gap: 5 });
crosshair.setPosition(REF_W / 2 - crosshair.size.width / 2, REF_H / 2 - crosshair.size.height / 2);

layer.add(title);
layer.add(lookHint);
layer.add(health);
layer.add(stamina);
layer.add(explore);
layer.add(speedBar);
layer.add(ammo);
layer.add(ammoCaption);
layer.add(trayTitle);
layer.add(trayPos);
layer.add(trayHead);
layer.add(trayHelp);
layer.add(panel);
layer.add(logPanel);
layer.add(logTitle);
for (const line of logLabels) layer.add(line);
layer.add(compass);
layer.add(crosshair);
layer.add(inventory);
layer.add(hotbar);
await hud.initialize();
let invertHud = false;
let fontName: "ui" | "pixel" = "pixel";
let compassOn = true;
let mapOn = true;
let inventoryOn = true;
let viewYaw = player.yaw;
let viewPitch = player.pitch;
const showcaseLabels = [
  title,
  lookHint,
  trayTitle,
  trayPos,
  trayHead,
  trayHelp,
  ammoCaption,
  logTitle,
  ...logLabels,
];
const reduceMotion =
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
function damp(current: number, target: number, lambda: number, dt: number): number {
  if (reduceMotion) return target;
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  return current + shortestTurn(current, target) * (reduceMotion ? 1 : 1 - Math.exp(-lambda * dt));
}
const OPEN_CELLS = maze.walls.reduce((count, wall) => count + (wall ? 0 : 1), 0);
const seenCells = new Set<string>([`${maze.start.x},${maze.start.z}`]);
const logState: Array<{ text: string; opacity: number }> = [];
let staminaState = stamina.value;
let staminaShown = staminaState;
let exploreShown = 1;
let speedShown = 0;
let headingShown = player.yaw;
let torchState = 30;
let torchShown = torchState;

function pushLog(text: string): void {
  logState.unshift({ text, opacity: 0 });
  if (logState.length > LOG_CAP) logState.length = LOG_CAP;
}

let mapCellsShown = MAP_CELLS;

function placeBarLabel(bar: LinearBar): void {
  bar.labelNode.setPosition(
    -bar.labelNode.size.width - 6,
    Math.max(0, (bar.size.height - bar.labelNode.size.height) / 2),
  );
}

function placeHotMarks(): void {
  for (const [index, slot] of hotbar.slots.entries()) {
    const mark = hotMarks[index];
    if (!mark) continue;
    mark.remeasure();
    mark.setPosition(
      Math.max(2, (slot.size.width - mark.size.width) / 2),
      Math.max(2, (slot.size.height - mark.size.height) / 2 + 6),
    );
  }
}

function sizeCompass(size: number): void {
  compass.setSize(size, size);
  compass.syncMarks();
}

function sizeBars(barW: number): void {
  const apply = (bar: LinearBar, height: number): void => bar.setSize(barW, height);
  apply(health, 16);
  apply(stamina, 16);
  apply(explore, 14);
  apply(speedBar, 14);
}

function fitMap(cells: number, dot: number, gap: number): number {
  mapCellsShown = cells;
  for (let row = 0; row < MAP_CELLS; row += 1) {
    for (let col = 0; col < MAP_CELLS; col += 1) {
      const node = mapDots[row * MAP_CELLS + col];
      if (!node) continue;
      const on = row < cells && col < cells;
      node.visible = on;
      if (!on) continue;
      node.setSize(dot, dot);
      node.setPosition(col * (dot + gap), row * (dot + gap));
    }
  }
  const side = cells * dot + (cells - 1) * gap;
  mapRoot.setSize(side, side);
  return side;
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
  pad = 4,
): boolean {
  return (
    a.x < b.x + b.width + pad &&
    a.x + a.width + pad > b.x &&
    a.y < b.y + b.height + pad &&
    a.y + a.height + pad > b.y
  );
}

function paintChrome(): void {
  const theme = activeTheme();
  const ink = themeColor(theme, "text");
  const paper = themeColor(theme, "panel");
  const track = themeColor(theme, "track");
  const muted = themeColor(theme, "muted");
  const selected = themeColor(theme, "selected");
  for (const [index, slot] of hotbar.slots.entries()) {
    const on = index === hotbar.activeIndex;
    paintFill(slot, on ? selected : invertHud ? 0x999999 : 0x444444);
    paintFill(slot.frame, on ? selected : paper);
    const shortcut = hotbar.shortcuts[index];
    if (shortcut) shortcut.color = on ? paper : ink;
    const mark = hotMarks[index];
    if (mark) mark.color = on ? paper : ink;
  }
  for (const slot of inventory.slots) {
    const filled = slot.icon.opacity > 0;
    paintFill(slot, filled ? selected : track);
    paintFill(slot.frame, filled ? selected : muted);
  }
  paintFill(hotbar.selection, selected);
}

function hudScale(): number {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  return resolveViewport({
    referenceSize: layer.referenceSize,
    viewport: { x: 0, y: 0, width, height },
    mode: layer.scaleMode,
    dpr: renderer.getPixelRatio(),
    pixelSnap: layer.pixelSnap,
  }).scaleX;
}

function crispPixelFontSize(desired: number, scale: number): number {
  if (scale <= 0) return desired;
  const texels = Math.max(1, Math.round((desired * scale) / 7));
  return (texels * 7) / scale;
}

function layoutHud(): void {
  const width = layer.referenceSize.width;
  const height = layer.referenceSize.height;
  const compact = width < 900;
  const tiny = width < 420;
  const short = height < 520;
  const pad = tiny ? 8 : compact ? 10 : SAFE_X;
  const top = STATUS_H + (tiny || short ? 6 : compact ? 8 : 12);
  const gap = tiny || short ? 5 : compact ? 6 : 10;
  const showInv = inventoryOn && !tiny && !short;
  inventory.visible = showInv;
  lookHint.visible = !compact && !short;
  trayHelp.visible = false;
  logPanel.visible = !compact && !short;
  logTitle.visible = !compact && !short;
  trayTitle.visible = !tiny && !short;
  trayHead.visible = !tiny && !short;
  trayPos.visible = mapOn;
  panel.visible = mapOn && !(short && tiny);
  speedBar.visible = !short;
  explore.visible = !short;

  const compassSize = tiny ? 48 : compact ? 56 : 88;
  sizeCompass(compassSize);
  const mapSide = fitMap(tiny ? 7 : compact ? 9 : 11, tiny ? 7 : compact ? 8 : 10, 2);
  mapRoot.setPosition(0, 0);
  panel.setSize(mapSide + 12, mapSide + 12);
  panel.background.setSize(panel.size.width, panel.size.height);
  panel.content.setSize(mapSide, mapSide);
  panel.content.setPosition(6, 6);

  const trayItems = tiny ? [trayPos] : [trayTitle, trayPos, trayHead];
  const right = width - pad;
  const trayStack = trayItems.reduce((sum, node) => sum + node.size.height + 3, 0);
  const labelMax = Math.max(...trayItems.map((node) => node.size.width));
  const colW = Math.max(labelMax, mapOn ? panel.size.width : 0);
  const colX = Math.round(right - colW);
  if (mapOn) {
    panel.setPosition(Math.round(right - panel.size.width), Math.round(top + trayStack + 2));
  } else {
    panel.setPosition(Math.round(right - panel.size.width), -panel.size.height);
  }
  let trayY = top;
  for (const node of trayItems) {
    node.setPosition(colX, Math.round(trayY));
    trayY += node.size.height + 3;
  }

  const labelCol =
    Math.max(
      health.labelNode.size.width,
      stamina.labelNode.size.width,
      explore.labelNode.size.width,
      speedBar.labelNode.size.width,
      24,
    ) + 6;
  const torchGap = compact ? 8 : 12;
  const maxBar = width - pad - labelCol - torchGap - ammo.size.width - pad;
  const barW = Math.max(88, Math.min(tiny ? 148 : compact ? 176 : 200, maxBar));
  sizeBars(barW);

  const hotReserve = compact ? 0 : compassSize + gap;
  const hotFit = Math.min(1, (width - pad * 2 - hotReserve) / Math.max(1, hotbar.size.width));
  hotbar.scaleX = hotFit;
  hotbar.scaleY = hotFit;
  const hotW = hotbar.size.width * hotFit;
  const hotH = hotbar.size.height * hotFit;
  hotbar.setPosition(
    Math.round(Math.max(pad, (width - hotW - hotReserve) / 2)),
    Math.round(height - pad - hotH),
  );

  const invFit = showInv
    ? Math.min(1, (compact ? 136 : inventory.size.width) / inventory.size.width)
    : 1;
  inventory.scaleX = invFit;
  inventory.scaleY = invFit;
  const invH = showInv ? inventory.size.height * invFit : 0;
  if (showInv) inventory.setPosition(pad, Math.round(hotbar.position.y - gap - invH));

  const stackBottom = showInv ? inventory.position.y : hotbar.position.y;
  const barGap = short ? 4 : 5;
  const barX = Math.round(pad + labelCol);
  const vitals: LinearBar[] = [health, stamina];
  if (explore.visible) vitals.push(explore);
  if (speedBar.visible) vitals.push(speedBar);
  let cursor = stackBottom;
  for (let index = vitals.length - 1; index >= 0; index -= 1) {
    const bar = vitals[index];
    if (!bar) continue;
    const step = index === vitals.length - 1 ? gap : barGap;
    cursor = Math.round(cursor - step - bar.size.height);
    bar.setPosition(barX, cursor);
    placeBarLabel(bar);
  }
  const ammoX = Math.round(barX + barW + torchGap);
  ammo.setPosition(
    ammoX,
    short ? Math.round(stackBottom - gap - ammo.size.height) : health.position.y,
  );
  if (boxesOverlap(ammo.worldBounds(), hotbar.worldBounds(), 4)) {
    ammo.setPosition(
      Math.round(Math.max(pad, hotbar.position.x - gap - ammo.size.width)),
      Math.round(hotbar.position.y - gap - ammo.size.height),
    );
  }
  ammoCaption.setPosition(ammo.position.x, Math.round(ammo.position.y + ammo.size.height + 2));
  if (ammoCaption.position.y + ammoCaption.size.height > stackBottom - 2) {
    ammoCaption.setPosition(
      Math.round(ammo.position.x + ammo.size.width + 4),
      Math.round(ammo.position.y + Math.max(0, (ammo.size.height - ammoCaption.size.height) / 2)),
    );
  }
  ammoCaption.visible = !short && ammoCaption.position.x + ammoCaption.size.width <= width - pad;

  title.setPosition(pad, top);
  title.visible =
    !short && title.position.x + title.size.width < (mapOn ? panel.position.x : right) - 8;
  lookHint.setPosition(
    pad,
    title.visible ? Math.round(title.position.y + title.size.height + 4) : top,
  );
  if (
    lookHint.visible &&
    lookHint.position.x + lookHint.size.width > (mapOn ? panel.position.x : right) - 8
  ) {
    lookHint.visible = false;
  }
  const logX = pad;
  const logY =
    (lookHint.visible
      ? lookHint.position.y + lookHint.size.height
      : title.visible
        ? title.position.y + title.size.height
        : top) + 8;
  logTitle.setPosition(logX, logY);
  let logLineY = logTitle.position.y + logTitle.size.height + 3;
  for (const line of logLabels) {
    line.setPosition(logX, logLineY);
    logLineY += Math.max(12, line.size.height) + 2;
  }
  logPanel.setSize(248, Math.max(86, logLineY - logY + 16));
  logPanel.background.setSize(logPanel.size.width, logPanel.size.height);
  logPanel.setPosition(logX, logY);

  const compassX = Math.round(
    Math.max(pad, Math.min(right - compassSize, width - pad - compassSize)),
  );
  if (compact) {
    const underMap = mapOn ? panel.position.y + panel.size.height + 12 : top;
    compass.setPosition(compassX, Math.round(underMap));
    compass.visible = compassOn && compass.position.y + compassSize <= health.position.y - 8;
  } else {
    const y = Math.min(hotbar.position.y + hotH - compassSize, height - pad - compassSize);
    compass.setPosition(
      compassX,
      Math.round(Math.max(mapOn ? panel.position.y + panel.size.height + 12 : top, y)),
    );
    compass.visible = compassOn;
    if (compass.visible && boxesOverlap(compass.worldBounds(), health.worldBounds(), 8)) {
      compass.visible = false;
    }
  }
  if (compass.visible && compass.position.y + compassSize > height - pad) {
    compass.setPosition(compass.position.x, Math.round(height - pad - compassSize));
  }
  if (compass.visible && compass.position.x + compassSize > width - pad) {
    compass.setPosition(Math.round(width - pad - compassSize), compass.position.y);
  }
  if (compass.visible && compass.position.x < pad) compass.visible = false;
  if (compass.visible && boxesOverlap(compass.worldBounds(), hotbar.worldBounds(), 6)) {
    compass.setPosition(compass.position.x, Math.round(hotbar.position.y - gap - compassSize));
    if (compass.position.y < (mapOn ? panel.position.y + panel.size.height + 8 : top)) {
      compass.visible = false;
    }
  }

  placeHotMarks();
  crosshair.setPosition(
    width / 2 - crosshair.size.width / 2,
    height / 2 - crosshair.size.height / 2,
  );
}

function activeTheme(): HudTheme {
  return invertHud ? MONOCHROME_INVERT_THEME : MONOCHROME_THEME;
}

function paintFill(node: { fill: number; markDirty: (flags: number) => void }, fill: number): void {
  node.fill = fill;
  node.markDirty(STYLE_DIRTY | QUEUE_DIRTY);
}

function applyShowcaseSkin(): void {
  const theme = activeTheme();
  const fill = themeColor(theme, "fill");
  const panelFill = themeColor(theme, "panel");
  const text = themeColor(theme, "text");
  const trackColor = themeColor(theme, "track");
  const delayed = themeColor(theme, "delayed");
  const pixel = fontName === "pixel";
  const scale = hudScale();
  const tiny = layer.referenceSize.width < 420;
  const typeSize = pixel ? crispPixelFontSize(14, scale) : 14;
  const titleSize = pixel ? crispPixelFontSize(tiny ? 14 : 21, scale) : tiny ? 14 : 21;
  layer.pixelSnap = pixel;
  if (gameScene.background instanceof THREE.Color) gameScene.background.set(panelFill);
  if (gameScene.fog) gameScene.fog.color.set(panelFill);
  mazeScene.setInk(
    studio.state.wireframe ? text : invertHud ? 0x777777 : 0x454545,
    invertHud ? 0x999999 : 0x333333,
    studio.state.wireframe ? panelFill : invertHud ? 0xdddddd : 0x242424,
  );
  paintFill(panel, panelFill);
  paintFill(panel.background, panelFill);
  panel.background.setRadius(Number(theme.radii["panel"] ?? 0));
  health.setFills({ track: trackColor, value: fill, delayed, label: text });
  stamina.setFills({ track: trackColor, value: fill, delayed, label: text });
  paintFill(ammo.track, trackColor);
  paintFill(ammo.fillRing, fill);
  ammo.label.color = text;
  ammo.label.setFontId(fontName);
  ammo.label.setFontSize(Math.min(typeSize, 12));
  ammo.label.remeasure();
  explore.setFills({ track: trackColor, value: fill, label: text });
  speedBar.setFills({ track: trackColor, value: fill, label: text });
  compass.setColor(text, themeColor(theme, "muted"));
  compass.headingLabel.setFontId(fontName);
  compass.headingLabel.setFontSize(typeSize);
  for (const mark of compass.marks) {
    mark.setFontId(fontName);
    mark.setFontSize(Math.max(7, typeSize - 2));
  }
  compass.syncMarks();
  paintFill(logPanel, panelFill);
  paintFill(logPanel.background, panelFill);
  paintFill(logPanel.content, panelFill);
  paintFill(panel.content, panelFill);
  crosshair.setColor(themeColor(theme, "crosshair"));
  paintFill(mapRoot, trackColor);
  title.setFontSize(titleSize);
  title.remeasure();
  for (const label of showcaseLabels) {
    label.color = text;
    label.setFontId(fontName);
    if (label !== title) label.setFontSize(typeSize);
    label.remeasure();
  }
  health.labelNode.setFontId(fontName);
  health.labelNode.setFontSize(10);
  stamina.labelNode.setFontId(fontName);
  stamina.labelNode.setFontSize(9);
  stamina.labelNode.remeasure();
  explore.labelNode.setFontId(fontName);
  explore.labelNode.setFontSize(Math.min(typeSize, explore.size.height - 2));
  explore.labelNode.remeasure();
  speedBar.labelNode.setFontId(fontName);
  speedBar.labelNode.setFontSize(Math.min(typeSize, speedBar.size.height - 2));
  speedBar.labelNode.remeasure();
  health.setFills({ label: text });
  stamina.setFills({ label: text });
  explore.setFills({ label: text });
  speedBar.setFills({ label: text });
  for (const slot of hotbar.slots) slot.setTheme(theme);
  for (const shortcut of hotbar.shortcuts) {
    shortcut.setFontId(fontName);
    shortcut.setFontSize(Math.max(7, typeSize - 4));
    shortcut.remeasure();
  }
  for (const mark of hotMarks) {
    mark.setFontId(fontName);
    mark.setFontSize(Math.max(10, typeSize));
    mark.remeasure();
  }
  for (const slot of inventory.slots) slot.setTheme(theme);
  const paperCss = `#${panelFill.toString(16).padStart(6, "0")}`;
  const inkCss = `#${text.toString(16).padStart(6, "0")}`;
  const muteCss = `#${themeColor(theme, "muted").toString(16).padStart(6, "0")}`;
  status.style.background = paperCss;
  status.style.color = inkCss;
  status.style.borderBottomColor = muteCss;

  paintChrome();
  layoutHud();
  if (studioReady) composeStudioHud();
}

applyShowcaseSkin();
pushLog("TOUR START");
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
      paintChrome();
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
const windfoilCapability = useWebgpu
  ? {
      ...capability.windfoil,
      supported: false,
      status: "unsupported" as const,
      reasons: [
        ...capability.windfoil.reasons,
        {
          code: "WINDFOIL_RENDERER_KIND_UNSUPPORTED" as const,
          message: "ShaderMaterial spike is not submitted to WebGPURenderer.",
        },
      ],
    }
  : capability.windfoil;
const windfoilSpike = createWindfoilThreeSpike({ capability: windfoilCapability, preprocess });
const windfoilDraw = windfoilSpike.draw([
  { glyphId: 0, x: 0, y: 0, scale: 1, color: [1, 1, 1, 1] },
  { glyphId: 0, x: 12, y: 0, scale: 1, color: [0.55, 0.55, 0.55, 1] },
]);
if (windfoilSpike.mesh && windfoilCapability.supported) {
  windfoilSpike.mesh.position.set(start.x, 1.6, start.z - 0.4);
  windfoilSpike.mesh.scale.set(0.8, 0.25, 1);
  gameScene.add(windfoilSpike.mesh);
} else {
  windfoilSpike.dispose();
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
  boxes: (): Record<string, { x: number; y: number; w: number; h: number; v: boolean }> => {
    const take = (node: HudNode): { x: number; y: number; w: number; h: number; v: boolean } => {
      const box = node.worldBounds();
      return { x: box.x, y: box.y, w: box.width, h: box.height, v: node.visible };
    };
    return {
      title: take(title),
      hint: take(lookHint),
      log: take(logTitle),
      health: take(health),
      stamina: take(stamina),
      explore: take(explore),
      ammo: take(ammo),
      ammoCap: take(ammoCaption),
      inventory: take(inventory),
      hotbar: take(hotbar),
      compass: take(compass),
      speed: take(speedBar),
      map: take(panel),
      tray: take(trayTitle),
    };
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
    mapOn = tools.map;
    setHudVisible(panel, tools.map);
  }
  if (key === "compass") {
    tools.compass = !tools.compass;
    compassOn = tools.compass;
    setHudVisible(compass, tools.compass);
  }
  if (key === "boots") tools.boots = !tools.boots;
  if (key === "flare") tools.flare = 2.4;
  mazeScene.torch.intensity = tools.torch ? 22 : 4;
  trayTitle.setText(tools.map ? "MAP" : "TRAY");
  pushLog(`${key.toUpperCase()} ${key === "torch" ? (tools.torch ? "ON" : "OFF") : "OK"}`);
  paintChrome();
  layoutHud();
  if (studioReady) composeStudioHud();
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
      const itemFill = themeColor(activeTheme(), "fill");
      painted.fill = itemFill;
      painted.frame.fill = itemFill;
    }
    pushLog(`GOT ${key.toUpperCase()}`);
    notice.setText(`RECOVERED / ${key.toUpperCase()}`);
    noticeLeft = 4;
    paintChrome();
    composeStudioHud();
    shake = Math.min(1, shake + 0.18);
  }
}

function refreshMinimap(): void {
  const here = worldToCell(maze, player.x, player.z);
  const radius = (mapCellsShown - 1) / 2;
  const theme = activeTheme();
  const paper = themeColor(theme, "panel");
  const hereFill = themeColor(theme, "fill");
  const loot = themeColor(theme, "selected");
  const floor = invertHud ? 0xb4b4b4 : 0x7a7a7a;
  const wall = invertHud ? 0x2a2a2a : 0x141414;
  for (let row = 0; row < mapCellsShown; row += 1) {
    for (let col = 0; col < mapCellsShown; col += 1) {
      const dot = mapDots[row * MAP_CELLS + col];
      if (!dot) continue;
      const mx = here.x + col - radius;
      const mz = here.z + row - radius;
      let fill = paper;
      if (mx === here.x && mz === here.z) fill = hereFill;
      else if (pickupKeys.has(`${mx},${mz}`) && !isWallCell(maze, mx, mz)) fill = loot;
      else if (!isWallCell(maze, mx, mz)) fill = floor;
      else fill = wall;
      if (dot.fill === fill) continue;
      dot.fill = fill;
      dot.markDirty(STYLE_DIRTY);
    }
  }
}

function writeStatus(): void {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  status.textContent = [
    "v0.1.0",
    "package:@scope/three-hud",
    useWebgpu ? "webgpu overlay-limited" : "webgl",
    `${width}x${height}`,
    invertHud ? "invert" : "night",
    fontName,
    pointerLocked ? "LOOK LOCKED" : "CLICK LOOK",
    autoNav && !pointerLocked ? "auto" : "manual",
    `slot ${hotbar.activeIndex + 1}`,
    "WASD P I F 1-6",
    "health + ammo + inventory + hotbar",
  ].join("  ");
}

function resize(): void {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setSize(width, height, false);
  gameCamera.aspect = width / height;
  gameCamera.updateProjectionMatrix();
  layer.scaleMode = "native";
  layer.setReferenceSize(width, height);
  writeStatus();
  hud.resize();
  if (hud.state === "ready") applyShowcaseSkin();
  if (studioReady) lab.rebuild(studio.state, width, height);
}

const observer = new ResizeObserver(resize);
observer.observe(host);
resize();

function onKey(event: KeyboardEvent, down: boolean): void {
  if (!down) {
    held.delete(event.code);
    return;
  }
  if (
    event.target instanceof HTMLElement &&
    event.target.closest("input, select, textarea, button, [contenteditable]")
  )
    return;
  if (studio.state.view !== "field" && studio.state.view !== "playground") return;
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
  held.add(event.code);
  if (event.repeat) return;
  if (event.code === "KeyB") {
    studio.state.inventory = !studio.state.inventory;
    composeStudioHud();
    studio.refresh();
  }
  if (event.code === "Space") {
    studio.state.paused = !studio.state.paused;
    studio.refresh();
  }
  const digit = event.code.startsWith("Digit") ? Number(event.code.slice(5)) : 0;
  if (digit >= 1 && digit <= 6) {
    hotbar.activate(digit - 1);
    writeStatus();
  }
  if (event.code === "KeyI") {
    invertHud = !invertHud;
    studio.state.invert = invertHud;
    studio.refresh();
    applyShowcaseSkin();
    pushLog(invertHud ? "INK INVERT" : "INK NIGHT");
    writeStatus();
  }
  if (event.code === "KeyF") {
    fontName = fontName === "pixel" ? "ui" : "pixel";
    applyShowcaseSkin();
    writeStatus();
  }
  if (event.code === "KeyP") {
    autoNav = !autoNav;
    lookHint.setText(pointerLocked ? "ESC" : "CLICK LOOK  WASD  P  I  F  1-6");
    pushLog(autoNav ? "TOUR ON" : "TOUR PAUSE");
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
  lookHint.setText(pointerLocked ? "ESC" : "CLICK LOOK  WASD  P  I  F  1-6");
  writeStatus();
}

function onCanvasClick(event: MouseEvent): void {
  if (studio.state.view !== "field" || studio.state.inventory) return;
  const hovered = hud.pointer.hovered;
  if (
    hovered &&
    Object.values(groupNodes).some((node) => {
      for (let current: HudNode | null = hovered; current; current = current.parent)
        if (current === node) return true;
      return false;
    })
  )
    return;
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
renderer.domElement.setAttribute("aria-label", "Three.js scene and HUD");
function clearHeld(): void {
  held.clear();
  player.vx = player.vz = 0;
}
function onFocusIn(event: FocusEvent): void {
  if (
    event.target instanceof HTMLElement &&
    event.target.closest("input, select, textarea, button, [contenteditable]")
  )
    clearHeld();
}
document.addEventListener("focusin", onFocusIn);
addEventListener("blur", clearHeld);
document.addEventListener("visibilitychange", clearHeld);

const lab = createReviewLab(hud, (id) => {
  studio.state.selected = id;
  studio.refresh();
  lab.rebuild(studio.state, host.clientWidth, host.clientHeight);
});
let guideRoot: HudNode | null = null;
let cooldownLeft = 0;
let noticeLeft = 0;
let lastTelemetry = 0;
const notice = addText(layer, "CORE RECOVERED / OBJECTIVE UPDATED", 24, 100, 13);
notice.visible = false;
const abilityLabel = addText(layer, "READY", 0, 0, 11);
const healthReadout = addText(layer, "86 / 100", 0, 0, 23);
const inventoryBackdrop = layer.add(
  new Panel({ id: "inventory-backdrop", width: 340, height: 220, fill: 0x151515, radius: 4 }),
);
const inventoryHeading = addText(layer, "INVENTORY / FIELD KIT", 0, 0, 14);
const inventoryHint = addText(layer, "Collect supplies in the maze.", 0, 0, 10);
function setGroupOrder(node: HudNode, order: number): void {
  node.zIndex = order;
  for (const child of node.children) setGroupOrder(child, order);
}
setGroupOrder(inventoryBackdrop, 40);
setGroupOrder(inventory, 41);
inventoryHeading.zIndex = inventoryHint.zIndex = 42;
notice.zIndex = 60;

const groupNodes = { health, equipment: hotbar, map: panel, crosshair };
for (const [id, node] of Object.entries(groupNodes))
  hud.pointer.addListener(node, (event) => {
    if (event.type !== "click" || event.phase === "capture") return;
    studio.state.selected = id;
    studio.refresh();
  });
function composeStudioHud(): void {
  const width = layer.referenceSize.width,
    height = layer.referenceSize.height;
  const compact = width < 550,
    pad = compact ? 16 : 30;
  for (const node of [explore, speedBar, logPanel, logTitle, lookHint, ...logLabels])
    setHudVisible(node, false);
  title.setText("VAULT 09");
  title.setFontSize(12);
  title.opacity = 0.7;
  title.setPosition(pad, 25);
  title.visible = true;
  const barWidth = Math.min(studio.state.width, Math.max(100, width - pad * 2 - 80));
  health.setSize(barWidth, 4);
  stamina.setSize(barWidth, 2);
  const hx = pad + studio.state.offsetX,
    hy = height - (compact ? 114 : 56) + studio.state.offsetY;
  health.setPosition(hx, hy);
  health.labelNode.setPosition(0, -23);
  health.labelNode.setText("HEALTH");
  health.labelNode.setFontSize(10);
  healthReadout.setText(`${Math.round(health.value)}`);
  healthReadout.setFontSize(16);
  healthReadout.setPosition(hx + barWidth - healthReadout.size.width, hy - 27);
  healthReadout.color = themeColor(activeTheme(), "text");
  stamina.setPosition(hx, hy + 12);
  stamina.labelNode.setPosition(0, 11);
  stamina.labelNode.setText("");
  stamina.labelNode.setFontSize(9);
  const hotScale = Math.min(0.65, (width - pad * 2) / hotbar.size.width);
  hotbar.scaleX = hotbar.scaleY = hotScale;
  hotbar.setPosition((width - hotbar.size.width * hotScale) / 2, height - 72);
  inventory.visible = studio.state.inventory;
  inventory.scaleX = inventory.scaleY = Math.min(0.85, (width - 48) / inventory.size.width);
  inventory.setPosition(
    (width - inventory.size.width * inventory.scaleX) / 2,
    Math.max(90, height / 2 - 50),
  );
  const panelWidth = Math.min(340, width - 32);
  inventoryBackdrop.setSize(panelWidth, 220);
  inventoryBackdrop.background.setSize(panelWidth, 220);
  inventoryBackdrop.setPosition((width - panelWidth) / 2, Math.max(65, height / 2 - 100));
  const inventoryPaper = invertHud ? 0xeeeeee : 0x151515;
  inventoryBackdrop.fill = inventoryBackdrop.background.fill = inventoryPaper;
  inventoryHeading.setPosition(
    inventoryBackdrop.position.x + 18,
    inventoryBackdrop.position.y + 18,
  );
  inventoryHint.setPosition(inventoryBackdrop.position.x + 18, inventoryBackdrop.position.y + 185);
  inventoryHeading.color = inventoryHint.color = themeColor(activeTheme(), "text");
  inventoryBackdrop.visible =
    inventoryHeading.visible =
    inventoryHint.visible =
      studio.state.inventory;
  for (const [index, slot] of inventory.slots.entries()) {
    slot.icon.visible = false;
    slot.fill = invertHud ? 0xaaaaaa : 0x555555;
    slot.frame.fill = invertHud ? 0xdddddd : 0x252525;
    slot.quantity.color = themeColor(activeTheme(), "text");
    slot.quantity.setText(
      bag[index]?.empty === false || (bag[index] && !bag[index]?.empty) ? "1" : "-",
    );
  }
  ammo.visible = false;
  ammoCaption.visible = !compact;
  ammo.setPosition(width - 100, height - 173);
  ammoCaption.setPosition(Math.max(pad, width - ammoCaption.size.width - pad), height - 55);
  ammoCaption.setFontSize(11);
  panel.visible = tools.map && !compact;
  panel.setPosition(width - panel.size.width - pad, 26);
  panel.scaleX = panel.scaleY = 0.8;
  panel.setSize(138, 150);
  panel.background.setSize(138, 150);
  panel.content.setSize(126, 138);
  panel.setPosition(width - 138 * 0.8 - pad, 26);
  panel.setClip(null);
  fitMap(9, 11, 2);
  mapRoot.setPosition(2, 19);
  trayTitle.zIndex = 30;
  trayTitle.setFontSize(9);
  trayTitle.setPosition(panel.position.x + 10, panel.position.y + 9);
  trayTitle.visible = false;
  for (const label of [trayPos, trayHead, trayHelp]) label.visible = false;
  compass.visible = tools.compass && !compact;
  compass.scaleX = compass.scaleY = 0.5;
  compass.setPosition(width / 2 - compass.size.width * 0.25, 20);
  crosshair.visible = !studio.state.inventory;
  crosshair.setPosition(
    width / 2 - crosshair.size.width / 2,
    height / 2 - crosshair.size.height / 2,
  );
  abilityLabel.setPosition(width / 2 - 48, height - 94);
  abilityLabel.setFontSize(10);
  abilityLabel.color = themeColor(activeTheme(), "text");
  notice.setPosition(pad, 80);
  notice.color = themeColor(activeTheme(), "text");
  if (guideRoot) {
    layer.remove(guideRoot);
    guideRoot.dispose();
  }
  guideRoot = guides(layer, width, height, studio.state);
  snapPixelText(layer, hudScale() * renderer.getPixelRatio(), fontName);
  healthReadout.setPosition(hx + barWidth - healthReadout.size.width, hy - 27);
  layer.markDirty(STYLE_DIRTY | QUEUE_DIRTY);
}
function syncStudio(key: string): void {
  const state = studio.state;
  if (key === "view") {
    clearHeld();
    if (document.pointerLockElement) document.exitPointerLock();
  }
  layer.setEnabled(state.view === "playground" || state.view === "field");
  invertHud = state.invert;
  if (["value", "preset"].includes(key) || key === "view") health.setValue(state.value);
  if (key === "dpr") renderer.setPixelRatio(state.dpr);

  resize();
  document.getElementById("lab-note")!.textContent =
    state.view === "field"
      ? "Click the scene to look around. B opens inventory. HUD controls consume pointer input."
      : state.view === "contracts"
        ? "These are live fixtures, not inherited results from the preview. Export contains the actual render queue."
        : "Monochrome tokens · public package widgets · host-owned frame loop";
}
function studioAction(name: string): void {
  if (name === "damage" || name === "heal") {
    const old = health.value;
    studio.state.value = Math.max(0, Math.min(100, old + (name === "damage" ? -23 : 25)));
    health.setValue(studio.state.value);
    health.setDelayedValue(Math.max(old, health.value));
    shake = name === "damage" ? 0.6 : 0;
    notice.setText(name === "damage" ? "DAMAGE / INTEGRITY LOST" : "MEDKIT / INTEGRITY RESTORED");
    noticeLeft = 3;
    composeStudioHud();
    studio.refresh();
  }
  if (name === "ability" && cooldownLeft <= 0) {
    cooldownLeft = 5;
    tools.flare = 2.4;
    studio.state.paused = false;
    studio.refresh();
  }
  if (name === "reset") {
    player.x = start.x + look0.x * 0.4;
    player.z = start.z + look0.z * 0.4;
    player.yaw = spawnYaw;
    player.pitch = 0;
    viewYaw = player.yaw;
    viewPitch = 0;
    shake = 0;
    fovPunch = 0;
    clearHeld();
    staminaState = staminaShown = 100;
    torchState = torchShown = 30;
    cooldownLeft = 0;
    noticeLeft = 0;
    studio.state.value = 86;
    studio.state.offsetX = studio.state.offsetY = 0;
    studio.state.width = 220;
    studio.state.inventory = false;
    bag.splice(
      0,
      bag.length,
      ...Array.from({ length: 4 }, (_, index) => ({ key: `empty-${index}`, empty: true })),
    );
    inventory.setItems(bag);
    pickupKeys.clear();
    seenCells.clear();
    seenCells.add(`${maze.start.x},${maze.start.z}`);
    tourIndex = 0;
    for (const item of mazeScene.collectibles) {
      item.visible = true;
      const cell = worldToCell(maze, item.position.x, item.position.z);
      pickupKeys.add(`${cell.x},${cell.z}`);
    }
    health.setValue(86);
    health.setDelayedValue(86);
    studio.refresh();
    syncStudio("preset");
  }
  if (name === "capture") {
    renderer.render(layer.enabled ? gameScene : labScene, gameCamera);
    hud.render(hud.update(0));
    renderer.domElement.toBlob((blob) => {
      if (blob) download("three-hud.png", blob);
    });
  }
  if (name === "export-contracts")
    download("three-hud-contract.json", JSON.stringify(contractEvidence(), null, 2));
}
function contractEvidence() {
  return {
    schema: "three-hud-live-contract/v1",
    scope: "Live Three.js WebGL queue; visual inspection is separate",
    case: studio.state.contract,
    renderer: overlay.profile,
    dpr: renderer.getPixelRatio(),
    buffer: { width: renderer.domElement.width, height: renderer.domElement.height },
    queue: overlay.lastQueue,
  };
}
function updateStudioTelemetry(now: number, dt: number): void {
  cooldownLeft = Math.max(0, cooldownLeft - dt);
  noticeLeft = Math.max(0, noticeLeft - dt);
  notice.visible = noticeLeft > 0;
  abilityLabel.visible = cooldownLeft > 0;
  abilityLabel.setText(
    cooldownLeft > 0 ? `ABILITY / ${cooldownLeft.toFixed(1)}s` : "ABILITY / READY",
  );
  if (now - lastTelemetry < 300) return;
  lastTelemetry = now;
  if (studio.state.inventory) {
    let target = hud.pointer.hovered;
    while (target && !inventory.slots.some((slot) => slot === target)) target = target.parent;
    const item = target ? bag[inventory.slots.findIndex((slot) => slot === target)] : undefined;
    inventoryHint.setText(
      item && !item.empty
        ? `${item.key.toUpperCase()} / COLLECTED`
        : "Collect supplies in the maze.",
    );
  }

  const queue = overlay.lastQueue;
  document.getElementById("renderer-info")!.textContent =
    `${overlay.profile.toUpperCase()} / Three.js\n${renderer.domElement.width} x ${renderer.domElement.height} buffer\nDPR ${renderer.getPixelRatio()}\n${queue?.commands.length ?? 0} draw commands\n${queue?.batches.length ?? 0} queue batches\n${overlay.ownedResourceCount} owned resources`;
  if (studio.state.view === "contracts")
    document.getElementById("contract-result")!.textContent =
      `${studio.state.contract.toUpperCase()} / live fixture\n${queue?.commands.length ?? 0} commands submitted\n${studio.state.contract === "time" ? "CPU integration: 30 / 60 / 144 FPS\nExpected fuel: 68.000" : "Inspect pixels; export queue evidence."}`;
}
Object.assign(diagnostics, { studio: studio.state, overlay, hud, contractEvidence });
studioReady = true;
studio.connect(syncStudio, studioAction);

let simulationTime = 0;
let previous = performance.now();
let frameId = 0;
let stopped = false;
function frame(now: number): void {
  if (stopped) return;
  frameId = requestAnimationFrame(frame);
  const delta =
    studio.state.paused || (studio.state.view !== "field" && studio.state.view !== "playground")
      ? 0
      : Math.max(0, Math.min(0.05, (now - previous) / 1000));
  previous = now;
  simulationTime += delta;
  const sprintHeld = held.has("ShiftLeft") || held.has("ShiftRight");
  const canSprint = sprintHeld && staminaState > 8;
  player.yaw +=
    turnIntent(
      held.has("KeyQ") || held.has("ArrowLeft"),
      held.has("KeyE") || held.has("ArrowRight"),
    ) *
    TURN_RATE *
    delta;
  let forward =
    (held.has("KeyW") || held.has("ArrowUp") ? 1 : 0) -
    (held.has("KeyS") || held.has("ArrowDown") ? 1 : 0);
  if (studio.state.inventory) forward = 0;
  const strafe = studio.state.inventory
    ? 0
    : (held.has("KeyD") ? 1 : 0) - (held.has("KeyA") ? 1 : 0);
  const manualTurn =
    held.has("KeyQ") || held.has("ArrowLeft") || held.has("KeyE") || held.has("ArrowRight");
  const autoActive =
    autoNav &&
    !studio.state.inventory &&
    !pointerLocked &&
    forward === 0 &&
    strafe === 0 &&
    !manualTurn;
  if (autoActive && tour.length > 0) {
    let steps = 0;
    while (steps < 8) {
      const waypoint = tour[tourIndex];
      if (!waypoint) break;
      const dest = cellCenter(maze, waypoint.x, waypoint.z, destScratch);
      if (Math.hypot(dest.x - player.x, dest.z - player.z) >= 0.34) break;
      tourIndex = (tourIndex + 1) % tour.length;
      steps += 1;
    }
    const waypoint = tour[tourIndex];
    if (waypoint) {
      const dest = cellCenter(maze, waypoint.x, waypoint.z, destScratch);
      const turn = shortestTurn(player.yaw, yawToward(dest.x - player.x, dest.z - player.z));
      player.yaw += Math.sign(turn) * Math.min(Math.abs(turn), 1.8 * delta);
      if (Math.abs(turn) < 0.55) forward = 1;
    }
  }
  const pace =
    (canSprint && tools.boots ? 4.6 : canSprint ? 3.35 : 2.2) *
    (tools.flare > 0 ? 1.08 : 1) *
    (autoActive ? 0.92 : 1);
  const look = yawToLook(player.yaw, 0, lookScratch);
  const right = yawToRight(player.yaw, rightScratch);
  const moveLength = Math.max(1, Math.hypot(forward, strafe));
  const wishX = ((look.x * forward + right.x * strafe) * pace) / moveLength;
  const wishZ = ((look.z * forward + right.z * strafe) * pace) / moveLength;
  const blend = 1 - Math.exp(-MOVE_ACCEL * delta);
  player.vx += (wishX - player.vx) * blend;
  player.vz += (wishZ - player.vz) * blend;
  const nx = player.x + player.vx * delta;
  const nz = player.z + player.vz * delta;
  let bumped = false;
  const blockedX = isBlocked(maze, nx, player.z);
  diagnostics.last.forward = forward;
  diagnostics.last.wishX = wishX;
  diagnostics.last.delta = delta;
  diagnostics.last.blockedX = blockedX;
  if (!blockedX) player.x = nx;
  else bumped = true;
  if (!isBlocked(maze, player.x, nz)) player.z = nz;
  else bumped = true;
  if (bumped) shake = Math.min(1, shake + (canSprint ? 0.1 : 0.05));
  shake = Math.max(0, shake - 2.4 * delta);
  const lookBlend = 1 - Math.exp(-LOOK_DAMP * delta);
  viewYaw += (player.yaw - viewYaw) * lookBlend;
  viewPitch += (player.pitch - viewPitch) * lookBlend;
  const lookPitched = yawToLook(viewYaw, viewPitch, lookPitchedScratch);
  const rightView = yawToRight(viewYaw, rightScratch);
  const shakeAmt = shake * shake;
  const sLat = reduceMotion ? 0 : Math.sin(simulationTime * 7) * SHAKE_POS * shakeAmt;
  const sUp = reduceMotion ? 0 : Math.sin(simulationTime * 9) * SHAKE_POS * 0.55 * shakeAmt;
  gameCamera.position.set(
    player.x + rightView.x * sLat,
    player.y + sUp,
    player.z + rightView.z * sLat,
  );
  gameCamera.lookAt(
    player.x + lookPitched.x + rightView.x * sLat,
    player.y + lookPitched.y + sUp,
    player.z + lookPitched.z + rightView.z * sLat,
  );
  const moving = forward !== 0 || strafe !== 0;
  fovPunch =
    canSprint && moving ? Math.min(2.4, fovPunch + 8 * delta) : fovPunch * Math.exp(-delta / 0.22);
  gameCamera.fov = baseFov + (reduceMotion ? 0 : fovPunch);
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
  if (startGlobe) startGlobe.rotation.y += delta * 0.35;
  for (const [index, item] of mazeScene.collectibles.entries()) {
    if (!item.visible) continue;
    const baseY = Number(item.userData["baseY"] ?? 0.82);
    item.position.y = baseY + (reduceMotion ? 0 : Math.sin(simulationTime * 3 + index) * 0.08);
    if (!reduceMotion) item.rotation.y += delta * 1.2;
  }
  pickupIfClose();
  renderer.render(layer.enabled ? gameScene : labScene, gameCamera);
  if (hud.state !== "ready") return;
  try {
    staminaState = Math.max(
      0,
      Math.min(100, staminaState + (canSprint && moving ? -32 : 16) * delta),
    );
    staminaShown = damp(staminaShown, staminaState, 10, delta);
    stamina.setValue(staminaShown);
    health.setDelayedValue(Math.max(health.value, health.delayedValue - 18 * delta));
    torchState = Math.max(0, torchState - (tools.torch ? 0.28 : 0.03) * delta);
    torchShown = damp(torchShown, torchState, 8, delta);
    ammo.setValue(Math.round(torchShown));
    ammoCaption.setText(
      layer.referenceSize.width < 900
        ? `${Math.round(torchShown)}/30`
        : `TORCH ${Math.round(torchShown)}/30`,
    );
    ammoCaption.setPosition(
      Math.max(30, layer.referenceSize.width - ammoCaption.size.width - 30),
      layer.referenceSize.height - 55,
    );
    headingShown = dampAngle(headingShown, player.yaw, 12, delta);
    compass.setHeading(headingShown);
    const speedTarget = Math.min(100, Math.hypot(player.vx, player.vz) * 22);
    speedShown = damp(speedShown, speedTarget, 8, delta);
    speedBar.setValue(Math.round(speedShown));
    const cell = worldToCell(maze, player.x, player.z, cellScratch);
    seenCells.add(`${cell.x},${cell.z}`);
    const exploreTarget = OPEN_CELLS <= 0 ? 0 : (seenCells.size / OPEN_CELLS) * 100;
    exploreShown = damp(exploreShown, exploreTarget, 6, delta);
    explore.setValue(exploreShown);
    if (layer.referenceSize.width < 420) {
      trayPos.setText(`${cell.x} ${cell.z} ${facingCardinal(player.yaw)}`);
    } else {
      trayPos.setText(`CELL ${cell.x} ${cell.z}`);
      trayHead.setText(`FACE ${facingCardinal(player.yaw)}`);
    }
    const logFade = reduceMotion ? 40 : 9;
    for (const [index, entry] of logState.entries()) {
      entry.opacity = damp(entry.opacity, Math.max(0.35, 1 - index * 0.15), logFade, delta);
      const line = logLabels[index];
      if (!line) continue;
      line.setText(entry.text);
      line.opacity = entry.opacity;
      line.visible = false;
    }
    for (let index = logState.length; index < logLabels.length; index += 1) {
      const line = logLabels[index];
      if (line) line.visible = false;
    }
    crosshair.setSpread(shake * 10);
    refreshMinimap();
    const info = hud.update(delta);
    hud.render(info);
    updateStudioTelemetry(now, delta);
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
  studio.dispose();
  lab.clear();
  checkerTexture.dispose();
  removeEventListener("blur", clearHeld);
  document.removeEventListener("focusin", onFocusIn);
  document.removeEventListener("visibilitychange", clearHeld);
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
  target.toneMapping = THREE.NoToneMapping;
  target.toneMappingExposure = 1;
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
