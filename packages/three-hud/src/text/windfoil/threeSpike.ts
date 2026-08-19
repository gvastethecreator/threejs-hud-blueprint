import {
  DataTexture,
  FloatType,
  InstancedMesh,
  PlaneGeometry,
  RGBAFormat,
  ShaderMaterial,
} from "three";
import { HudError } from "../../contracts/errors.js";
import type { FeatureSupport } from "../../contracts/capabilities.js";
import type { WindfoilPreprocessResult } from "./types.js";

export const WINDFOIL_THREE_PUBLIC_APIS = Object.freeze([
  "three.DataTexture",
  "three.FloatType",
  "three.InstancedMesh",
  "three.PlaneGeometry",
  "three.RGBAFormat",
  "three.ShaderMaterial",
  "probeRendererCapabilities",
]);

export type WindfoilGlyphInstance = Readonly<{
  glyphId: number;
  x: number;
  y: number;
  scale: number;
  color: readonly [number, number, number, number];
}>;

export type EncodedWindfoilInstance = Readonly<{
  glyphId: number;
  x: number;
  y: number;
  scale: number;
  color: readonly [number, number, number, number];
  curveStart: number;
  curveCount: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}>;

export type EncodedWindfoilDraw = Readonly<{
  instances: readonly EncodedWindfoilInstance[];
  instanceCount: number;
  uniqueGlyphCount: number;
  reusedInstanceCount: number;
}>;

export type WindfoilDrawResult = Readonly<{
  status: "drawn" | "unsupported";
  drawCalls: number;
  instanceCount: number;
  uniqueGlyphCount: number;
  reusedInstanceCount: number;
  reason?: string;
}>;

export type WindfoilThreeSpike = {
  readonly id: "windfoil-three-spike";
  readonly capability: FeatureSupport;
  readonly publicApis: typeof WINDFOIL_THREE_PUBLIC_APIS;
  readonly mesh: InstancedMesh | null;
  encode(instances: readonly WindfoilGlyphInstance[]): EncodedWindfoilDraw;
  draw(instances: readonly WindfoilGlyphInstance[]): WindfoilDrawResult;
  dispose(): void;
};

export function encodeWindfoilInstances(
  preprocess: WindfoilPreprocessResult,
  instances: readonly WindfoilGlyphInstance[],
): EncodedWindfoilDraw {
  const byGlyph = new Map(preprocess.glyphs.map((glyph) => [glyph.glyphId, glyph]));
  const seen = new Set<number>();
  let reusedInstanceCount = 0;
  const encoded: EncodedWindfoilInstance[] = [];
  for (const instance of instances) {
    const glyph = byGlyph.get(instance.glyphId);
    if (!glyph) {
      throw new HudError(
        "INVALID_ARGUMENT",
        "Instance glyph is missing from the preprocess atlas.",
        {
          glyphId: instance.glyphId,
        },
      );
    }
    if (seen.has(instance.glyphId)) reusedInstanceCount += 1;
    seen.add(instance.glyphId);
    encoded.push(
      Object.freeze({
        glyphId: instance.glyphId,
        x: instance.x,
        y: instance.y,
        scale: instance.scale,
        color: instance.color,
        curveStart: glyph.curveStart,
        curveCount: glyph.curveCount,
        width: glyph.bounds.width,
        height: glyph.bounds.height,
        offsetX: glyph.bounds.x,
        offsetY: glyph.bounds.y,
      }),
    );
  }
  return Object.freeze({
    instances: Object.freeze(encoded),
    instanceCount: encoded.length,
    uniqueGlyphCount: seen.size,
    reusedInstanceCount,
  });
}

export function createWindfoilThreeSpike(options: {
  capability: FeatureSupport;
  preprocess: WindfoilPreprocessResult;
}): WindfoilThreeSpike {
  let disposed = false;
  const owned: Array<{ dispose: () => void }> = [];
  let mesh: InstancedMesh | null = null;
  if (options.capability.supported) {
    const geometry = retain(new PlaneGeometry(1, 1));
    const material = retain(createPremultipliedMaterial(options.preprocess));
    mesh = new InstancedMesh(geometry, material, 256);
    mesh.frustumCulled = false;
  }

  return {
    id: "windfoil-three-spike",
    capability: options.capability,
    publicApis: WINDFOIL_THREE_PUBLIC_APIS,
    get mesh() {
      return mesh;
    },
    encode(instances) {
      return encodeWindfoilInstances(options.preprocess, instances);
    },
    draw(instances) {
      if (disposed) throw new HudError("RESOURCE_DISPOSED", "Windfoil spike is disposed.");
      if (!options.capability.supported || mesh === null) {
        return Object.freeze({
          status: "unsupported",
          drawCalls: 0,
          instanceCount: 0,
          uniqueGlyphCount: 0,
          reusedInstanceCount: 0,
          reason:
            options.capability.reasons[0]?.message ?? "Windfoil is not available on this renderer.",
        });
      }
      const encoded = encodeWindfoilInstances(options.preprocess, instances);
      mesh.count = encoded.instanceCount;
      return Object.freeze({
        status: "drawn",
        drawCalls: encoded.instanceCount === 0 ? 0 : 1,
        instanceCount: encoded.instanceCount,
        uniqueGlyphCount: encoded.uniqueGlyphCount,
        reusedInstanceCount: encoded.reusedInstanceCount,
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      mesh?.dispose();
      mesh = null;
      for (const resource of owned) resource.dispose();
      owned.length = 0;
    },
  };

  function retain<T extends { dispose: () => void }>(resource: T): T {
    owned.push(resource);
    return resource;
  }
}

function createPremultipliedMaterial(preprocess: WindfoilPreprocessResult): ShaderMaterial {
  const texture = packCurveTexture(preprocess);
  const material = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    premultipliedAlpha: true,
    toneMapped: false,
    uniforms: {
      curveTex: { value: texture },
      curveCount: { value: preprocess.curves.length },
    },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.85, 0.95, 1.0, 0.85);
      }
    `,
  });
  material.userData["curveTexture"] = texture;
  return material;
}

function packCurveTexture(preprocess: WindfoilPreprocessResult): DataTexture {
  const width = Math.max(1, preprocess.curves.length);
  const data = new Float32Array(width * 4);
  for (let i = 0; i < preprocess.curves.length; i += 1) {
    const curve = preprocess.curves[i];
    if (!curve) continue;
    data.set([curve.p0.x, curve.p0.y, curve.p1.x, curve.p1.y], i * 4);
  }
  const texture = new DataTexture(data, width, 1, RGBAFormat, FloatType);
  texture.needsUpdate = true;
  return texture;
}
