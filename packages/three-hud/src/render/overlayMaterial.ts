import { ShaderMaterial, type Texture } from "three";
import { OVERLAY_COLOR_POLICY } from "./overlayProfile.js";

export const SHAPE_RECT = 0;
export const SHAPE_ROUNDED = 1;
export const SHAPE_LINE = 2;
export const SHAPE_RING = 3;
export const SHAPE_IMAGE = 4;
export const SHAPE_TEXT = 5;

export function createOverlayShaderMaterial(textured = false): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      map: { value: null },
      useMap: { value: textured ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aShape;
      attribute vec4 aParams;
      attribute vec4 aUvRect;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vShape;
      varying vec4 vParams;
      varying vec4 vUvRect;
      void main() {
        vUv = uv;
        vShape = aShape;
        vParams = aParams;
        vUvRect = aUvRect;
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(1.0);
        #endif
        vec4 world = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          world = instanceMatrix * world;
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform float useMap;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vShape;
      varying vec4 vParams;
      varying vec4 vUvRect;
      float rounded(vec2 uv, float radius) {
        vec2 p = uv * 2.0 - 1.0;
        vec2 d = abs(p) - (1.0 - radius);
        float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
        return 1.0 - smoothstep(-0.02, 0.02, dist);
      }
      float ring(vec2 uv, float inner, float start, float sweep) {
        vec2 p = uv * 2.0 - 1.0;
        float r = length(p);
        float inRing = step(inner, r) * step(r, 1.0);
        float ang = atan(p.y, p.x);
        float rel = mod(ang - start + 6.2831853, 6.2831853);
        float limit = abs(sweep);
        float inSweep = step(rel, limit);
        if (limit >= 6.2831853 - 0.001) inSweep = 1.0;
        return inRing * inSweep;
      }
      void main() {
        float alpha = 1.0;
        vec4 sampleColor = vec4(1.0);
        if (vShape > 0.5 && vShape < 1.5) {
          alpha = rounded(vUv, max(0.02, vParams.x));
        } else if (vShape > 2.5 && vShape < 3.5) {
          alpha = ring(vUv, clamp(vParams.x, 0.0, 0.99), vParams.y, vParams.z);
        }
        if (useMap > 0.5 && vShape > 3.5) {
          vec2 uv = mix(vUvRect.xy, vUvRect.zw, vUv);
          sampleColor = texture2D(map, uv);
          alpha *= sampleColor.a;
          sampleColor.rgb *= sampleColor.a;
        }
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor * sampleColor.rgb, alpha * vParams.w);
      }
    `,
    transparent: true,
    depthTest: OVERLAY_COLOR_POLICY.depthTest,
    depthWrite: OVERLAY_COLOR_POLICY.depthWrite,
    toneMapped: OVERLAY_COLOR_POLICY.toneMapped,
    premultipliedAlpha: true,
  });
}

export function createTextMaterial(atlas: Texture): ShaderMaterial {
  const material = createOverlayShaderMaterial(true);
  const map = material.uniforms["map"];
  const useMap = material.uniforms["useMap"];
  if (map) map.value = atlas;
  if (useMap) useMap.value = 1;
  return material;
}
