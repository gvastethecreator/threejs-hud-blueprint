import * as THREE from "three";

export const CELL = 2.55;
export const WALL_HEIGHT = 2.72;
export const WALL_THICK = 0.14;
export const PLAYER_RADIUS = 0.28;

export type MazeGrid = Readonly<{
  width: number;
  height: number;
  walls: ReadonlyArray<boolean>;
  start: Readonly<{ x: number; z: number }>;
  pickups: ReadonlyArray<{ x: number; z: number; key: string }>;
}>;

function createRng(seed: number): () => number {
  let rng = seed >>> 0;
  return (): number => {
    rng = (Math.imul(1664525, rng) + 1013904223) >>> 0;
    return rng / 0x100000000;
  };
}

export function generateMaze(width: number, height: number, seed = 95): MazeGrid {
  const w = width % 2 === 1 ? width : width + 1;
  const h = height % 2 === 1 ? height : height + 1;
  const walls = Array.from({ length: w * h }, () => true);
  const at = (x: number, z: number): number => z * w + x;
  const next = createRng(seed);
  const carve = (x: number, z: number): void => {
    walls[at(x, z)] = false;
  };
  const stack: Array<{ x: number; z: number }> = [{ x: 1, z: 1 }];
  carve(1, 1);
  const dirs = [
    { x: 0, z: -2 },
    { x: 2, z: 0 },
    { x: 0, z: 2 },
    { x: -2, z: 0 },
  ];
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (!current) break;
    const order = [...dirs].sort(() => next() - 0.5);
    let moved = false;
    for (const dir of order) {
      const nx = current.x + dir.x;
      const nz = current.z + dir.z;
      if (nx <= 0 || nz <= 0 || nx >= w - 1 || nz >= h - 1) continue;
      if (walls[at(nx, nz)] !== true) continue;
      carve(current.x + dir.x / 2, current.z + dir.z / 2);
      carve(nx, nz);
      stack.push({ x: nx, z: nz });
      moved = true;
      break;
    }
    if (!moved) stack.pop();
  }
  const open: Array<{ x: number; z: number }> = [];
  for (let z = 1; z < h - 1; z += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      if (walls[at(x, z)] === false) open.push({ x, z });
    }
  }
  const pickups: Array<{ x: number; z: number; key: string }> = [];
  const keys = ["star", "orb", "key", "rat"] as const;
  for (let index = 0; index < keys.length; index += 1) {
    const cell = open[Math.floor(next() * Math.max(1, open.length - 16)) + 8 + index * 7];
    if (!cell || (cell.x === 1 && cell.z === 1)) continue;
    pickups.push({ x: cell.x, z: cell.z, key: keys[index] ?? "star" });
  }
  return { width: w, height: h, walls, start: { x: 1, z: 1 }, pickups };
}

export function isWallCell(grid: MazeGrid, x: number, z: number): boolean {
  if (x < 0 || z < 0 || x >= grid.width || z >= grid.height) return true;
  return grid.walls[z * grid.width + x] === true;
}

export function openNeighbors(grid: MazeGrid, x: number, z: number): Array<{ x: number; z: number }> {
  const cells: Array<{ x: number; z: number }> = [];
  const dirs = [
    { x: 0, z: -1 },
    { x: 1, z: 0 },
    { x: 0, z: 1 },
    { x: -1, z: 0 },
  ] as const;
  for (const dir of dirs) {
    const nx = x + dir.x;
    const nz = z + dir.z;
    if (!isWallCell(grid, nx, nz)) cells.push({ x: nx, z: nz });
  }
  return cells;
}

/** Depth-first tour of reachable floor cells, including backtracks. */
export function mazeTour(grid: MazeGrid): Array<{ x: number; z: number }> {
  const seen = new Set<string>();
  const path: Array<{ x: number; z: number }> = [];
  const mark = (x: number, z: number): string => `${x},${z}`;
  const push = (x: number, z: number): void => {
    const last = path[path.length - 1];
    if (last && last.x === x && last.z === z) return;
    path.push({ x, z });
  };
  const walk = (x: number, z: number): void => {
    seen.add(mark(x, z));
    push(x, z);
    for (const next of openNeighbors(grid, x, z)) {
      if (seen.has(mark(next.x, next.z))) continue;
      walk(next.x, next.z);
      push(x, z);
    }
  };
  walk(grid.start.x, grid.start.z);
  return path;
}

