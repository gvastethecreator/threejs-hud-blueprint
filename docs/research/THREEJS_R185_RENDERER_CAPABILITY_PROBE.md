# Three.js r185 Renderer Capability Probe

Research for HUD-006. Primary sources only: `three@0.185.1` package source in this workspace, official Three.js renderer docs that match those symbols, and the WebGPU / WebGL 2 / WGSL specifications. No blogs.

Pinned versions in this workspace:

| Location                                                       | Version                |
| -------------------------------------------------------------- | ---------------------- |
| `node_modules/three/package.json` `version`                    | `0.185.1`              |
| `packages/three-hud/node_modules/three/package.json` `version` | `0.185.1`              |
| `node_modules/three/src/constants.js` `REVISION`               | `'185'`                |
| `packages/three-hud/package.json` peer                         | `>=0.185.0 <0.186.0`   |
| `packages/three-hud/package.json` types                        | `@types/three@0.185.4` |

Three.js ships two public entry points (`three/package.json` `exports`):

- `three` → `build/three.module.js` → `src/Three.js` exports `WebGLRenderer` only.
- `three/webgpu` → `build/three.webgpu.js` → `src/Three.WebGPU.js` exports `WebGPURenderer`, `Renderer`, `Backend`, `WebGPUBackend`, `WebGLBackend`, `StorageBufferAttribute`, node builders.

A capability probe must duck-type a host-owned renderer. It must not import renderer-private modules, must not treat `isWebGPURenderer` as native WebGPU, and must not advertise Windfoil on the WebGL 2 fallback.

---

## 1. Two renderer families

### 1.1 `WebGLRenderer`

`WebGLRenderer` is a standalone class. It is not a `Renderer` subclass.

- Identity flag: `this.isWebGLRenderer = true` in `src/renderers/WebGLRenderer.js` `WebGLRenderer.constructor`.
- Docs: <https://threejs.org/docs/#api/en/renderers/WebGLRenderer> property `isWebGLRenderer`.
- WebGL 1 is rejected. Passing a `WebGLRenderingContext` throws `THREE.WebGLRenderer: WebGL 1 is not supported since r163.` (`WebGLRenderer.constructor`).
- Context creation is synchronous in the constructor via `canvas.getContext('webgl2', contextAttributes)` (`WebGLRenderer` inner `getContext` / `initGLContext`).
- There is no `init()`, `hasInitialized()`, `backend`, or `hasFeature()`.
- There is no `isRenderer` flag on this class.

Public inspectable surface after construction (all on the instance, no private import):

| Member                                                                            | Kind    | Role                                                                         |
| --------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `isWebGLRenderer`                                                                 | `true`  | Type test                                                                    |
| `getContext()`                                                                    | method  | Returns the live `WebGL2RenderingContext` (`_gl`)                            |
| `getContextAttributes()`                                                          | method  | `gl.getContextAttributes()`                                                  |
| `capabilities`                                                                    | object  | `WebGLCapabilities` snapshot from `src/renderers/webgl/WebGLCapabilities.js` |
| `capabilities.maxTextureSize`                                                     | number  | `gl.getParameter(gl.MAX_TEXTURE_SIZE)`                                       |
| `capabilities.maxCubemapSize`                                                     | number  | `gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)`                              |
| `capabilities.maxTextures` / `maxVertexTextures` / `maxAttributes` / `maxSamples` | number  | GL limits                                                                    |
| `capabilities.getMaxAnisotropy()`                                                 | method  | `EXT_texture_filter_anisotropic` or `0`                                      |
| `capabilities.getMaxPrecision(precision)`                                         | method  | Shader precision downgrade                                                   |
| `capabilities.isWebGL2`                                                           | `true`  | Kept for backwards compatibility; WebGL 1 is gone                            |
| `extensions.has(name)` / `extensions.get(name)`                                   | methods | `src/renderers/webgl/WebGLExtensions.js`                                     |
| `getPixelRatio()` / `setPixelRatio(value)`                                        | methods | Logical→physical scale; default `_pixelRatio = 1`                            |
| `getSize(target)`                                                                 | method  | Logical CSS pixels; does not honor DPR                                       |
| `getDrawingBufferSize(target)`                                                    | method  | `floor(width * pixelRatio, height * pixelRatio)`                             |
| `setDrawingBufferSize(width, height, pixelRatio)`                                 | method  | Sets all three at once                                                       |
| `domElement`                                                                      | canvas  | Host canvas                                                                  |
| `coordinateSystem`                                                                | getter  | Always `WebGLCoordinateSystem`                                               |

`WebGLRenderer` does **not** expose `getMaxAnisotropy()` on the renderer itself. Anisotropy is `renderer.capabilities.getMaxAnisotropy()`. Calling `renderer.getMaxAnisotropy()` on a `WebGLRenderer` throws.

`@types/three@0.185.4` `src/renderers/WebGLRenderer.d.ts` omits `isWebGLRenderer` even though the runtime sets it. Duck-type the runtime flag. Do not trust the DefinitelyTyped surface as complete.

### 1.2 `WebGPURenderer` (and base `Renderer`)

`WebGPURenderer` extends `src/renderers/common/Renderer.js` `Renderer`.

- Identity flags: `this.isRenderer = true` (`Renderer.constructor`) and `this.isWebGPURenderer = true` (`src/renderers/webgpu/WebGPURenderer.js` `WebGPURenderer.constructor`).
- Docs: <https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer> (`isWebGPURenderer`, `forceWebGL`); <https://threejs.org/docs/#api/en/renderers/Renderer> (backend, `init`, `hasInitialized`, `hasFeature`, pixel ratio).
- Constructor comment in source: _"`WebGPURenderer` has the ability to target different backends. By default, the renderer tries to use a WebGPU backend if the browser supports WebGPU. If not, `WebGPURenderer` falls backs to a WebGL 2 backend."_

