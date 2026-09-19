import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  type Material,
  type Texture,
} from "three";
import { HudError } from "../contracts/errors.js";
import { createOverlayShaderMaterial } from "./overlayMaterial.js";

export type PoolDiagnostics = Readonly<{
  geometryCount: number;
  materialCount: number;
  instanceCapacity: number;
  instanceUsed: number;
  highWater: number;
  growCount: number;
  allocations: number;
}>;

export type HudResourcePoolOptions = Readonly<{
  initialCapacity?: number;
  maxCapacity?: number;
  material?: Material;
  textured?: boolean;
}>;

const hiddenMatrix = new Matrix4().makeScale(0, 0, 0);
const writeColor = new Color();
const growMatrix = new Matrix4();
const growColor = new Color();
const defaultParams = [0, 0, 0, 1] as const;
const defaultUv = [0, 0, 1, 1] as const;
const emptyExtras: {
  shape?: number;
  params?: readonly [number, number, number, number];
  uv?: readonly [number, number, number, number];
} = {};

export class HudResourcePool {
  readonly unitQuad: PlaneGeometry;
  mesh: InstancedMesh;
  private readonly materials = new Map<string, { material: Material; refs: number }>();
  private readonly free: number[] = [];
  private readonly maxCapacity: number;
  private used = 0;
  private highWater = 0;
  private growCount = 0;
  private allocations = 0;
  private geometryCount = 1;
  private disposed = false;
  private defaultMaterial: Material;
  private shapeAttr: InstancedBufferAttribute | null = null;
  private paramsAttr: InstancedBufferAttribute | null = null;
  private uvAttr: InstancedBufferAttribute | null = null;

  constructor(options: HudResourcePoolOptions = {}) {
    const initial = Math.max(1, options.initialCapacity ?? 16);
    this.maxCapacity = Math.max(initial, options.maxCapacity ?? 4096);
    this.unitQuad = new PlaneGeometry(1, 1);
    this.allocations += 1;
    this.defaultMaterial =
      options.material ?? createOverlayShaderMaterial(options.textured === true);
    this.acquireMaterial("shape|rect|premultiplied", () => this.defaultMaterial);
    this.mesh = this.createMesh(initial);
  }

  diagnostics(): PoolDiagnostics {
    return Object.freeze({
      geometryCount: this.geometryCount,
      materialCount: this.materials.size,
      instanceCapacity: this.capacity(),
      instanceUsed: this.used,
      highWater: this.highWater,
      growCount: this.growCount,
      allocations: this.allocations,
    });
  }

  acquireMaterial(key: string, factory: () => Material): Material {
    this.assertAlive();
    const existing = this.materials.get(key);
    if (existing) {
      existing.refs += 1;
      return existing.material;
    }
    const material = factory();
    this.allocations += 1;
    this.materials.set(key, { material, refs: 1 });
    return material;
  }

  releaseMaterial(key: string): void {
    const existing = this.materials.get(key);
    if (!existing) return;
    existing.refs -= 1;
    if (existing.refs > 0) return;
    if (existing.material !== this.defaultMaterial) existing.material.dispose();
    this.materials.delete(key);
  }

  beginFrame(): void {
    this.assertAlive();
    this.used = 0;
    this.free.length = 0;
  }

  acquireSlot(): number {
    this.assertAlive();
    const recycled = this.free.pop();
    if (recycled !== undefined) {
      this.used += 1;
      this.highWater = Math.max(this.highWater, this.used);
      return recycled;
    }
    if (this.used >= this.capacity()) this.grow(this.used + 1);
    const slot = this.used;
    this.used += 1;
    this.highWater = Math.max(this.highWater, this.used);
    return slot;
  }

  releaseSlot(index: number): void {
    this.assertAlive();
    this.mesh.setMatrixAt(index, hiddenMatrix);
    if (this.mesh.instanceMatrix) this.mesh.instanceMatrix.needsUpdate = true;
    this.free.push(index);
    this.used = Math.max(0, this.used - 1);
  }

  writeInstance(
    index: number,
    matrix: Matrix4,
    fill: number,
    extras: {
      shape?: number;
      params?: readonly [number, number, number, number];
      uv?: readonly [number, number, number, number];
    } = emptyExtras,
  ): void {
    this.assertAlive();
    this.mesh.setMatrixAt(index, matrix);
    writeColor.setHex(fill);
    this.mesh.setColorAt(index, writeColor);
    this.shapeAttr?.setX(index, extras.shape ?? 0);
    const params = extras.params ?? defaultParams;
    this.paramsAttr?.setXYZW(index, params[0], params[1], params[2], params[3]);
    const uv = extras.uv ?? defaultUv;
    this.uvAttr?.setXYZW(index, uv[0], uv[1], uv[2], uv[3]);
    if (this.mesh.instanceMatrix) this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    if (this.shapeAttr) this.shapeAttr.needsUpdate = true;
    if (this.paramsAttr) this.paramsAttr.needsUpdate = true;
    if (this.uvAttr) this.uvAttr.needsUpdate = true;
  }