export function yawToward(dx: number, dz: number): number {
  return Math.atan2(dx, -dz);
}

export function shortestTurn(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

/** Yaw 0 looks north (-Z). Positive yaw turns right toward east (+X). */
export function yawToLook(yaw: number, pitch = 0): { x: number; y: number; z: number } {
  const cp = Math.cos(pitch);
  return {
    x: Math.sin(yaw) * cp,
    y: Math.sin(pitch),
    z: -Math.cos(yaw) * cp,
  };
}

/** Strafe-right vector on XZ. At yaw 0 this is +X. */
export function yawToRight(yaw: number): { x: number; z: number } {
  return { x: Math.cos(yaw), z: Math.sin(yaw) };
}

/**
 * Keyboard turn: Q / ArrowLeft look left (negative yaw).
 * E / ArrowRight look right (positive yaw). Matches FPS mouse-look.
 */
export function turnIntent(lookLeft: boolean, lookRight: boolean): number {
  return (lookRight ? 1 : 0) - (lookLeft ? 1 : 0);
}

export function facingCardinal(yaw: number): string {
  const deg = ((yaw * 180) / Math.PI + 3600) % 360;
  if (deg >= 315 || deg < 45) return "N";
  if (deg < 135) return "E";
  if (deg < 225) return "S";
  return "W";
}

export function facingOpenYaw(grid: MazeGrid): number {
  const { x, z } = grid.start;
  if (!isWallCell(grid, x, z + 1)) return Math.PI;
  if (!isWallCell(grid, x + 1, z)) return Math.PI / 2;
  if (!isWallCell(grid, x, z - 1)) return 0;
  return -Math.PI / 2;
}

export function cellCenter(grid: MazeGrid, x: number, z: number): { x: number; z: number } {
  return {
    x: (x - (grid.width - 1) / 2) * CELL,
    z: (z - (grid.height - 1) / 2) * CELL,
  };
}

export function worldToCell(grid: MazeGrid, x: number, z: number): { x: number; z: number } {
  return {
    x: Math.round(x / CELL + (grid.width - 1) / 2),
    z: Math.round(z / CELL + (grid.height - 1) / 2),
  };
}

export function isBlocked(grid: MazeGrid, x: number, z: number, radius = PLAYER_RADIUS): boolean {
  const samples = [
    { x: x - radius, z: z - radius },
    { x: x + radius, z: z - radius },
    { x: x - radius, z: z + radius },
    { x: x + radius, z: z + radius },
  ];
  for (const sample of samples) {
    const cell = worldToCell(grid, sample.x, sample.z);
    if (isWallCell(grid, cell.x, cell.z)) return true;
  }
  return false;
}

function lineMaterial(color: number): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({ color, fog: true });
}

function quantize(value: number): number {
  return Math.round(value * 1000);
}

function addUniqueEdge(
  seen: Set<string>,
  positions: number[],
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): void {
  const a = `${quantize(ax)},${quantize(ay)},${quantize(az)}`;
  const b = `${quantize(bx)},${quantize(by)},${quantize(bz)}`;
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  if (seen.has(key)) return;
  seen.add(key);
  positions.push(ax, ay, az, bx, by, bz);
}

function cellBounds(grid: MazeGrid, x: number, z: number): {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
} {
  const center = cellCenter(grid, x, z);
  const half = CELL / 2;
  return {
    x0: center.x - half,
    x1: center.x + half,
    z0: center.z - half,
    z1: center.z + half,
  };
}

function makeLineMesh(positions: number[], material: THREE.LineBasicMaterial): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const mesh = new THREE.LineSegments(geometry, material);
  mesh.frustumCulled = false;
  return mesh;
}

function wireBox(sx: number, sy: number, sz: number, material: THREE.LineBasicMaterial): THREE.LineSegments {
  const box = new THREE.BoxGeometry(sx, sy, sz);
  const geometry = new THREE.EdgesGeometry(box);
  box.dispose();
  return new THREE.LineSegments(geometry, material);
}

