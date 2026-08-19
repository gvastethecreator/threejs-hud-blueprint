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

export function isBlocked(
  grid: MazeGrid,
  x: number,
  z: number,
  radius = PLAYER_RADIUS,
): boolean {
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

function makeCanvas(size: number): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context missing");
  return ctx;
}

function canvasTexture(
  ctx: CanvasRenderingContext2D,
  anisotropy: number,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

function brickTexture(anisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const ctx = makeCanvas(size);
  ctx.fillStyle = "#3a221c";
  ctx.fillRect(0, 0, size, size);
  const brickH = 32;
  const brickW = 64;
  const colors = ["#8d4a38", "#7a3d30", "#a05642", "#6c3228", "#94513f", "#824335"];
  for (let row = 0; row < size / brickH; row += 1) {
    const offset = row % 2 === 0 ? 0 : brickW / 2;
    for (let col = -1; col < size / brickW + 1; col += 1) {
      const x = col * brickW + offset;
      const y = row * brickH;
      ctx.fillStyle = colors[(row * 11 + col + 17) % colors.length] ?? "#8d4a38";
      ctx.fillRect(x + 2, y + 2, brickW - 4, brickH - 4);
      ctx.fillStyle = "rgba(255,220,190,0.08)";
      ctx.fillRect(x + 3, y + 3, brickW - 8, 4);
      ctx.fillStyle = "rgba(20,8,6,0.18)";
      ctx.fillRect(x + 4, y + brickH - 7, brickW - 10, 3);
    }
  }
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(0, 0, size, 10);
  return canvasTexture(ctx, anisotropy);
}

function floorTexture(anisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const ctx = makeCanvas(size);
  ctx.fillStyle = "#2a2118";
  ctx.fillRect(0, 0, size, size);
  const tile = 64;
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      const shade = 42 + ((x * 3 + y * 5) % 14);
      ctx.fillStyle = `rgb(${shade + 18},${shade + 8},${shade - 4})`;
      ctx.fillRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4);
      ctx.strokeStyle = "rgba(18,12,8,0.55)";
      ctx.strokeRect(x * tile + 0.5, y * tile + 0.5, tile - 1, tile - 1);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(x * tile + 8, y * tile + 10, tile - 20, 6);
    }
  }
  return canvasTexture(ctx, anisotropy);
}

function ceilingTexture(anisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const ctx = makeCanvas(size);
  ctx.fillStyle = "#1c1612";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#241c16";
  ctx.fillRect(0, 0, size, 28);
  ctx.fillRect(0, size - 28, size, 28);
  ctx.fillStyle = "#2a2118";
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 73) % size;
    const y = (i * 47) % size;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return canvasTexture(ctx, anisotropy);
}

function makePickup(kind: string, color: number): THREE.Object3D {
  const group = new THREE.Group();
  const glow = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.55,
    roughness: 0.32,
    metalness: 0.18,
  });
  if (kind === "orb") {
    group.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), glow));
  } else if (kind === "key") {
    const metal = new THREE.MeshStandardMaterial({
      color: 0xd4b45a,
      emissive: 0x6a4a10,
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.28,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 10, 18), metal);
    ring.rotation.x = Math.PI / 2;
    const bit = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.05), metal);
    bit.position.y = -0.2;
    group.add(ring, bit);
  } else if (kind === "rat") {
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x5a4638, roughness: 0.8 }),
    );
    body.scale.set(1.4, 0.7, 0.8);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x6a5444, roughness: 0.75 }),
    );
    head.position.set(0.16, 0.02, 0);
    group.add(body, head);
  } else {
    group.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.22), glow));
  }
  return group;
}

function makeLantern(): THREE.Group {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.7, metalness: 0.4 }),
  );
  pole.position.y = 0.45;
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffe0a0,
      emissive: 0xffc060,
      emissiveIntensity: 1.4,
      roughness: 0.35,
    }),
  );
  bulb.position.y = 1.05;
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.12, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a3028, metalness: 0.5, roughness: 0.4 }),
  );
  cap.position.y = 1.2;
  group.add(pole, bulb, cap);
  group.name = "start-globe";
  return group;
}

export type MazeSceneHandle = Readonly<{
  torch: THREE.PointLight;
  collectibles: THREE.Object3D[];
  dispose: () => void;
}>;

