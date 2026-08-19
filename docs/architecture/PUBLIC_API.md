# Proposed Public API — v0.1

This is the API target for implementation tickets. It may change through accepted ADRs before `v0.1.0`; accidental implementation details must not leak merely because they exist.

## Installation

```bash
pnpm add @scope/three-hud three
```

Text backends are explicit subpath imports:

```ts
import { createSdfTextBackend } from "@scope/three-hud/text/sdf";
import { createBitmapTextBackend } from "@scope/three-hud/text/bitmap";
import { createWindfoilTextBackend } from "@scope/three-hud/text/windfoil";
```

## Minimal lifecycle

```ts
import * as THREE from "three";
import { Hud, Label, LinearBar, type HudDiagnostic } from "@scope/three-hud";
import { createSdfTextBackend } from "@scope/three-hud/text/sdf";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.append(renderer.domElement);

const sdf = await createSdfTextBackend();

const hud = new Hud({
  renderer,
  textBackends: [sdf],
  referenceSize: [1920, 1080],
  scaleMode: "contain",
  onDiagnostic(diagnostic: HudDiagnostic) {
    // The host decides how to display/store diagnostics.
    console.info(diagnostic.code, diagnostic.message);
  },
});

await hud.initialize();

await hud.fonts.register({
  id: "ui",
  source: new URL("./fonts/Ui-Regular.ttf", import.meta.url),
  license: {
    id: "OFL-1.1",
    source: "project asset inventory",
    redistribution: "host-managed",
  },
});

const layer = hud.createLayer({
  id: "main",
  referenceSize: [1920, 1080],
  scaleMode: "contain",
  safeInsets: { top: 32, right: 32, bottom: 32, left: 32 },
});

const health = new LinearBar({
  min: 0,
  max: 100,
  value: 72,
  width: 360,
  height: 28,
  label: {
    text: "HP 72 / 100",
    font: "ui",
    size: 22,
  },
});

health.layout.absolute = {
  anchor: "top-left",
  pivot: [0, 0],
  offset: [0, 0],
  target: "safe",
};

layer.root.add(health);

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  hud.resize({
    width: innerWidth,
    height: innerHeight,
    dpr: renderer.getPixelRatio(),
  });
}

renderer.setAnimationLoop((time) => {
  const dt = time * 0.001;
  hud.update(dt);

  renderer.render(gameScene, gameCamera);
  hud.render();
});

// Cleanup owned by the host:
function destroy() {
  hud.dispose();
  sdf.dispose();
  renderer.dispose();
}
```

## Core lifecycle

```ts
export interface HudOptions {
  renderer: HudSupportedRenderer;
  referenceSize?: readonly [width: number, height: number];
  scaleMode?: ScaleMode;
  textBackends?: readonly TextBackend[];
  diagnostics?: HudDiagnosticsOptions;
  onDiagnostic?: (diagnostic: HudDiagnostic) => void;
}

export class Hud {
  readonly state: HudLifecycleState;
  readonly root: HudNode;
  readonly fonts: FontRegistry;
  readonly diagnostics: HudDiagnostics;
  readonly stats: Readonly<HudStats>;

  constructor(options: HudOptions);

  initialize(signal?: AbortSignal): Promise<void>;
  createLayer(options: HudLayerOptions): HudLayer;
  getLayer(id: string): HudLayer | undefined;
  removeLayer(id: string, options?: RemoveLayerOptions): boolean;

  resize(input: HudResizeInput): void;
  update(deltaSeconds: number): void;
  render(options?: HudRenderOptions): void;

  suspend(): void;
  resume(): void;
  dispose(): void;
}
```

### Lifecycle rules

- A WebGPURenderer must be initialized before the backend capability report can become final.
- `render()` before readiness follows the configured diagnostic/no-op policy; it never starts hidden async work.
- `dispose()` is idempotent.
- The host renderer is borrowed and never disposed by `Hud`.
- The host owns the frame clock and loop.

## Layers and viewport