function makePickup(kind: string, ink: THREE.LineBasicMaterial, shade: THREE.LineBasicMaterial): THREE.Object3D {
  const group = new THREE.Group();
  if (kind === "orb") {
    group.add(wireBox(0.22, 0.22, 0.22, ink));
  } else if (kind === "key") {
    const stem = wireBox(0.06, 0.28, 0.06, ink);
    const head = wireBox(0.16, 0.1, 0.06, shade);
    head.position.y = 0.16;
    group.add(stem, head);
  } else if (kind === "rat") {
    const body = wireBox(0.28, 0.12, 0.14, shade);
    const head = wireBox(0.1, 0.1, 0.1, ink);
    head.position.set(0.16, 0.02, 0);
    group.add(body, head);
  } else {
    group.add(wireBox(0.2, 0.2, 0.2, ink));
  }
  return group;
}

function makeLantern(ink: THREE.LineBasicMaterial, shade: THREE.LineBasicMaterial): THREE.Group {
  const group = new THREE.Group();
  const pole = wireBox(0.08, 0.9, 0.08, shade);
  pole.position.y = 0.45;
  const bulb = wireBox(0.18, 0.18, 0.18, ink);
  bulb.position.y = 1.02;
  group.add(pole, bulb);
  group.name = "start-globe";
  return group;
}

export type MazeSceneHandle = Readonly<{
  torch: THREE.PointLight;
  collectibles: THREE.Object3D[];
  setInk: (ink: number, muted: number, paper: number) => void;
  dispose: () => void;
}>;

function paperMaterial(color: number): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({ color, fog: true });
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 1;
  return material;
}

