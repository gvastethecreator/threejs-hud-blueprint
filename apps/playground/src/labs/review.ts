import {
  Compass,
  Crosshair,
  Hotbar,
  HUD,
  HudNode,
  Image as HudImage,
  InventoryGrid,
  Label,
  Line,
  LinearBar,
  MONOCHROME_INVERT_THEME,
  MONOCHROME_THEME,
  Panel,
  RadialBar,
  Rect,
  resolveViewport,
  Slot,
  type HudLayer,
  type HudPointerEvent,
} from "@scope/three-hud";
import type { StudioState } from "../studio.js";

export const specimens = [
  ["health", "Linear bar", "vitals", "Health with delayed damage"],
  ["segments", "Segmented bar", "vitals", "Stamina in six segments"],
  ["radial", "Radial gauge", "vitals", "Circular value and label"],
  ["hotbar", "Hotbar", "inventory", "Selected equipment and keys"],
  ["inventory", "Inventory grid", "inventory", "Occupied, empty, selected"],
  ["cooldown", "Ability cooldown", "vitals", "Time until available"],
  ["reticle", "Reticle", "navigation", "Spread and confirmation"],
  ["compass", "Compass", "navigation", "Heading and direction"],
  ["minimap", "Minimap", "navigation", "Local map and position"],
  ["clip", "Clipped panel", "content", "Content clipped at the boundary"],
  ["notification", "Notification", "content", "Contextual objective feedback"],
  ["tooltip", "Item tooltip", "content", "Item details and quantity"],
] as const;

export function text(
  parent: HudNode,
  content: string,
  x: number,
  y: number,
  size = 12,
  color = 0xdddddd,
  fontId = "pixel",
) {
  const node = parent.add(new Label({ text: content, fontSize: size, color, fontId }));
  node.setPosition(x, y);
  return node;
}
// The built-in bitmap is 5 x 7. One atlas texel must occupy whole device pixels.
export function snapPixelText(node: HudNode, deviceScale: number, fontId?: "ui" | "pixel") {
  if (node instanceof Label) {
    if (fontId) node.setFontId(fontId);
    if (node.fontId === "pixel") {
      const logicalSize = Math.max(7, Math.round(node.fontSize / 7) * 7);
      const texelSize = Math.max(1, Math.round((logicalSize * deviceScale) / 7));
      node.setFontSize((texelSize * 7) / deviceScale);
    }
  }
  for (const child of node.children) snapPixelText(child, deviceScale, fontId);
}

export function box(
  parent: HudNode,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number,
) {
  const node = parent.add(new Rect({ width, height, fill }));
  node.setPosition(x, y);
  return node;
}
function mono(node: HudNode, invert: boolean) {
  const channel =
    node.fill === 0
      ? 0
      : Math.round((((node.fill >> 16) & 255) + ((node.fill >> 8) & 255) + (node.fill & 255)) / 3);
  const value = invert ? 255 - channel : channel;
  // Container black is transparent to the queue, so leave it intact.
  if (node.fill !== 0 || node.children.length === 0) node.fill = value * 0x010101;
  if (node instanceof Label) {
    node.color = invert ? 0x202020 : 0xdddddd;
    node.setFontId("pixel");
  }
  for (const child of node.children) mono(child, invert);
  if (node instanceof Slot && node.selected) {
    node.fill = invert ? 0x222222 : 0xdddddd;
    node.frame.fill = invert ? 0xbbbbbb : 0x444444;
  }
  node.markDirty((1 << 2) | (1 << 7));
}

function equipmentMark(parent: HudNode, index: number, size: number) {
  const points =
    index % 4 === 0
      ? [
          [8, 24, 24, 8],
          [10, 16, 18, 24],
        ]
      : index % 4 === 1
        ? [
            [8, 9, 24, 9],
            [8, 9, 16, 27],
            [24, 9, 16, 27],
          ]
        : index % 4 === 2
          ? [
              [13, 6, 13, 15],
              [19, 6, 19, 15],
              [13, 15, 7, 26],
              [19, 15, 25, 26],
              [7, 26, 25, 26],
            ]
          : [
              [19, 5, 9, 18],
              [9, 18, 22, 18],
              [22, 18, 13, 29],
            ];
  const group = parent.add(new HudNode());
  group.scaleX = group.scaleY = size / 32;
  for (const [x1, y1, x2, y2] of points)
    group.add(new Line({ x1: x1!, y1: y1!, x2: x2!, y2: y2!, strokeWidth: 1.5, fill: 0xdddddd }));
}