```ts
export type ScaleMode = "contain" | "cover" | "native" | "stretch" | "integer";

export interface HudLayerOptions {
  id: string;
  order?: number;
  referenceSize?: readonly [number, number];
  scaleMode?: ScaleMode;
  integerDownscale?: "overflow-1x" | "disable" | "explicit-fractional";
  pixelSnap?: boolean;
  safeInsets?: Partial<Insets>;
  zoom?: number;
  zoomAnchor?: readonly [number, number];
  enabled?: boolean;
}

export interface HudResizeInput {
  width: number; // logical/CSS pixels
  height: number;
  dpr: number;
  viewport?: RectLike; // logical/CSS pixels
  scissor?: RectLike;
  drawingBufferSize?: readonly [number, number];
}

export class HudLayer {
  readonly id: string;
  readonly root: HudNode;
  readonly viewport: Readonly<LayerViewportSnapshot>;

  order: number;
  enabled: boolean;
  zoom: number;

  setOptions(patch: Partial<HudLayerOptions>): void;
}
```

## Retained nodes

```ts
export abstract class HudNode {
  readonly id: string;
  readonly parent: HudNode | null;
  readonly children: readonly HudNode[];

  debugLabel?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;

  position: MutableVec2;
  scale: MutableVec2;
  rotation: number;
  pivot: MutableVec2;

  layout: LayoutProps;
  pointerEvents: PointerEventsPolicy;
  disabled: boolean;

  add(...children: HudNode[]): this;
  insert(index: number, child: HudNode): this;
  remove(child: HudNode): boolean;
  removeFromParent(): this;
  clear(): void;
  dispose(): void;

  on<K extends keyof HudNodeEventMap>(
    type: K,
    listener: (event: HudNodeEventMap[K]) => void,
    options?: HudListenerOptions,
  ): () => void;
}
```

A `HudNode` is not a Three.js `Object3D`. Most nodes are encoded into shared batches.

## Font registration

```ts
export type FontSource = URL | string | ArrayBuffer | Uint8Array | PreprocessedFontAsset;

export interface FontRegistration {
  id: string;
  source: FontSource;
  cacheKey?: string;

  family?: string;
  style?: string;
  weight?: number | string;
  stretch?: number | string;

  pixel?: {
    nativeSize: number;
    allowedMultipliers?: readonly number[];
    policy?: "crisp" | "smooth" | "auto";
  };

  backend?: {
    preferred?: readonly TextBackendId[];
    required?: TextBackendId;
  };

  fallback?: readonly string[];
  license?: FontLicenseRecord;
}

export interface FontHandle {
  readonly id: string;
  readonly state: "loading" | "ready" | "failed" | "disposed";
  readonly metadata: Readonly<ResolvedFontMetadata>;
}

export class FontRegistry {
  register(input: FontRegistration, signal?: AbortSignal): Promise<FontHandle>;
  preload(ids: readonly string[], signal?: AbortSignal): Promise<void>;
  get(id: string): FontHandle | undefined;
  unregister(id: string): boolean;
}
```

No `@font-face` or CSS registration is required. A host may self-host font files or provide bytes from its own asset pipeline.

## Text contracts

```ts
export interface TextStyle {
  font: string;
  size: number;
  color?: ColorInput;
  letterSpacing?: number;
  lineHeight?: number | "normal";
  align?: "left" | "center" | "right";
  direction?: "ltr"; // v0.1 built-in layout
  wrap?: "none" | "word" | "character";
  maxWidth?: number;
  maxLines?: number;
  overflow?: "clip" | "ellipsis" | "visible";
  outline?: TextOutlineStyle;
  shadow?: TextShadowStyle;
  backend?: TextBackendId | "auto";
  pixelPolicy?: "crisp" | "smooth" | "auto";
}

export interface GlyphPlacement {
  glyphId: number;
  cluster: number;
  x: number;
  y: number;
  advanceX: number;
  advanceY: number;
}

export interface GlyphRun {
  readonly font: FontHandle;
  readonly direction: "ltr";
  readonly glyphs: readonly GlyphPlacement[];
  readonly lines: readonly TextLineRecord[];
  readonly bounds: Readonly<RectLike>;
}
```

Concrete backends consume canonical runs. A future shaper may produce the same contract for additional scripts.

## Text backend

```ts
export interface TextBackend {
  readonly id: TextBackendId;
  readonly status: "experimental" | "ready";
  readonly capabilities: Readonly<TextBackendCapabilities>;

  attach(context: TextBackendContext): Promise<void> | void;
  evaluate(request: TextBackendRequest): TextBackendDecision;

  prepareFont(font: FontHandle): Promise<PreparedFontHandle>;
  prepareGlyphs(font: PreparedFontHandle, glyphIds: readonly number[]): Promise<void>;

  createDrawable(input: TextDrawableInput): TextDrawableHandle;
  updateDrawable(handle: TextDrawableHandle, patch: TextDrawablePatch): void;
  encode(handle: TextDrawableHandle, encoder: HudRenderCommandEncoder): void;
  releaseDrawable(handle: TextDrawableHandle): void;

  dispose(): void;
}
```