export function buildMazeScene(
  scene: THREE.Scene,
  grid: MazeGrid,
  _anisotropy = 4,
): MazeSceneHandle {
  const inkMat = lineMaterial(0xffffff);
  const mutedMat = lineMaterial(0x888888);
  const paperMat = paperMaterial(0x000000);
  const wallLines: number[] = [];
  const gridLines: number[] = [];
  const wallSeen = new Set<string>();
  const gridSeen = new Set<string>();
  const faces: Array<{ x: number; y: number; z: number; sx: number; sy: number; sz: number }> = [];
  const occluderCells: Array<{ x: number; z: number }> = [];
  const y0 = 0;
  const y1 = WALL_HEIGHT;

  for (let z = 0; z < grid.height; z += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (isWallCell(grid, x, z)) {
        occluderCells.push(cellCenter(grid, x, z));
        continue;
      }
      const { x0, x1, z0, z1 } = cellBounds(grid, x, z);
      const north = isWallCell(grid, x, z - 1);
      const south = isWallCell(grid, x, z + 1);
      const west = isWallCell(grid, x - 1, z);
      const east = isWallCell(grid, x + 1, z);
      const wallEdge = (
        ax: number,
        ay: number,
        az: number,
        bx: number,
        by: number,
        bz: number,
      ): void => addUniqueEdge(wallSeen, wallLines, ax, ay, az, bx, by, bz);
      const gridEdge = (
        ax: number,
        ay: number,
        az: number,
        bx: number,
        by: number,
        bz: number,
      ): void => addUniqueEdge(gridSeen, gridLines, ax, ay, az, bx, by, bz);

      if (north) {
        wallEdge(x0, y0, z0, x1, y0, z0);
        wallEdge(x0, y1, z0, x1, y1, z0);
        wallEdge(x0, y0, z0, x0, y1, z0);
        wallEdge(x1, y0, z0, x1, y1, z0);
        faces.push({
          x: (x0 + x1) / 2,
          y: WALL_HEIGHT / 2,
          z: z0 - WALL_THICK / 2,
          sx: CELL,
          sy: WALL_HEIGHT,
          sz: WALL_THICK,
        });
      } else {
        gridEdge(x0, y0, z0, x1, y0, z0);
        gridEdge(x0, y1, z0, x1, y1, z0);
      }
      if (south) {
        wallEdge(x0, y0, z1, x1, y0, z1);
        wallEdge(x0, y1, z1, x1, y1, z1);
        wallEdge(x0, y0, z1, x0, y1, z1);
        wallEdge(x1, y0, z1, x1, y1, z1);
        faces.push({
          x: (x0 + x1) / 2,
          y: WALL_HEIGHT / 2,
          z: z1 + WALL_THICK / 2,
          sx: CELL,
          sy: WALL_HEIGHT,
          sz: WALL_THICK,
        });
      } else {
        gridEdge(x0, y0, z1, x1, y0, z1);
        gridEdge(x0, y1, z1, x1, y1, z1);
      }
      if (west) {
        wallEdge(x0, y0, z0, x0, y0, z1);
        wallEdge(x0, y1, z0, x0, y1, z1);
        wallEdge(x0, y0, z0, x0, y1, z0);
        wallEdge(x0, y0, z1, x0, y1, z1);
        faces.push({
          x: x0 - WALL_THICK / 2,
          y: WALL_HEIGHT / 2,
          z: (z0 + z1) / 2,
          sx: WALL_THICK,
          sy: WALL_HEIGHT,
          sz: CELL,
        });
      } else {
        gridEdge(x0, y0, z0, x0, y0, z1);
        gridEdge(x0, y1, z0, x0, y1, z1);
      }
      if (east) {
        wallEdge(x1, y0, z0, x1, y0, z1);
        wallEdge(x1, y1, z0, x1, y1, z1);
        wallEdge(x1, y0, z0, x1, y1, z0);
        wallEdge(x1, y0, z1, x1, y1, z1);
        faces.push({
          x: x1 + WALL_THICK / 2,
          y: WALL_HEIGHT / 2,
          z: (z0 + z1) / 2,
          sx: WALL_THICK,
          sy: WALL_HEIGHT,
          sz: CELL,
        });
      } else {
        gridEdge(x1, y0, z0, x1, y0, z1);
        gridEdge(x1, y1, z0, x1, y1, z1);
      }
    }
  }

  const dummy = new THREE.Object3D();
  const faceGeo = new THREE.BoxGeometry(1, 1, 1);
  const faceMesh = new THREE.InstancedMesh(faceGeo, paperMat, Math.max(1, faces.length));
  for (const [index, face] of faces.entries()) {
    dummy.position.set(face.x, face.y, face.z);
    dummy.scale.set(face.sx, face.sy, face.sz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    faceMesh.setMatrixAt(index, dummy.matrix);
  }
  faceMesh.count = faces.length;
  faceMesh.instanceMatrix.needsUpdate = true;
  faceMesh.frustumCulled = false;

  const occluderGeo = new THREE.BoxGeometry(CELL * 0.98, WALL_HEIGHT, CELL * 0.98);
  const occluderMesh = new THREE.InstancedMesh(
    occluderGeo,
    paperMat,
    Math.max(1, occluderCells.length),
  );
  for (const [index, cell] of occluderCells.entries()) {
    dummy.position.set(cell.x, WALL_HEIGHT / 2, cell.z);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    occluderMesh.setMatrixAt(index, dummy.matrix);
  }
  occluderMesh.count = occluderCells.length;
  occluderMesh.instanceMatrix.needsUpdate = true;
  occluderMesh.frustumCulled = false;

  const walls = makeLineMesh(wallLines, inkMat);
  const floors = makeLineMesh(gridLines, mutedMat);
  walls.renderOrder = 1;
  floors.renderOrder = 1;
  scene.add(occluderMesh, faceMesh, walls, floors);

  const torch = new THREE.PointLight(0xffffff, 0, 16, 1.6);
  torch.position.set(0, 1.32, 0);
  scene.add(torch);

  const lantern = makeLantern(inkMat, mutedMat);
  const start = cellCenter(grid, grid.start.x, grid.start.z);
  lantern.position.set(start.x, 0, start.z);
  scene.add(lantern);

  const collectibles: THREE.Object3D[] = [];
  for (const pickup of grid.pickups) {
    const mesh = makePickup(pickup.key, inkMat, mutedMat);
    const pos = cellCenter(grid, pickup.x, pickup.z);
    mesh.position.set(pos.x, 0.82, pos.z);
    mesh.userData = { key: pickup.key, baseY: 0.82 };
    scene.add(mesh);
    collectibles.push(mesh);
  }

  const resources: THREE.Object3D[] = [occluderMesh, faceMesh, walls, floors, lantern, torch];

  return {
    torch,
    collectibles,
    setInk: (ink: number, muted: number, paper: number): void => {
      inkMat.color.set(ink);
      mutedMat.color.set(muted);
      paperMat.color.set(paper);
    },
    dispose: () => {
      for (const object of resources) scene.remove(object);
      for (const object of collectibles) scene.remove(object);
      walls.geometry.dispose();
      floors.geometry.dispose();
      faceGeo.dispose();
      occluderGeo.dispose();
      inkMat.dispose();
      mutedMat.dispose();
      paperMat.dispose();
    },
  };
}