Backend selection in `WebGPURenderer.constructor`:

```text
if (parameters.forceWebGL)
    backend = new WebGLBackend(parameters)
else
    backend = new WebGPUBackend(parameters)
    parameters.getFallback = () => {
        warn('WebGPURenderer: WebGPU is not available, running under WebGL2 backend.')
        return new WebGLBackend(parameters)
    }
super(backend, parameters)
```

`forceWebGL: true` never installs `getFallback`. The renderer is a WebGL 2 `WebGPURenderer` even when WebGPU exists.

The nodes-only variant `src/renderers/webgpu/WebGPURenderer.Nodes.js` uses the same `forceWebGL` / `getFallback` split and also sets `isWebGPURenderer = true`. It is marked `@private`. The probe should not import it.

Public inspectable surface on `Renderer` / `WebGPURenderer` (duck-typed; no private import):

| Member                                                      | Kind         | Role                                                                             |
| ----------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| `isWebGPURenderer`                                          | `true`       | Type test **of the class**, not of the GPU API                                   |
| `isRenderer`                                                | `true`       | Base `Renderer` type test                                                        |
| `backend`                                                   | object       | Current backend; **replaced** on fallback                                        |
| `init()`                                                    | async method | Creates device/context; required before features                                 |
| `initialized`                                               | getter       | Mirrors private `_initialized`                                                   |
| `hasInitialized()`                                          | method       | Same boolean                                                                     |
| `hasFeature(name)`                                          | method       | Delegates to `backend.hasFeature`; **throws if not initialized**                 |
| `hasFeatureAsync(name)`                                     | method       | Deprecated r181; calls `init()` then `hasFeature`                                |
| `hasCompatibility(name)`                                    | method       | Backend compatibility flags; **throws if not initialized**                       |
| `getContext()`                                              | method       | `backend.getContext()` → `GPUCanvasContext` or `WebGL2RenderingContext`          |
| `getPixelRatio()` / `setPixelRatio(value = 1)`              | methods      | Via `CanvasTarget`; default `1`                                                  |
| `getSize` / `getDrawingBufferSize` / `setDrawingBufferSize` | methods      | Same contract as `WebGLRenderer`                                                 |
| `getMaxAnisotropy()`                                        | method       | `backend.capabilities.getMaxAnisotropy()`                                        |
| `coordinateSystem`                                          | getter       | `backend.coordinateSystem` (`WebGPUCoordinateSystem` or `WebGLCoordinateSystem`) |
| `domElement`                                                | canvas       | From `CanvasTarget`                                                              |

There is no `renderer.capabilities.maxTextureSize` on this family.

---

## 2. Why `isWebGPURenderer` is insufficient

`isWebGPURenderer === true` is assigned unconditionally in the constructor after the backend object is created. It stays `true` when:

1. `forceWebGL: true` selected `WebGLBackend` immediately.
2. `WebGPUBackend.init` threw (`Unable to create WebGPU adapter.` or device request failure) and `Renderer.init` replaced `this.backend` with `getFallback()`'s `WebGLBackend`.

Evidence:

- `WebGPURenderer.constructor` `parameters.forceWebGL` branch (`src/renderers/webgpu/WebGPURenderer.js`).
- `Renderer.init` catch path: `this.backend = backend = this._getFallback(error)` (`src/renderers/common/Renderer.js`).
- Product/architecture already records this: `docs/architecture/WINDFOIL_BACKEND.md`, `docs/architecture/RENDER_PIPELINE.md`, `docs/product/RISK_REGISTER.md` R-003.

A forced or automatic WebGL 2 `WebGPURenderer` must never be treated as native WebGPU.

`coordinateSystem` is also insufficient **before** `init()`: an un-initialized native-path renderer still has a `WebGPUBackend`, so `coordinateSystem` is already `WebGPUCoordinateSystem` even if `init()` will later fall back.

---

## 3. Detecting the active backend after init

### 3.1 Backend classes and type flags

| Class           | File                                           | Flag                          | Marked                                       |
| --------------- | ---------------------------------------------- | ----------------------------- | -------------------------------------------- |
| `WebGPUBackend` | `src/renderers/webgpu/WebGPUBackend.js`        | `this.isWebGPUBackend = true` | JSDoc `@private`                             |
| `WebGLBackend`  | `src/renderers/webgl-fallback/WebGLBackend.js` | `this.isWebGLBackend = true`  | JSDoc `@private`                             |
| `Backend`       | `src/renderers/common/Backend.js`              | none                          | Abstract; `this.renderer`, `this.parameters` |

Both flags are documented on the class as _"This flag can be used for type testing."_ Three.js itself branches on them throughout public node code (`renderer.backend.isWebGPUBackend === true` in `src/nodes/core/VarNode.js`, `src/renderers/common/Background.js`, `src/renderers/common/XRManager.js`).

`renderer.backend` is a documented public property of `Renderer` (docs `Renderer.backend`, `Renderer.d.ts` `backend: Backend`).

**Probe rule:** duck-type `renderer.backend?.isWebGPUBackend === true` and `renderer.backend?.isWebGLBackend === true`. Do **not** `import { WebGPUBackend, WebGLBackend } from 'three/webgpu'` just to `instanceof`. Those classes are exported from `Three.WebGPU.js` but marked `@private`, and `docs/architecture/WINDFOIL_BACKEND.md` rejects importing renderer-private classes/paths.