Backend classes are not required for widget APIs. Selection may be automatic only when capability/fallback policy is explicit.

## Layout

```ts
export type LayoutLength = number | "auto" | "fill";

export interface LayoutProps {
  width?: LayoutLength;
  height?: LayoutLength;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  margin?: InsetsInput;
  padding?: InsetsInput;

  absolute?: {
    anchor: AnchorPreset | readonly [number, number];
    pivot?: readonly [number, number];
    offset?: readonly [number, number];
    target?: "reference" | "visible" | "safe";
  };

  clip?: boolean;
}

export class Stack extends HudNode {
  constructor(options?: {
    direction?: "row" | "column";
    gap?: number;
    align?: "start" | "center" | "end" | "stretch";
    padding?: InsetsInput;
  });
}

export class Grid extends HudNode {
  constructor(options: {
    rows: number;
    columns: number;
    cellSize?: readonly [number, number] | "auto";
    gap?: number | readonly [number, number];
    padding?: InsetsInput;
  });
}
```

## Primitives

```ts
export class Rect extends HudNode {
  /* fill, border */
}
export class RoundedRect extends HudNode {
  /* radius, fill, border */
}
export class Line extends HudNode {
  /* start, end, width, alignment */
}
export class Image extends HudNode {
  /* texture, uv, tint, fit, filter */
}
export class NineSlice extends HudNode {
  /* texture + border insets */
}
export class Ring extends HudNode {
  /* angles, radii, segments, ticks */
}
export class Arc extends Ring {}
export class Text extends HudNode {
  /* text + TextStyle */
}
```

Textures are passed through explicit borrowed/owned handles.

## Widgets

```ts
export class Panel extends HudNode {}
export class Label extends HudNode {}
export class IconLabel extends HudNode {}
export class LinearBar extends HudNode {}
export class RadialBar extends HudNode {}
export class Gauge extends HudNode {}
export class Crosshair extends HudNode {}
export class Slot<T = unknown> extends HudNode {}
export class InventoryGrid<T = unknown> extends HudNode {}
export class Hotbar<T = unknown> extends HudNode {}
```

Widget data is controlled by the host. The package does not own gameplay inventory, health, cooldown timers, or tweens.

## Pointer input

```ts
export type PointerEventsPolicy = "auto" | "none" | "box-only" | "box-none";

export interface CanvasPointerConnection {
  disconnect(): void;
}

export function connectHudPointerEvents(
  hud: Hud,
  canvas: HTMLCanvasElement,
  options?: CanvasPointerOptions,
): CanvasPointerConnection;
```

The core also accepts normalized pointer records for tests and non-DOM hosts.

## Themes

```ts
export interface HudTheme {
  id?: string;
  colors?: Record<string, ColorInput | TokenRef>;
  typography?: Record<string, Partial<TextStyle> | TokenRef>;
  spacing?: Record<string, number | TokenRef>;
  radii?: Record<string, number | TokenRef>;
  strokes?: Record<string, StrokeStyle | TokenRef>;
  widgets?: Record<string, WidgetStyleSet>;
}
```

Themes are plain serializable data. No CSS variables are read by core.

## Diagnostics and stats

```ts
export interface HudDiagnostic {
  severity: "info" | "warning" | "error";
  code: HudDiagnosticCode;
  message: string;
  nodeId?: string;
  backendId?: string;
  details?: Readonly<Record<string, unknown>>;
}

export interface HudStats {
  frame: number;
  nodes: number;
  visibleNodes: number;
  layoutRuns: number;
  textLayoutRuns: number;
  drawCommands: number;
  batches: number;
  drawCalls: number;
  cpuBytes: number;
  gpuBytes: number | null;
  glyphsPrepared: number;
  resources: Readonly<Record<string, number>>;
}
```

Stats are bounded snapshots, not an always-on profiler history.

## Experimental API policy

An experimental subpath:

- has explicit status in declarations/docs;
- may require a narrower renderer/version profile;
- must not be auto-selected unless the user opts into experimental backends;
- can change before v1 with changelog and migration notes;
- cannot leak experimental types into the stable main entry.