export function createReviewLab(hud: HUD, select: (id: string) => void) {
  let layer: HudLayer | null = null;
  let disconnect: Array<() => void> = [];
  function clear() {
    for (const remove of disconnect) remove();
    disconnect = [];
    if (layer) hud.removeLayer(layer.id, { disposeContent: true });
    layer = null;
  }
  function rebuild(state: StudioState, width: number, height: number) {
    clear();
    if (state.view === "playground" || state.view === "field") return;
    const layout = state.view === "layout" || state.view === "contracts";
    layer = hud.createLayer({
      id: "review-lab",
      referenceSize: { width: layout ? 640 : width, height: layout ? 360 : height },
      scaleMode: layout ? state.scale : "native",
      zoom: layout ? state.zoom : 1,
      pixelSnap: state.scale === "integer",
      order: 20,
    });
    const bg = state.invert ? 0xeeeeee : 0x131313;
    box(layer, 0, 0, layout ? 640 : width, layout ? 360 : height, bg);
    if (state.view === "components") catalog(layer, state, width);
    if (state.view === "layout") typography(layer, state);
    if (state.view === "contracts") contracts(layer, state);
    if (state.safe || state.grid) guides(layer, layout ? 640 : width, layout ? 360 : height, state);
    const transform = resolveViewport({
      referenceSize: layer.referenceSize,
      viewport: { x: 0, y: 0, width, height },
      mode: layer.scaleMode,
      zoom: layout ? state.zoom : 1,
      dpr: state.dpr,
    });
    snapPixelText(layer, transform.scaleY * state.dpr);
  }
  function catalog(root: HudLayer, state: StudioState, width: number) {
    const matches = specimens.filter(
      ([, title, category]) =>
        (state.category === "all" || state.category === category) &&
        title.toLowerCase().includes(state.search.toLowerCase().trim()),
    );
    document.getElementById("component-count")!.textContent = `${matches.length} / 12`;
    if (!matches.length) {
      text(root, "NO COMPONENTS FOUND", 24, 48, 16);
      text(root, "Try a different search or category.", 24, 80, 11);
      return;
    }
    const columns = width >= 740 ? 3 : width >= 420 ? 2 : 1;
    const gap = 10;
    const cellWidth = (width - gap * (columns + 1)) / columns;
    matches.forEach(([id, title, , description], index) => {
      const card = root.add(
        new Rect({
          id: `specimen-${id}`,
          width: cellWidth,
          height: 195,
          fill: state.invert ? 0xd9d9d9 : 0x1d1d1d,
        }),
      );
      card.setPosition(
        gap + (index % columns) * (cellWidth + gap),
        gap + Math.floor(index / columns) * 205,
      );
      const ink = state.invert ? 0x222222 : 0xdddddd;
      text(
        card,
        String(specimens.findIndex((row) => row[0] === id) + 1).padStart(2, "0"),
        14,
        13,
        9,
        ink,
      );
      text(card, title, 14, 33, 12, ink);
      const sample = card.add(new HudNode({ id: `sample-${id}`, width: 230, height: 110 }));
      const scale = Math.min(1, (cellWidth - 28) / 230);
      sample.scaleX = sample.scaleY = scale;
      sample.setPosition(14, 57);
      specimen(sample, id, state);
      mono(sample, state.invert);
      if (id === state.selected) box(card, 0, 193, cellWidth, 2, ink);
      text(
        card,
        description,
        14,
        178,
        Math.min(9, ((cellWidth - 28) / description.length) * 1.5),
        ink,
      );
      const listener = (event: HudPointerEvent) => {
        if (event.type === "click" && event.phase !== "capture") select(id);
      };
      hud.pointer.addListener(card, listener);
      disconnect.push(() => hud.pointer.removeListener(card, listener));
    });
  }
  return {
    rebuild,
    clear,
    get layer() {
      return layer;
    },
  };
}