  instanceUv(index: number): readonly [number, number, number, number] {
    const attr = this.uvAttr;
    if (!attr) return [0, 0, 0, 0];
    return [attr.getX(index), attr.getY(index), attr.getZ(index), attr.getW(index)];
  }

  instanceShape(index: number): number {
    return this.shapeAttr?.getX(index) ?? -1;
  }

  setAtlas(texture: Texture | null): void {
    const material = this.defaultMaterial as Material & {
      uniforms?: Record<string, { value: unknown }>;
    };
    const uniforms = material.uniforms;
    if (!uniforms) {
      if ("map" in material) (material as Material & { map: Texture | null }).map = texture;
      return;
    }
    const map = uniforms["map"];
    const useMap = uniforms["useMap"];
    if (map) map.value = texture;
    if (useMap) useMap.value = texture ? 1 : 0;
    material.needsUpdate = true;
  }

  endFrame(): void {
    const capacity = this.capacity();
    for (let index = this.used; index < capacity; index += 1) {
      this.mesh.setMatrixAt(index, hiddenMatrix);
    }
    if (this.mesh.instanceMatrix) this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.count = this.used;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.releaseMesh(this.mesh);
    this.unitQuad.dispose();
    for (const entry of this.materials.values()) entry.material.dispose();
    this.materials.clear();
    this.free.length = 0;
    this.used = 0;
  }

  private capacity(): number {
    return this.mesh.instanceMatrix.array.length / 16;
  }

  private grow(needed: number): void {
    let next = this.capacity();
    while (next < needed) {
      next *= 2;
      if (next > this.maxCapacity) {
        throw new HudError("INVALID_STATE", "Instance pool exceeded max capacity.", {
          needed,
          maxCapacity: this.maxCapacity,
        });
      }
      this.growCount += 1;
    }
    const previous = this.mesh;
    const prevShape = this.shapeAttr;
    const prevParams = this.paramsAttr;
    const prevUv = this.uvAttr;
    const grown = this.createMesh(next);
    if (prevShape && this.shapeAttr)
      this.shapeAttr.array.set(
        prevShape.array.subarray(0, Math.min(prevShape.array.length, this.shapeAttr.array.length)),
      );
    if (prevParams && this.paramsAttr)
      this.paramsAttr.array.set(
        prevParams.array.subarray(
          0,
          Math.min(prevParams.array.length, this.paramsAttr.array.length),
        ),
      );
    if (prevUv && this.uvAttr)
      this.uvAttr.array.set(
        prevUv.array.subarray(0, Math.min(prevUv.array.length, this.uvAttr.array.length)),
      );
    const copyCount = previous.instanceMatrix.array.length / 16;
    for (let index = 0; index < copyCount; index += 1) {
      previous.getMatrixAt(index, growMatrix);
      grown.setMatrixAt(index, growMatrix);
      if (previous.instanceColor) {
        previous.getColorAt(index, growColor);
        grown.setColorAt(index, growColor);
      }
    }
    if (previous.parent) previous.parent.add(grown);
    this.releaseMesh(previous);
    this.mesh = grown;
  }

  private releaseMesh(mesh: InstancedMesh): void {
    mesh.removeFromParent();
    if (mesh.geometry !== this.unitQuad) mesh.geometry.dispose();
    mesh.dispose();
  }

  private createMesh(capacity: number): InstancedMesh {
    const geometry = this.unitQuad.clone();
    this.shapeAttr = new InstancedBufferAttribute(new Float32Array(capacity), 1);
    this.paramsAttr = new InstancedBufferAttribute(new Float32Array(capacity * 4), 4);
    this.uvAttr = new InstancedBufferAttribute(new Float32Array(capacity * 4), 4);
    geometry.setAttribute("aShape", this.shapeAttr);
    geometry.setAttribute("aParams", this.paramsAttr);
    geometry.setAttribute("aUvRect", this.uvAttr);
    const mesh = new InstancedMesh(geometry, this.defaultMaterial, capacity);
    mesh.frustumCulled = false;
    mesh.count = 0;
    for (let index = 0; index < capacity; index += 1) mesh.setMatrixAt(index, hiddenMatrix);
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
    this.allocations += 1;
    return mesh;
  }

  private assertAlive(): void {
    if (this.disposed) throw new HudError("RESOURCE_DISPOSED", "HUD resource pool is disposed.");
  }
}