export function buildMazeScene(
  scene: THREE.Scene,
  grid: MazeGrid,
  anisotropy = 4,
): MazeSceneHandle {
  const bricks = brickTexture(anisotropy);
  const floorMap = floorTexture(anisotropy);
  const ceilMap = ceilingTexture(anisotropy);
  const wallMat = new THREE.MeshStandardMaterial({
    map: bricks,
    roughness: 0.84,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });
  wallMat.polygonOffset = true;
  wallMat.polygonOffsetFactor = 1;
  wallMat.polygonOffsetUnits = 1;
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorMap,
    roughness: 0.94,
    metalness: 0,
  });
  const ceilMat = new THREE.MeshStandardMaterial({
    map: ceilMap,
    roughness: 1,
    metalness: 0,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x2a1c16,
    roughness: 0.7,
    metalness: 0.08,
  });

  const faces: Array<{ x: number; y: number; z: number; sx: number; sy: number; sz: number }> = [];
  const floors: Array<{ x: number; z: number }> = [];
  const posts: Array<{ x: number; z: number }> = [];
  const postKey = new Set<string>();

  for (let z = 0; z < grid.height; z += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (isWallCell(grid, x, z)) continue;
      const pos = cellCenter(grid, x, z);
      floors.push({ x: pos.x, z: pos.z });
      const half = CELL / 2;
      if (isWallCell(grid, x, z - 1)) {
        faces.push({
          x: pos.x,
          y: WALL_HEIGHT / 2,
          z: pos.z - half,
          sx: CELL + WALL_THICK * 3,
          sy: WALL_HEIGHT,
          sz: WALL_THICK,
        });
      }
      if (isWallCell(grid, x, z + 1)) {
        faces.push({
          x: pos.x,
          y: WALL_HEIGHT / 2,
          z: pos.z + half,
          sx: CELL + WALL_THICK * 3,
          sy: WALL_HEIGHT,
          sz: WALL_THICK,
        });
      }
      if (isWallCell(grid, x - 1, z)) {
        faces.push({
          x: pos.x - half,
          y: WALL_HEIGHT / 2,
          z: pos.z,
          sx: WALL_THICK,
          sy: WALL_HEIGHT,
          sz: CELL + WALL_THICK * 3,
        });
      }
      if (isWallCell(grid, x + 1, z)) {
        faces.push({
          x: pos.x + half,
          y: WALL_HEIGHT / 2,
          z: pos.z,
          sx: WALL_THICK,
          sy: WALL_HEIGHT,
          sz: CELL + WALL_THICK * 3,
        });
      }
      for (const [dx, dz] of [
        [-0.5, -0.5],
        [0.5, -0.5],
        [-0.5, 0.5],
        [0.5, 0.5],
      ] as const) {
        const key = `${pos.x + dx * CELL}:${pos.z + dz * CELL}`;
        if (postKey.has(key)) continue;
        const wx = x + (dx < 0 ? -1 : 1);
        const wz = z + (dz < 0 ? -1 : 1);
        if (!isWallCell(grid, wx, z) && !isWallCell(grid, x, wz) && !isWallCell(grid, wx, wz))
          continue;
        postKey.add(key);
        posts.push({ x: pos.x + dx * CELL, z: pos.z + dz * CELL });
      }
    }
  }

  const dummy = new THREE.Object3D();
  const wallGeo = new THREE.BoxGeometry(1, 1, 1);
  const wallMesh = new THREE.InstancedMesh(wallGeo, wallMat, Math.max(1, faces.length));
  const tint = new THREE.Color();
  for (const [index, face] of faces.entries()) {
    dummy.position.set(face.x, face.y, face.z);
    dummy.scale.set(face.sx, face.sy, face.sz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    wallMesh.setMatrixAt(index, dummy.matrix);
    const shade = 0.88 + (index % 7) * 0.02;
    wallMesh.setColorAt(index, tint.setRGB(shade, shade * 0.96, shade * 0.92));
  }
  wallMesh.count = faces.length;
  wallMesh.instanceMatrix.needsUpdate = true;
  if (wallMesh.instanceColor) wallMesh.instanceColor.needsUpdate = true;
  wallMesh.frustumCulled = false;
  scene.add(wallMesh);

  const occluderMat = new THREE.MeshBasicMaterial({ color: 0x0a0706 });
  const occluderGeo = new THREE.BoxGeometry(CELL, WALL_HEIGHT, CELL);
  const occluderCells: Array<{ x: number; z: number }> = [];
  for (let z = 0; z < grid.height; z += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (!isWallCell(grid, x, z)) continue;
      occluderCells.push(cellCenter(grid, x, z));
    }
  }
  const occluderMesh = new THREE.InstancedMesh(
    occluderGeo,
    occluderMat,
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
  scene.add(occluderMesh);

  const trimGeo = new THREE.BoxGeometry(1, 1, 1);
  const trimMesh = new THREE.InstancedMesh(trimGeo, trimMat, Math.max(1, faces.length));
  for (const [index, face] of faces.entries()) {
    dummy.position.set(face.x, 0.08, face.z);
    dummy.scale.set(face.sx + 0.02, 0.16, face.sz + 0.02);
    dummy.updateMatrix();
    trimMesh.setMatrixAt(index, dummy.matrix);
  }
  trimMesh.count = faces.length;
  trimMesh.instanceMatrix.needsUpdate = true;
  trimMesh.frustumCulled = false;
  scene.add(trimMesh);

  const postGeo = new THREE.BoxGeometry(WALL_THICK * 1.7, WALL_HEIGHT, WALL_THICK * 1.7);
  const postMesh = new THREE.InstancedMesh(postGeo, trimMat, Math.max(1, posts.length));
  for (const [index, post] of posts.entries()) {
    dummy.position.set(post.x, WALL_HEIGHT / 2, post.z);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    postMesh.setMatrixAt(index, dummy.matrix);
  }
  postMesh.count = posts.length;
  postMesh.instanceMatrix.needsUpdate = true;
  postMesh.frustumCulled = false;
  scene.add(postMesh);

  const tileGeo = new THREE.PlaneGeometry(CELL, CELL);
  const floorMesh = new THREE.InstancedMesh(tileGeo, floorMat, Math.max(1, floors.length));
  const ceilMesh = new THREE.InstancedMesh(tileGeo, ceilMat, Math.max(1, floors.length));
  for (const [index, tile] of floors.entries()) {
    dummy.position.set(tile.x, 0, tile.z);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.updateMatrix();
    floorMesh.setMatrixAt(index, dummy.matrix);
    dummy.position.y = WALL_HEIGHT;
    dummy.rotation.set(Math.PI / 2, 0, 0);
    dummy.updateMatrix();
    ceilMesh.setMatrixAt(index, dummy.matrix);
  }
  floorMesh.count = floors.length;
  ceilMesh.count = floors.length;
  floorMesh.instanceMatrix.needsUpdate = true;
  ceilMesh.instanceMatrix.needsUpdate = true;
  floorMesh.frustumCulled = false;
  ceilMesh.frustumCulled = false;
  scene.add(floorMesh, ceilMesh);

  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffe6b0,
    emissive: 0xffc878,
    emissiveIntensity: 1.35,
    roughness: 0.45,
  });
  const lampGeo = new THREE.BoxGeometry(0.35, 0.05, 0.35);
  const lamps: Array<{ x: number; z: number }> = [];
  for (const [index, tile] of floors.entries()) {
    if (index % 5 !== 0) continue;
    lamps.push(tile);
  }
  const lampMesh = new THREE.InstancedMesh(lampGeo, lampMat, Math.max(1, lamps.length));
  for (const [index, lamp] of lamps.entries()) {
    dummy.position.set(lamp.x, WALL_HEIGHT - 0.04, lamp.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    lampMesh.setMatrixAt(index, dummy.matrix);
  }
  lampMesh.count = lamps.length;
  lampMesh.instanceMatrix.needsUpdate = true;
  scene.add(lampMesh);

  scene.add(new THREE.HemisphereLight(0xffe6c8, 0x120a08, 0.58));
  const fill = new THREE.DirectionalLight(0xffd7b0, 0.38);
  fill.position.set(6, 10, 4);
  scene.add(fill);
  const torch = new THREE.PointLight(0xffc070, 26, 22, 1.7);
  torch.position.set(0, 1.32, 0);
  scene.add(torch);

  const lantern = makeLantern();
  const start = cellCenter(grid, grid.start.x, grid.start.z);
  lantern.position.set(start.x, 0, start.z);
  scene.add(lantern);

  const collectibles: THREE.Object3D[] = [];
  const palette = [0xe8c547, 0x5fcde4, 0xd4b45a, 0xc47a5a] as const;
  for (const [index, pickup] of grid.pickups.entries()) {
    const mesh = makePickup(pickup.key, palette[index] ?? 0xe8c547);
    const pos = cellCenter(grid, pickup.x, pickup.z);
    mesh.position.set(pos.x, 0.82, pos.z);
    mesh.userData = { key: pickup.key, baseY: 0.82 };
    scene.add(mesh);
    collectibles.push(mesh);
  }

  const resources: THREE.Object3D[] = [
    wallMesh,
    occluderMesh,
    trimMesh,
    postMesh,
    floorMesh,
    ceilMesh,
    lampMesh,
    lantern,
    fill,
    torch,
  ];

  return {
    torch,
    collectibles,
    dispose: () => {
      for (const object of resources) scene.remove(object);
      for (const object of collectibles) scene.remove(object);
      bricks.dispose();
      floorMap.dispose();
      ceilMap.dispose();
      wallGeo.dispose();
      occluderGeo.dispose();
      trimGeo.dispose();
      postGeo.dispose();
      tileGeo.dispose();
      lampGeo.dispose();
      wallMat.dispose();
      floorMat.dispose();
      ceilMat.dispose();
      trimMat.dispose();
      lampMat.dispose();
      occluderMat.dispose();
    },
  };
}