function specimen(root: HudNode, id: string, state: StudioState) {
  const value = state.profile === "damage" ? Math.max(0, state.value - 23) : state.value;
  const theme = state.invert ? MONOCHROME_INVERT_THEME : MONOCHROME_THEME;
  if (["health", "segments"].includes(id)) {
    const bar = root.add(
      new LinearBar({
        width: 225,
        height: id === "segments" ? 16 : 8,
        value,
        delayedValue: state.value,
        segments: id === "segments" ? 6 : 1,
      }),
    );
    bar.setPosition(0, 47);
    bar.setFills({ track: 0x353535, value: 0xdddddd, delayed: 0x777777 });
    text(root, id === "health" ? "INTEGRITY" : "STAMINA", 0, 13, 10);
    text(root, String(Math.round(value)), 183, 5, 25);
    text(root, "STABLE / 100", 0, 77, 9);
  } else if (id === "radial") {
    const radial = root.add(
      new RadialBar({
        width: 78,
        height: 78,
        value: Math.round(value),
        innerRadius: 33,
        outerRadius: 39,
      }),
    );
    radial.setPosition(76, 6);
    radial.fillRing.fill = 0xdddddd;
    radial.track.fill = 0x444444;
  } else if (id === "hotbar" || id === "inventory") {
    const items = Array.from({ length: id === "hotbar" ? 4 : 8 }, (_, index) => ({
      key: `item-${index}`,
      quantity: index < 6 ? index + 1 : 0,
      empty: index >= 6,
    }));
    const grid =
      id === "hotbar"
        ? new Hotbar({ slots: items, cellSize: 42, gap: 7 })
        : new InventoryGrid({ items, columns: 4, rows: 2, cellSize: 36, gap: 7 });
    root.add(grid);
    grid.setPosition(16, id === "hotbar" ? 24 : 6);
    for (const slot of grid.slots) slot.setTheme(theme);
    grid.slots[1]?.setSelected(true);
    for (const [index, slot] of grid.slots.entries()) {
      slot.icon.visible = false;
      slot.quantity.visible = false;
      if (index < 6) equipmentMark(slot, index, id === "hotbar" ? 40 : 34);
    }
  } else if (id === "cooldown") {
    const slot = root.add(
      new Slot({
        key: "ability",
        size: 64,
        theme,
        cooldown: state.profile === "cooldown" ? 0.65 : 0,
      }),
    );
    slot.setPosition(80, 2);
    slot.icon.visible = false;
    equipmentMark(slot, 3, 60);
    text(root, state.profile === "cooldown" ? "3.2s / RECHARGING" : "READY", 64, 83, 10);
  } else if (id === "reticle") {
    const cross = root.add(new Crosshair({ length: 13, gap: 7, dot: true }));
    cross.setPosition(96, 20);
    cross.setSpread(state.profile === "damage" ? 9 : 0);
    text(root, "SPREAD / CONFIRM", 50, 88, 10);
  } else if (id === "compass") {
    const compass = root.add(new Compass({ width: 76, height: 76 }));
    compass.setPosition(78, 0);
    compass.setHeading(Math.PI / 4);
    text(root, "045 / NORTH EAST", 51, 87, 10);
  } else if (id === "minimap") {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 9; x++)
        box(root, 60 + x * 12, y * 12, 10, 10, (x * 3 + y * 5) % 7 < 3 ? 0x444444 : 0x272727);
    box(root, 108, 36, 8, 8, 0xffffff);
    text(root, "LOCAL / SECTOR 03", 50, 92, 10);
  } else if (id === "clip") {
    const panel = root.add(new Panel({ width: 225, height: 81, fill: 0x222222, radius: 3 }));
    panel.setPosition(0, 10);
    panel.setClip({ x: panel.worldBounds().x, y: panel.worldBounds().y, width: 225, height: 81 });
    for (let i = 0; i < 5; i++)
      text(panel.content, `${i + 1}  CLIPPED PANEL CONTENT`, 4, i * 25, 11);
  } else if (id === "notification") {
    box(root, 0, 20, 225, 63, 0x272727);
    box(root, 0, 81, 175, 2, 0xdddddd);
    text(root, "+", 12, 37, 18);
    text(root, "CORE RECOVERED", 40, 33, 11);
    text(root, "Objective updated", 40, 55, 10);
  } else if (id === "tooltip") {
    box(root, 0, 4, 225, 99, 0x272727);
    text(root, "MEDKIT / MK.II", 12, 15, 13);
    text(root, "Restores 25 integrity.", 12, 42, 10);
    box(root, 12, 67, 201, 1, 0x555555);
    text(root, "CONSUMABLE       x02", 12, 79, 10);
  }
  if (state.profile === "disabled" && !["reticle", "compass", "minimap"].includes(id)) {
    root.opacity = 0.35;
    root.disabled = true;
  }
}

function typography(root: HudLayer, state: StudioState) {
  const ink = state.invert ? 0x222222 : 0xdddddd;
  text(root, "REFERENCE / 640 x 360", 24, 22, 13, ink);
  box(root, 24, 58, 592, 112, state.invert ? 0xcccccc : 0x222222);
  box(root, 24, 190, 592, 112, state.invert ? 0xcccccc : 0x222222);
  text(root, "UI / FILTERED ATLAS", 40, 73, 10, ink);
  text(root, state.text, 40, 103, 25, ink, "ui");
  text(root, "PIXEL / NEAREST ATLAS", 40, 205, 10, ink);
  text(root, state.text, 40, 236, 25, ink, "pixel");
  text(
    root,
    `${state.scale.toUpperCase()}   ZOOM ${state.zoom.toFixed(1)}   DPR ${state.dpr}`,
    24,
    326,
    11,
    ink,
  );
}

