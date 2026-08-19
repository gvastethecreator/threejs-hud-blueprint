import type { HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { emitDiagnostic } from "../contracts/diagnostics.js";
import { HudError } from "../contracts/errors.js";
import type { ReadonlySize } from "../contracts/geometry.js";
import { assertFinitePositiveSize } from "../contracts/geometry.js";
import type { HudFrameInfo, HudRendererAdapter } from "../render/contracts.js";
import {
  HudPointerController,
  type HudPointerInput,
  type PointerDispatchOptions,
} from "../input/dispatcher.js";
import { HudLayer, type HudLayerOptions } from "./HudLayer.js";
import { snapshotHud, type HudSnapshot } from "./snapshot.js";

export type HudOptions = Readonly<{
  referenceSize: ReadonlySize;
  rendererAdapter?: HudRendererAdapter;
  onDiagnostic?: HudDiagnosticHandler;
}>;

export type HudLifecycleState = "created" | "initializing" | "ready" | "suspended" | "disposed";

export class HUD {
  readonly referenceSize: ReadonlySize;
  readonly layers: HudLayer[] = [];
  state: HudLifecycleState = "created";
  frame = 0;
  elapsedSeconds = 0;
  epoch = 0;
  readonly pointer: HudPointerController;
  private readonly rendererAdapter: HudRendererAdapter | undefined;
  private readonly onDiagnostic: HudDiagnosticHandler | undefined;
  private layerSeq = 0;

  constructor(options: HudOptions) {
    assertFinitePositiveSize(options.referenceSize, "referenceSize");
    this.referenceSize = Object.freeze({ ...options.referenceSize });
    this.rendererAdapter = options.rendererAdapter;
    this.onDiagnostic = options.onDiagnostic;
    this.pointer = new HudPointerController(this);
  }

  reportDiagnostic(diagnostic: Parameters<HudDiagnosticHandler>[0]): void {
    if (this.state === "disposed") return;
    emitDiagnostic(this.onDiagnostic, diagnostic);
  }

  createLayer(
    options: Omit<HudLayerOptions, "referenceSize"> & { referenceSize?: ReadonlySize } = {},
  ): HudLayer {
    this.assertNotDisposed();
    if (options.id !== undefined && this.layers.some((existing) => existing.id === options.id)) {
      throw new HudError("INVALID_ARGUMENT", "Layer IDs must be unique within a HUD.", {
        id: options.id,
      });
    }
    const layer = new HudLayer({
      ...options,
      referenceSize: options.referenceSize ?? this.referenceSize,
    });
    if (layer.owner && layer.owner !== this) {
      throw new HudError("INVALID_STATE", "Layer is already owned by another HUD.", {
        id: layer.id,
      });
    }
    layer.owner = this;
    layer.insertionSeq = this.layerSeq++;
    this.layers.push(layer);
    this.sortLayers();
    return layer;
  }

  removeLayer(id: string, options: { disposeContent?: boolean } = {}): HudLayer | null {
    this.assertNotDisposed();
    const index = this.layers.findIndex((layer) => layer.id === id);
    if (index < 0) return null;
    const [layer] = this.layers.splice(index, 1);
    if (!layer) return null;
    layer.owner = null;
    if (options.disposeContent === true) layer.dispose();
    return layer;
  }

  setLayerOrder(id: string, order: number): void {
    const layer = this.layers.find((item) => item.id === id);
    if (!layer) throw new HudError("INVALID_ARGUMENT", "Unknown layer.", { id });
    layer.order = order;
    this.sortLayers();
  }

  private sortLayers(): void {
    this.layers.sort(
      (a, b) => a.order - b.order || a.insertionSeq - b.insertionSeq || a.id.localeCompare(b.id),
    );
  }

  async initialize(): Promise<void> {
    this.assertState("created");
    this.state = "initializing";
    this.epoch += 1;
    const epoch = this.epoch;
    try {
      await this.rendererAdapter?.initialize();
      if (this.epoch !== epoch) return;
      this.state = "ready";
    } catch (error) {
      if (this.epoch === epoch) {
        this.rendererAdapter?.dispose();
        this.state = "created";
      }
      throw error;
    }
  }

  update(deltaSeconds: number): HudFrameInfo {
    this.assertState("ready");
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0)
      throw new RangeError("deltaSeconds must be finite and non-negative.");
    this.frame += 1;
    this.elapsedSeconds += deltaSeconds;
    for (const layer of this.layers) {
      if (layer.enabled) layer.processInvalidation();
    }
    return { deltaSeconds, elapsedSeconds: this.elapsedSeconds, frame: this.frame };
  }

  render(frame: HudFrameInfo): void {
    this.assertState("ready");
    this.rendererAdapter?.render(this.layers, frame);
  }

  dispatchPointer(
    input: HudPointerInput,
    options: PointerDispatchOptions = {},
  ): ReturnType<HudPointerController["dispatch"]> {
    return this.pointer.dispatch(input, options);
  }

  snapshot(): HudSnapshot {
    return snapshotHud(this);
  }

  resize(): void {
    this.assertNotDisposed();
    this.rendererAdapter?.resize();
  }

  suspend(): void {
    this.assertState("ready");
    this.rendererAdapter?.suspend?.();
    this.state = "suspended";
  }

  resume(): void {
    this.assertState("suspended");
    this.rendererAdapter?.resume?.();
    this.state = "ready";
  }

  dispose(): void {
    if (this.state === "disposed") return;
    this.epoch += 1;
    for (const layer of [...this.layers]) layer.dispose();
    this.layers.length = 0;
    this.rendererAdapter?.dispose();
    this.state = "disposed";
  }

  private assertState(expected: HudLifecycleState): void {
    if (this.state !== expected) {
      throw new HudError(
        "INVALID_STATE",
        `HUD must be ${expected}; current state is ${this.state}.`,
        {
          expected,
          state: this.state,
        },
      );
    }
  }

  private assertNotDisposed(): void {
    if (this.state === "disposed")
      throw new HudError("INVALID_STATE", "HUD is disposed.", { state: this.state });
  }
}