`constructor.name` (`'WebGPUBackend'` / `'WebGLBackend'`) is not a contract. Minified builds may rename classes; the boolean flags survive minification.

### 3.2 What exists on each backend after a successful `init()`

**`WebGPUBackend` after `init`:**

- `device`: `GPUDevice` from `parameters.device` or `adapter.requestDevice(...)`.
- `context` getter: `GPUCanvasContext` from `parameters.context` or `canvas.getContext('webgpu')`, then `context.configure({ device, format, usage, alphaMode, toneMapping })`.
- `getContext()` returns that `GPUCanvasContext`.
- `compatibilityMode`: `!device.features.has('core-features-and-limits')`.
- `capabilities`: `WebGPUCapabilities` (`getMaxAnisotropy()` hard-coded `16`; `getUniformBufferLimit()` → `device.limits.maxUniformBufferBindingSize`).
- `parameters.requiredLimits`: default `{}`; passed through to `requestDevice`.
- `parameters.forceWebGL`: whatever the constructor received (normally `undefined`/`false` on this path).

**`WebGLBackend` after `init`:**

- `gl`: `parameters.context` or `renderer.domElement.getContext('webgl2', contextAttributes)`.
- `getContext()` returns `this.gl`.
- `extensions` / `capabilities`: fallback utils in `src/renderers/webgl-fallback/utils/` (anisotropy + uniform block size only; **no** `maxTextureSize` helper).
- No `device`.
- `parameters.forceWebGL` is `true` when the host forced fallback; it remains `false`/`undefined` when fallback happened automatically.

### 3.3 Public context duck-types (no backend import)

After init, `renderer.getContext()` is the supported public method (`Renderer.getContext`, `WebGLRenderer.getContext`).

| Context                  | How to recognize                                                                         | Meaning                                |
| ------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| `WebGL2RenderingContext` | `typeof WebGL2RenderingContext !== 'undefined' && ctx instanceof WebGL2RenderingContext` | WebGL 2 (classic renderer or fallback) |
| `GPUCanvasContext`       | `'getCurrentTexture' in ctx` and `typeof ctx.configure === 'function'`                   | Native WebGPU canvas                   |

Do not call `getContext()` on an un-initialized `WebGPURenderer`. `WebGPUBackend.context` configures the canvas with `this.device`; `device` is still `null` before `init()`. `WebGLBackend.getContext()` returns `null` before `init()`.

### 3.4 `forceWebGL` constructor option

Documented on `WebGPURenderer~Options.forceWebGL` (source JSDoc and <https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer>).

This is the **public** way to force the WebGL 2 backend for tests:

```js
const renderer = new WebGPURenderer({ forceWebGL: true });
await renderer.init();
// renderer.isWebGPURenderer === true
// renderer.backend.isWebGLBackend === true
```

Reading `renderer.backend.parameters.forceWebGL` after init is only a hint. Automatic fallback leaves it falsy. Active-backend flags plus context type are authoritative.

A host may also pass `parameters.context` (a `WebGL2RenderingContext` or `GPUCanvasContext`) and/or `parameters.device` (an existing `GPUDevice`). If `device` is supplied, `WebGPUBackend.init` skips `requestAdapter` / `requestDevice` and uses that device as-is.

---

## 4. Initialization is mandatory for WebGPURenderer

`Renderer` starts with `_initialized = false` and `_initPromise = null`.

`Renderer.init()`:

1. Returns the in-flight promise if already started.
2. `await backend.init(this)`.
3. On failure, if `_getFallback` exists, replaces `this.backend` and `await backend.init(this)` again.
4. Constructs node/attribute/texture/pipeline managers.
5. Sets `_initialized = true` and resolves.

`WebGPUBackend.init` is async: `navigator.gpu.requestAdapter({ powerPreference, featureLevel: 'compatibility', xrCompatible })` then `adapter.requestDevice({ requiredFeatures: all GPUFeatureName values the adapter has, requiredLimits })`. Adapter `null` throws `THREE.WebGPUBackend: Unable to create WebGPU adapter.`

`WebGLBackend.init` is sync (despite the base signature): creates the `webgl2` context and extension helpers.

Methods that **require** init (throw otherwise):

- `render()` — `THREE.Renderer: .render() called before the backend is initialized. Use "await renderer.init();" before rendering.`
- `hasFeature()` / `hasCompatibility()` / `initTexture()` / `initRenderTarget()` / `clear()`

Methods that **auto-init**:

- `setAnimationLoop()` — `if (this._initialized === false) await this.init()`
- `computeAsync()`, `hasFeatureAsync()` (deprecated), `resolveTimestampsAsync()`

Public readiness checks:

- `renderer.hasInitialized()` → `_initialized`
- `renderer.initialized` getter → `_initialized`

JSDoc / official docs for `hasFeature` say _"If the renderer has not been initialized, this method always returns `false`."_ The **r185.1 implementation throws** instead (`Renderer.hasFeature`). The probe must use `hasInitialized()` / `initialized` and must not call `hasFeature` until ready.

`WebGLRenderer` has no pending state. Construction either produced a live WebGL 2 context or threw.

---

## 5. Storage buffers and native WGSL

### 5.1 Native WebGPU: storage buffers are core, not a `hasFeature` name

WebGPU storage buffers are a core buffer usage, not an optional `GPUFeatureName`.

