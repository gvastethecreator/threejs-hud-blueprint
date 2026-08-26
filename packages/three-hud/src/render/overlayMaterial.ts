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
      #ifdef GL_OES_standard_derivatives
        #extension GL_OES_standard_derivatives : enable
      #endif
      uniform sampler2D map;
      uniform float useMap;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vShape;
      varying vec4 vParams;
      varying vec4 vUvRect;
      float aawidth(float value) {
        return max(1.0e-5, fwidth(value));
      }
      float aastep(float edge, float value) {
        float w = aawidth(value);
        return smoothstep(edge - w, edge + w, value);
      }
      float rounded(vec2 uv, float radius) {
        vec2 p = uv * 2.0 - 1.0;
        vec2 d = abs(p) - (1.0 - radius);
        float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
        return 1.0 - aastep(0.0, dist);
      }
      float ring(vec2 uv, float inner, float start, float sweep) {
        vec2 p = uv * 2.0 - 1.0;
        float r = length(p);
        float inRing = aastep(inner, r) * (1.0 - aastep(1.0, r));
        float ang = atan(p.y, p.x);
        float rel = mod(ang - start + 6.2831853, 6.2831853);
        float limit = abs(sweep);
        float inSweep = 1.0 - aastep(limit, rel);
        if (limit >= 6.2831853 - 0.001) inSweep = 1.0;
        return inRing * inSweep;
      }
      float rectCover(vec2 uv) {
        vec2 fw = max(vec2(1.0e-5), fwidth(uv));
        vec2 edge = smoothstep(vec2(0.0), fw, uv) * smoothstep(vec2(0.0), fw, 1.0 - uv);
        return edge.x * edge.y;
      }
      void main() {
        float alpha = 1.0;
        vec4 sampleColor = vec4(1.0);
        if (vShape < 4.5) {
          if (vUv.x < vUvRect.x || vUv.y < vUvRect.y || vUv.x > vUvRect.z || vUv.y > vUvRect.w) {
            discard;
          }
        }
        if (vShape > 0.5 && vShape < 1.5) {
          alpha = rounded(vUv, max(0.02, vParams.x));
        } else if (vShape > 2.5 && vShape < 3.5) {
          alpha = ring(vUv, clamp(vParams.x, 0.0, 0.99), vParams.y, vParams.z);
        } else if (vShape < 0.5) {
          alpha = rectCover(vUv);
        }
        if (useMap > 0.5 && vShape > 3.5) {
          vec2 uv = mix(vUvRect.xy, vUvRect.zw, vUv);
          sampleColor = texture2D(map, uv);
          if (vParams.y > 0.5) {
            alpha *= step(0.5, sampleColor.a);
          } else {
            float sd = sampleColor.a;
            float w = max(0.02, fwidth(sd) * 0.75);
            alpha *= smoothstep(0.5 - w, 0.5 + w, sd);
          }
          sampleColor.rgb *= alpha;
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