function contracts(root: HudLayer, state: StudioState) {
  const ink = state.invert ? 0x222222 : 0xdddddd;
  text(root, `CONTRACT / ${state.contract.toUpperCase()}`, 24, 20, 14, ink);
  text(root, "A / CONTRASTING INPUT", 24, 57, 10, ink);
  text(root, "B / CONTRACT INPUT", 338, 57, 10, ink);
  for (const x of [24, 338]) box(root, x, 83, 278, 209, state.invert ? 0xcccccc : 0x222222);
  if (state.contract === "order") {
    for (const x of [43, 357]) {
      box(root, x, 104, 155, 115, 0x666666);
      text(root, "LABEL ABOVE PANEL", x + 12, 127, 14, ink).zIndex = x === 43 ? -1 : 10;
      box(root, x + 62, 166, 163, 97, 0xaaaaaa);
      text(root, "FRONT", x + 101, 195, 16, 0x111111).zIndex = 20;
    }
  } else if (state.contract === "clip") {
    for (const x of [40, 354]) {
      const group = root.add(new HudNode({ width: 245, height: 148 }));
      group.setPosition(x, 112);
      group.setClip({ x, y: 112, width: x === 354 ? 190 : 245, height: x === 354 ? 113 : 165 });
      box(group, 0, 0, 190, 113, 0x555555);
      text(group, "TEXT ACROSS THE BOUNDARY", 12, 37, 19);
      box(group, 133, 79, 100, 62, 0xcccccc);
    }
  } else if (state.contract === "alpha") {
    for (const x of [42, 356]) {
      const group = root.add(new HudNode({ width: 230, height: 130, opacity: x === 42 ? 1 : 0.5 }));
      group.setPosition(x, 116);
      box(group, 0, 0, 150, 100, 0xaaaaaa);
      const child = box(group, 68, 53, 150, 100, 0xffffff);
      child.opacity = 0.5;
    }
  } else if (state.contract === "dpr") {
    for (const x of [42, 356]) {
      for (let i = 0; i < 14; i++)
        box(root, x + i * 14 + (x === 42 ? 0.35 : 0), 120, 1, 100, 0xeeeeee);
      text(root, `DPR ${state.dpr} / 1px lines`, x, 251, 11, ink);
    }
    root.pixelSnap = true;
  } else if (state.contract === "time") {
    for (const [index, fps] of [30, 60, 144].entries()) {
      let fuel = 100;
      for (let tick = 0; tick < fps * 2; tick++) fuel -= 16 / fps;
      text(root, `${fps} FPS`, 44, 112 + index * 53, 12, ink);
      text(root, `${fuel.toFixed(3)} / 100`, 359, 112 + index * 53, 17, ink);
    }
    text(root, "2 seconds x 16 units/s = 32 units", 24, 320, 12, ink);
  } else if (state.contract === "texture") {
    const missing = root.add(
      new HudImage({ id: "contract-missing-texture", width: 148, height: 112 }),
    );
    missing.setPosition(82, 118);
    const image = root.add(
      new HudImage({
        id: "contract-texture",
        width: 148,
        height: 112,
        texture: { id: "review-checker", ready: true, filter: "nearest", ownership: "borrowed" },
      }),
    );
    image.setPosition(396, 118);
    text(root, "MISSING / NO DRAW", 44, 255, 11, ink);
    text(root, "BOUND / CHECKER TEXTURE", 356, 255, 11, ink);
  }
  if (state.contract !== "time")
    text(root, "Actual queue and pixels; A is an input variation.", 24, 321, 11, ink);
}

export function guides(root: HudNode, width: number, height: number, state: StudioState) {
  const group = root.add(new HudNode({ id: "review-guides", pointerEvents: "none", zIndex: 1000 }));
  if (state.grid) {
    for (let x = 32; x < width; x += 32) box(group, x, 0, 1, height, 0x555555).opacity = 0.4;
    for (let y = 32; y < height; y += 32) box(group, 0, y, width, 1, 0x555555).opacity = 0.4;
  }
  if (state.safe) {
    box(group, 24, 24, width - 48, 1, 0xaaaaaa);
    box(group, 24, height - 24, width - 48, 1, 0xaaaaaa);
    box(group, 24, 24, 1, height - 48, 0xaaaaaa);
    box(group, width - 24, 24, 1, height - 48, 0xaaaaaa);
  }
  return group;
}