- Spec resource usage `storage` / `storage-read` allowed by `GPUBufferUsage.STORAGE`: <https://www.w3.org/TR/webgpu/#programming-model-resource-usages>
- Binding types `"storage"` and `"read-only-storage"`: <https://www.w3.org/TR/webgpu/#enumdef-gpubufferbindingtype>
- Default limits (<https://www.w3.org/TR/webgpu/#limits>):

| Limit                              | Core default        | Compatibility default |
| ---------------------------------- | ------------------- | --------------------- |
| `maxTextureDimension2D`            | 8192                | 4096                  |
| `maxStorageBuffersPerShaderStage`  | 8                   | 8                     |
| `maxStorageBuffersInVertexStage`   | 8                   | **0**                 |
| `maxStorageBuffersInFragmentStage` | 8                   | 4                     |
| `maxStorageBufferBindingSize`      | 134217728 (128 MiB) | 128 MiB               |
| `minStorageBufferOffsetAlignment`  | 256                 | 256                   |

`GPUDevice.features` lists **optional** features (`texture-compression-bc`, `shader-f16`, `timestamp-query`, `float32-filterable`, `core-features-and-limits`, …). Three.js `GPUFeatureName` in `src/renderers/webgpu/utils/WebGPUConstants.js` matches that optional set. There is no `'storage-buffer'` / `'storageBuffer'` feature.

`WebGPUBackend.hasFeature(name)` is:

```js
if (GPUFeatureMap[name] !== undefined) name = GPUFeatureMap[name];
return this.device.features.has(name);
```

`GPUFeatureMap` only remaps S3TC→BC and ETC1→ETC2. `renderer.hasFeature('storageBuffer')` is therefore **`false` on a healthy native WebGPU device**. Do not use `hasFeature` to decide storage-buffer support.

Three.js requests every `GPUFeatureName` the adapter reports (`WebGPUBackend.init` `requiredFeatures: supportedFeatures`). `requiredLimits` come from the constructor (`parameters.requiredLimits`, default `{}`). After init, inspect **`device.limits`**, not the request object.

`WebGPUBackend` always passes `featureLevel: 'compatibility'` to `requestAdapter`. Then `compatibilityMode = !device.features.has('core-features-and-limits')`. In compatibility mode, vertex-stage storage buffers may be **zero**. Fragment-stage storage remains available (default 4). A Windfoil layout that binds storage only in the fragment stage can still be legal; a vertex-stage storage layout must read `device.limits.maxStorageBuffersInVertexStage`.

### 5.2 Three.js storage-buffer types are not a capability

`StorageBufferAttribute` (`src/renderers/common/StorageBufferAttribute.js`):

> _"Note: This type of buffer attribute can only be used with `WebGPURenderer`."_

Docs: <https://threejs.org/docs/#api/en/renderers/common/StorageBufferAttribute>

That sentence names the **class** `WebGPURenderer`, which includes the WebGL 2 fallback. Presence of the type, or a host constructing one, does not mean native SSBOs exist.

### 5.3 WebGL 2 fallback never exposes native storage or WGSL

`GLSLNodeBuilder` (`src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js`):

```js
const supports = {
  swizzleAssign: true,
  storageBuffer: false,
};
```

When `builder.isAvailable('storageBuffer')` is false, `StorageBufferNode.generate` and `StorageArrayElementNode` remap the node to a vertex attribute / varying plus a Pixel Buffer Object `DataTexture` (`setupPBO` / `generatePBO`). `WebGLAttributeUtils` allocates a **dual transform-feedback buffer** for `isStorageBufferAttribute`, not a `SHADER_STORAGE_BUFFER`.

WebGL 2.0 is OpenGL ES 3.0. It has uniform buffers, instancing, and GLSL ES 3.00. It does **not** have shader storage buffer objects (SSBO is ES 3.1 / the abandoned WebGL 2 compute experiment). Khronos WebGL 2.0: <https://registry.khronos.org/webgl/specs/latest/2.0/> (`drawArraysInstanced`, `vertexAttribDivisor`, `MAX_TEXTURE_SIZE`; no `SHADER_STORAGE_BUFFER`).

`WebGLBackend.hasFeature(name)` only looks up `GLFeatureName` (`src/renderers/webgl-fallback/utils/WebGLConstants.js`): compressed textures, `timestamp-query`, `WEBGL_multi_draw`, `OVR_multiview2`. No storage-buffer name.

**Verdict:** WebGL 2 fallback must report `nativeStorageBuffers: false` and `nativeWgsl: false`. PBO / transform-feedback emulation is not Windfoil-capable storage.

### 5.4 Native WGSL only on `WebGPUBackend`

| Path                              | Shader language                  | Builder                                                              |
| --------------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| `WebGPUBackend.createNodeBuilder` | WGSL                             | `WGSLNodeBuilder` (`supports.storageBuffer: true`, `instance: true`) |
| `WebGLBackend.createNodeBuilder`  | GLSL ES                          | `GLSLNodeBuilder` (`storageBuffer: false`)                           |
| `WebGLRenderer` / `WebGLProgram`  | GLSL ES 3.00 (`#version 300 es`) | `src/renderers/webgl/WebGLProgram.js`                                |

`ShaderMaterial` is documented GLSL-only and _"can only be used with `WebGLRenderer`"_ (`src/materials/ShaderMaterial.js`).

WebGPU shader modules are WGSL. Spec: <https://www.w3.org/TR/webgpu/> `GPUShaderModule`; language: <https://www.w3.org/TR/WGSL/>.

**Do not** call `backend.createNodeBuilder` from a probe. That is an internal pipeline hook. Native WGSL is implied by an initialized `isWebGPUBackend` plus a `GPUCanvasContext`.

`WGSLNodeBuilder` / `GLSLNodeBuilder` are exported from `three/webgpu` but are renderer internals. Instantiating them to call `isAvailable('storageBuffer')` is a private-path probe.

---

## 6. Instancing

Instancing is **core** on both APIs that Three.js r185 targets.

WebGL 2 (`WebGL2RenderingContext.drawArraysInstanced`, `vertexAttribDivisor`): <https://registry.khronos.org/webgl/specs/latest/2.0/>. `ANGLE_instanced_arrays` was a WebGL 1 extension and is not a capability question here.

WebGPU: `GPURenderPassEncoder.draw(vertexCount, instanceCount, …)` / `drawIndexed` — core. Three.js `WebGPUBackend` uses `passEncoderGPU.draw(...)` / `drawIndexed(...)`.

Three.js public mesh API: `InstancedMesh` (`isInstancedMesh`), `InstancedBufferGeometry`, `InstancedBufferAttribute`. Works on `WebGLRenderer` (`WebGLBufferRenderer` → `gl.drawArraysInstanced`) and both `WebGPURenderer` backends (`WebGLBackend._draw` uses `renderInstances` when `instanceCount > 1`; `WebGPUBackend` passes `instanceCount` through).

`WEBGL_multi_draw` is optional and only special-cases `BatchedMesh` on the fallback (`WebGLBackend._draw`). It is **not** required for ordinary instancing.

`WGSLNodeBuilder.supports.instance === true`. The GLSL builder does not list `instance` in `supports`; instancing still happens through the WebGL 2 draw path.

**Probe:** report `instancing: true` for `WebGLRenderer` and for any initialized `WebGPURenderer` backend. Report `multiDraw: renderer.extensions?.has('WEBGL_multi_draw')` or `renderer.hasFeature('WEBGL_multi_draw')` only as an extra WebGL note. Do not conflate instancing with storage-buffer instancing (`StorageInstancedBufferAttribute`).

---

## 7. Derivatives

WebGL 2 shaders are GLSL ES 3.00 (`WebGLProgram` writes `#version 300 es`). `dFdx`, `dFdy`, and `fwidth` are core fragment built-ins. `OES_standard_derivatives` was a WebGL 1 extension; do not require it.

WebGPU / WGSL fragment derivatives are `dpdx`, `dpdy`, `fwidth` (<https://www.w3.org/TR/WGSL/#derivative-builtin-functions>). Three.js TSL exposes `dFdx` / `dFdy` / `fwidth` (`src/nodes/math/MathNode.js`) on both node backends.

**Probe:** report `derivatives: true` for every supported r185 profile (WebGL 2 and native WebGPU). This is not a Windfoil discriminator.

---

## 8. Texture size limits

| Renderer                           | Public read                                                                   | Source                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `WebGLRenderer`                    | `renderer.capabilities.maxTextureSize`                                        | `gl.getParameter(gl.MAX_TEXTURE_SIZE)` in `src/renderers/webgl/WebGLCapabilities.js` |
| `WebGPURenderer` + `WebGLBackend`  | `gl.getParameter(gl.MAX_TEXTURE_SIZE)` via `renderer.getContext()` after init | Same GL token; fallback `WebGLCapabilities` has **no** `maxTextureSize` field        |
| `WebGPURenderer` + `WebGPUBackend` | duck-type `renderer.backend.device.limits.maxTextureDimension2D` after init   | WebGPU `GPUSupportedLimits`                                                          |

`WebGPUCapabilities.getMaxAnisotropy()` is hard-coded `16` (`src/renderers/webgpu/utils/WebGPUCapabilities.js`). That is not a texture-dimension limit.

WebGPU default `maxTextureDimension2D` is 8192 (4096 in compatibility mode) unless the host passed a higher `requiredLimits.maxTextureDimension2D` and the adapter granted it. Always read the live `device.limits` after init.

There is no `Renderer.getMaxTextureSize()`. Do not invent one.

JSON field should be a number or `null` when pending.

---

## 9. DPR

Both families default pixel ratio to **1**, not `window.devicePixelRatio`.

- `WebGLRenderer`: `_pixelRatio = 1`; `getPixelRatio` / `setPixelRatio` in `src/renderers/WebGLRenderer.js`. `setPixelRatio` no-ops when `value === undefined`.
- `WebGPURenderer`: `CanvasTarget._pixelRatio = 1` (`src/renderers/common/CanvasTarget.js`); `Renderer.getPixelRatio` / `setPixelRatio` delegate to it. `setPixelRatio(value = 1)`.

Drawing buffer:

```text
physicalWidth  = floor(logicalWidth  * pixelRatio)
physicalHeight = floor(logicalHeight * pixelRatio)
```

`getSize` is logical. `getDrawingBufferSize` honors DPR.

The host must call `setPixelRatio(...)` (typically `window.devicePixelRatio`). The probe reports the **renderer** value as HUD-facing DPR. Optionally record `cssDevicePixelRatio` from `globalThis.devicePixelRatio` when that number exists; never assume they match.

`setPixelRatio` mutates the canvas. A probe may **read** `getPixelRatio()`. It must not call `setPixelRatio` as a side effect.

---

## 10. Public API to force WebGL 2 for tests

Use the documented constructor option:

```js
import { WebGPURenderer } from "three/webgpu";

const renderer = new WebGPURenderer({ forceWebGL: true });
await renderer.init();
```

That is the only supported force switch (`WebGPURenderer~Options.forceWebGL`).

Also valid for tests:

- Construct a classic `WebGLRenderer` from `three`.
- Pass a pre-created `webgl2` context as `parameters.context` together with `forceWebGL: true`.

Not a public force switch:

- Mutating `renderer.backend` after construction.
- Replacing `_getFallback`.
- Importing `WebGLBackend` and calling `new Renderer(new WebGLBackend())` from HUD package code. `Renderer` + `WebGLBackend` are `three/webgpu` exports, but HUD architecture forbids reaching into backend constructors for product code. Tests that live next to the probe may construct `WebGPURenderer({ forceWebGL: true })` only.

---

## 11. What must not be used

The probe (and later Windfoil adapter) must not:

1. Import `three/src/renderers/webgpu/WebGPUBackend.js`, `.../webgl-fallback/WebGLBackend.js`, `WGSLNodeBuilder`, `GLSLNodeBuilder`, or other `src/renderers/**` internals.
2. `instanceof` those classes even via `three/webgpu` named exports.
3. Read `renderer._initialized`, `_initPromise`, `_getFallback`, `_canvasTarget._pixelRatio`, or `backend.data` (`WeakMap`).
4. Call `backend.createNodeBuilder` / inspect node-builder `supports`.
5. Import `three/addons/capabilities/WebGPU.js`. That module runs `await navigator.gpu.requestAdapter()` at **evaluation time**, which violates the HUD rule of no browser work at module evaluation (`Agents.md`, `docs/architecture/PACKAGE_AND_EXPORTS.md`).
6. Import `three/addons/capabilities/WebGL.js` into the library core for the same reason (it touches `document` / `window`).
7. Monkey-patch `hasFeature`, `init`, or backend methods.
8. Treat `isWebGPURenderer`, `StorageBufferAttribute`, or `renderer.hasFeature('storageBuffer')` as native WebGPU + SSBO + WGSL.
9. Call `hasFeature` / `getContext` / `getMaxAnisotropy` on an un-initialized `WebGPURenderer`.
10. Call `renderer.getMaxAnisotropy()` on a `WebGLRenderer` (method does not exist).
11. Serialize `renderer`, `backend`, `GPUDevice`, or canvas/context objects into the report.
12. Claim Windfoil on WebGL 2 fallback because TSL still compiles.

Allowed without importing private modules:

- Duck-type flags listed in sections 1–3.
- Standard Web APIs on objects those methods already return (`WebGL2RenderingContext.getParameter`, `GPUDevice.features`, `GPUDevice.limits`).
- `await renderer.init()` when `typeof renderer.init === 'function'` and the caller asked for a resolved report.

---

## 12. Recommended probe algorithm

### Inputs

A duck-typed host renderer (possibly `null` / `undefined` / unknown object). Optional `{ initialize?: boolean }` (default: do not start init as a hidden side effect; HUD `render()` must not kick off async work). Optional abort signal.

### Detection order

```text
1. If renderer is nullish
     → status: unsupported
       code: HUD_RENDERER_UNSUPPORTED
       reason: no renderer

2. If renderer.isWebGLRenderer === true
     → kind: webgl-renderer
       backend: webgl2
       initialized: true          // constructor is the init
       nativeStorageBuffers: false
       nativeWgsl: false
       instancing: true
       derivatives: true
       maxTextureSize: renderer.capabilities.maxTextureSize
       maxAnisotropy: renderer.capabilities.getMaxAnisotropy()
       pixelRatio: renderer.getPixelRatio()
       contextType: 'webgl2'
       windfoilAdvertised: false
       status: ready

3. If renderer.isWebGPURenderer === true
     3a. If renderer.hasInitialized?.() !== true && renderer.initialized !== true
           If options.initialize && typeof renderer.init === 'function'
             await renderer.init()
             on throw → status: failed, code: HUD_INITIALIZATION_FAILED
           Else
             → status: pending
               reason: WebGPURenderer has not been initialized
               windfoilAdvertised: false
               (do not call hasFeature / getContext)

     3b. After ready:
           backend = renderer.backend
           nativeWebgpu = backend?.isWebGPUBackend === true
           fallbackWebgl = backend?.isWebGLBackend === true
           ctx = renderer.getContext()

           If nativeWebgpu AND gpu-canvas context AND backend.device
             kind: webgpu-renderer
             backend: webgpu
             nativeStorageBuffers: true if
               device.limits.maxStorageBufferBindingSize > 0
               AND device.limits.maxStorageBuffersPerShaderStage > 0
             nativeWgsl: true
             maxTextureSize: device.limits.maxTextureDimension2D
             maxStorageBufferBindingSize: device.limits.maxStorageBufferBindingSize
             maxStorageBuffersPerShaderStage: device.limits.maxStorageBuffersPerShaderStage
             maxStorageBuffersInFragmentStage: device.limits.maxStorageBuffersInFragmentStage
             maxStorageBuffersInVertexStage: device.limits.maxStorageBuffersInVertexStage
             compatibilityMode: backend.compatibilityMode === true
             maxAnisotropy: renderer.getMaxAnisotropy()
             pixelRatio: renderer.getPixelRatio()
             forceWebGL: backend.parameters?.forceWebGL === true   // diagnostic only
             windfoilAdvertised:
               nativeStorageBuffers && nativeWgsl && !fallbackWebgl
             status: ready

           Else if fallbackWebgl OR webgl2 context
             kind: webgpu-renderer
             backend: webgl2-fallback
             nativeStorageBuffers: false
             nativeWgsl: false
             maxTextureSize: ctx.getParameter(ctx.MAX_TEXTURE_SIZE)
             windfoilAdvertised: false
             status: ready
             unsupportedReason for Windfoil:
               WebGPURenderer is active on its WebGL2 fallback

           Else
             status: unsupported / failed
             windfoilAdvertised: false

4. Else
     → status: unsupported
       code: HUD_RENDERER_UNSUPPORTED
       reason: renderer is neither WebGLRenderer nor WebGPURenderer
```

### Pending vs ready vs unsupported vs failed

| State          | When                                                                         | Windfoil                                         |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| `pending`      | `WebGPURenderer` constructed, `init()` not finished                          | **never advertise**                              |
| `ready`        | Context/device available and classified                                      | advertise only on native WebGPU + storage + WGSL |
| `unsupported`  | Missing/unknown renderer, or known profile that cannot do a feature          | explicit `code` + `reason` + alternatives        |
| `failed`       | `init()` threw after fallback also failed, or context/device lost            | explicit `code` + `reason`                       |
| `experimental` | Not produced by this probe for renderer identity; reserved for later M0 gate | n/a                                              |

An uninitialized renderer is **pending**, not a production-ready native-WebGPU claim (`docs/architecture/PUBLIC_API.md`, HUD-006 acceptance).

### Windfoil advertisement rules

Advertise Windfoil **only** when every clause is true:

1. `renderer.isWebGPURenderer === true`
2. `hasInitialized() === true`
3. `backend.isWebGPUBackend === true`
4. `getContext()` is a GPU canvas context
5. `backend.device` is a `GPUDevice`
6. `device.limits.maxStorageBufferBindingSize > 0`
7. `device.limits.maxStorageBuffersPerShaderStage > 0`
8. Native WGSL implied by (3)+(4)

Never advertise when:

- `isWebGLRenderer === true`
- `backend.isWebGLBackend === true` (forced **or** automatic fallback)
- `forceWebGL === true`
- status is `pending`, `unsupported`, or `failed`
- storage limits are missing/zero

Do not use `hasFeature('storageBuffer')`. Do not use the existence of `StorageBufferAttribute`.

Optional later tightening (not required to refuse fallback): if the chosen Windfoil binding uses vertex-stage storage, also require `device.limits.maxStorageBuffersInVertexStage > 0`. Fragment-only storage is the safer default against compatibility mode.

### JSON-safe report fields

Only JSON primitives, arrays, and plain objects. No renderer, backend, device, context, or function values.

```ts
type RendererCapabilityReport = {
  threeRevision: string; // e.g. "185" from THREE.REVISION when readable, else "unknown"
  threePackageVersion: string; // "0.185.1" when the probe knows the pin
  status: "pending" | "ready" | "unsupported" | "failed";
  code: string | null; // HUD_* / TEXT_BACKEND_* when not ready
  reason: string | null;
  alternatives: string[]; // e.g. ["sdf", "bitmap"]

  rendererKind: "webgl-renderer" | "webgpu-renderer" | "unknown" | null;
  isWebGLRenderer: boolean;
  isWebGPURenderer: boolean;
  isRenderer: boolean;

  initialized: boolean;
  initRequired: boolean; // true only for WebGPURenderer family

  activeBackend: "webgl2" | "webgpu" | "webgl2-fallback" | "unknown" | null;
  isWebGPUBackend: boolean;
  isWebGLBackend: boolean;
  forceWebGL: boolean | null; // constructor hint; not authoritative
  compatibilityMode: boolean | null; // WebGPUBackend.compatibilityMode after init
  contextType: "webgl2" | "webgpu" | "unknown" | null;
  coordinateSystem: number | null; // THREE enum value if readable after classification

  nativeStorageBuffers: boolean;
  nativeWgsl: boolean;
  instancing: boolean;
  derivatives: boolean;
  multiDraw: boolean | null; // WebGL extension / hasFeature; null on native WebGPU

  maxTextureSize: number | null;
  maxAnisotropy: number | null;
  maxStorageBufferBindingSize: number | null;
  maxStorageBuffersPerShaderStage: number | null;
  maxStorageBuffersInFragmentStage: number | null;
  maxStorageBuffersInVertexStage: number | null;
  minStorageBufferOffsetAlignment: number | null;

  pixelRatio: number | null; // renderer.getPixelRatio()
  cssDevicePixelRatio: number | null; // globalThis.devicePixelRatio when finite
  drawingBufferWidth: number | null;
  drawingBufferHeight: number | null;
  logicalWidth: number | null;
  logicalHeight: number | null;

  windfoilAdvertised: boolean;
  windfoilReason: string | null;

  optionalFeatures: string[]; // hasFeature names actually queried after init, if any
};
```

Serialization rules:

- Use `null` for unknown/pending numeric fields; never `undefined`.
- `optionalFeatures` is a list of strings (`'float32-filterable'`, `'shader-f16'`, `'timestamp-query'`, …) obtained only after init via `renderer.hasFeature(name)` on **known optional** `GPUFeatureName` / `GLFeatureName` values. Omit or leave `[]` if not queried.
- Do not dump `device.features` as a live `GPUSupportedFeatures` object.
- Do not include canvas, user text, or adapter `info` vendor/architecture strings unless a later privacy review allows binned identifiers.

---

## 13. Mapping to HUD-006 acceptance

| Criterion                                                      | Probe behavior                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Forced WebGL 2 `WebGPURenderer` does not advertise Windfoil    | `forceWebGL: true` → `activeBackend: 'webgl2-fallback'`, `windfoilAdvertised: false` |
| Uninitialized renderer is pending, not production              | `status: 'pending'`, `windfoilAdvertised: false`                                     |
| Report logs as JSON                                            | fields above are JSON-safe                                                           |
| Unit tests: mocked WebGL, native WebGPU, fallback, unavailable | duck-typed flags + fake `getContext` / `device.limits`; no private imports           |

---

## Source index

### Three.js 0.185.1 (workspace)

- `node_modules/three/package.json` — version `0.185.1`, exports `.` / `./webgpu` / `./tsl`
- `node_modules/three/src/constants.js` `REVISION`
- `node_modules/three/src/Three.js` — `WebGLRenderer` export
- `node_modules/three/src/Three.WebGPU.js` — `WebGPURenderer`, backends, storage attributes
- `node_modules/three/src/renderers/WebGLRenderer.js` `WebGLRenderer` — `isWebGLRenderer`, context, capabilities, extensions, pixel ratio
- `node_modules/three/src/renderers/webgl/WebGLCapabilities.js` `WebGLCapabilities` — `maxTextureSize`, `getMaxAnisotropy`
- `node_modules/three/src/renderers/webgl/WebGLExtensions.js` `WebGLExtensions` — `has` / `get`
- `node_modules/three/src/renderers/webgl/WebGLProgram.js` — `#version 300 es`
- `node_modules/three/src/renderers/webgl/WebGLBufferRenderer.js` — `drawArraysInstanced`
- `node_modules/three/src/renderers/webgpu/WebGPURenderer.js` `WebGPURenderer` — `forceWebGL`, `getFallback`, `isWebGPURenderer`
- `node_modules/three/src/renderers/webgpu/WebGPURenderer.Nodes.js` — same backend split; `@private`
- `node_modules/three/src/renderers/common/Renderer.js` `Renderer` — `backend`, `init`, `initialized`, `hasInitialized`, `hasFeature`, `getContext`, pixel ratio, `getMaxAnisotropy`
- `node_modules/three/src/renderers/common/Backend.js` `Backend` — `renderer`, `parameters`, `getContext`
- `node_modules/three/src/renderers/common/CanvasTarget.js` `CanvasTarget` — default pixel ratio `1`
- `node_modules/three/src/renderers/webgpu/WebGPUBackend.js` `WebGPUBackend` — `isWebGPUBackend`, `init`, `device`, `context`, `hasFeature`, `createNodeBuilder`, `compatibilityMode`
- `node_modules/three/src/renderers/webgl-fallback/WebGLBackend.js` `WebGLBackend` — `isWebGLBackend`, `init`, `gl`, `hasFeature`, `createNodeBuilder`
- `node_modules/three/src/renderers/webgpu/utils/WebGPUConstants.js` `GPUFeatureName`, `GPUFeatureMap`
- `node_modules/three/src/renderers/webgpu/utils/WebGPUCapabilities.js` `WebGPUCapabilities`
- `node_modules/three/src/renderers/webgl-fallback/utils/WebGLCapabilities.js` — anisotropy + `MAX_UNIFORM_BLOCK_SIZE` only
- `node_modules/three/src/renderers/webgl-fallback/utils/WebGLConstants.js` `GLFeatureName`
- `node_modules/three/src/renderers/webgpu/nodes/WGSLNodeBuilder.js` `supports.storageBuffer: true`
- `node_modules/three/src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js` `supports.storageBuffer: false`, `setupPBO`
- `node_modules/three/src/renderers/common/StorageBufferAttribute.js` `StorageBufferAttribute`
- `node_modules/three/src/nodes/accessors/StorageBufferNode.js` `StorageBufferNode.generate`
- `node_modules/three/src/nodes/utils/StorageArrayElementNode.js`
- `node_modules/three/src/nodes/math/MathNode.js` `dFdx` / `dFdy` / `fwidth`
- `node_modules/three/src/objects/InstancedMesh.js` `InstancedMesh`
- `node_modules/three/src/materials/ShaderMaterial.js` — GLSL / `WebGLRenderer` only
- `node_modules/three/examples/jsm/capabilities/WebGPU.js` — **do not import** (top-level `requestAdapter`)
- `node_modules/three/examples/jsm/capabilities/WebGL.js` — **do not import** into package core

### Official docs (symbols verified against r185.1 source)

- <https://threejs.org/docs/#api/en/renderers/WebGLRenderer>
- <https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer>
- <https://threejs.org/docs/#api/en/renderers/Renderer>
- <https://threejs.org/docs/#api/en/renderers/common/StorageBufferAttribute>

Live docs track current Three.js. Where JSDoc and implementation disagree in r185.1 (`hasFeature` “returns false” vs throw), the **package source wins**.

### Web APIs

- WebGPU limits and storage usage: <https://www.w3.org/TR/webgpu/#limits>, <https://www.w3.org/TR/webgpu/#programming-model-resource-usages>, <https://www.w3.org/TR/webgpu/#enumdef-gpubufferbindingtype>, <https://www.w3.org/TR/webgpu/#gpusupportedlimits>
- WGSL derivatives: <https://www.w3.org/TR/WGSL/#derivative-builtin-functions>
- WebGL 2.0: <https://registry.khronos.org/webgl/specs/latest/2.0/> (`MAX_TEXTURE_SIZE`, `drawArraysInstanced`; no SSBO)

### Repo contracts this probe must honor

- `planning/tickets/E01/HUD-006-implement-a-renderer-capability-probe-and-compatibility-report.md`
- `docs/architecture/WINDFOIL_BACKEND.md` — native WebGPU + storage + WGSL; `isWebGPURenderer` insufficient
- `docs/architecture/RENDER_PIPELINE.md` — three renderer profiles
- `docs/architecture/PUBLIC_API.md` — initialize `WebGPURenderer` before a final report
- `docs/architecture/ERRORS_AND_DIAGNOSTICS.md` — `pending` / `unsupported` / `failed` capability states
- `docs/architecture/ARCHITECTURE.md` §15 — fallback rejection example
