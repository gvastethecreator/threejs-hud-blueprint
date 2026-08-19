import type { HUD } from "../core/HUD.js";
import type { HudLayer } from "../core/HudLayer.js";
import type { HudNode } from "../core/HudNode.js";
import { DirtyFlag } from "../core/DirtyFlags.js";
import { hitTest } from "./hitTest.js";
import { mapPointerToLayer, pickLayerAt } from "./pointerMap.js";
import type { ReadonlyPoint, ReadonlyRect } from "../contracts/geometry.js";

export type HudPointerType = "move" | "down" | "up" | "cancel";
export type HudPointerPhase = "capture" | "target" | "bubble";

export type HudPointerInput = Readonly<{
  pointerId: number;
  type: HudPointerType;
  clientX: number;
  clientY: number;
  button: number;
  buttons: number;
  pointerType: string;
  time: number;
}>;

export type HudPointerEvent = Readonly<{
  type:
    | "pointerenter"
    | "pointerleave"
    | "pointermove"
    | "pointerdown"
    | "pointerup"
    | "pointercancel"
    | "click";
  pointerId: number;
  pointerType: string;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  canvasX: number;
  canvasY: number;
  viewportX: number;
  viewportY: number;
  logicalX: number;
  logicalY: number;
  target: HudNode;
  currentTarget: HudNode;
  phase: HudPointerPhase;
  layer: HudLayer;
  time: number;
  canceled: boolean;
  disabled: boolean;
  stopPropagation: () => void;
}>;

export type PointerDispatchOptions = Readonly<{
  canvasOrigin?: ReadonlyPoint;
  viewport?: ReadonlyRect;
  dpr?: number;
  clickMoveThreshold?: number;
}>;

export type PointerListener = (event: HudPointerEvent) => void;

type PointerTrack = {
  hover: HudNode | null;
  pressed: HudNode | null;
  capture: HudNode | null;
  downLogical: { x: number; y: number } | null;
  downTime: number;
  canceled: boolean;
};

export class HudPointerController {
  readonly listeners = new Map<HudNode, Set<PointerListener>>();
  hovered: HudNode | null = null;
  pressed: HudNode | null = null;
  private readonly tracks = new Map<number, PointerTrack>();
  private lastLogical: { x: number; y: number } | null = null;
  private lastClient: { x: number; y: number; options: PointerDispatchOptions } | null = null;

  constructor(private readonly hud: HUD) {}

  addListener(node: HudNode, listener: PointerListener): void {
    const set = this.listeners.get(node) ?? new Set();
    set.add(listener);
    this.listeners.set(node, set);
  }

  removeListener(node: HudNode, listener: PointerListener): void {
    this.listeners.get(node)?.delete(listener);
  }

  dispatch(input: HudPointerInput, options: PointerDispatchOptions = {}): HudPointerEvent[] {
    const probe = [...this.hud.layers].reverse().find((item) => item.enabled) ?? this.hud.layers[0];
    if (!probe) return [];
    const pointerInput = {
      clientX: input.clientX,
      clientY: input.clientY,
      canvasOrigin: options.canvasOrigin ?? { x: 0, y: 0 },
      ...(options.viewport ? { viewport: options.viewport } : {}),
      ...(options.dpr !== undefined ? { dpr: options.dpr } : {}),
    };
    const probeMap = mapPointerToLayer(this.hud, probe, pointerInput);
    const layer = pickLayerAt(this.hud, probeMap.logical.y) ?? probe;
    const mapped = layer === probe ? probeMap : mapPointerToLayer(this.hud, layer, pointerInput);
    const track = this.tracks.get(input.pointerId) ?? {
      hover: null,
      pressed: null,
      capture: null,
      downLogical: null,
      downTime: 0,
      canceled: false,
    };
    this.tracks.set(input.pointerId, track);
    const target =
      track.capture && (input.type === "move" || input.type === "up" || input.type === "cancel")
        ? track.capture
        : hitTest(layer, mapped.logical.x, mapped.logical.y);
    const events: HudPointerEvent[] = [];
    let stopped = false;
    const emit = (
      type: HudPointerEvent["type"],
      currentTarget: HudNode,
      phase: HudPointerPhase,
      hit: HudNode,
      canceled = track.canceled,
    ): HudPointerEvent => {
      const event: HudPointerEvent = {
        type,
        pointerId: input.pointerId,
        pointerType: input.pointerType,
        button: input.button,
        buttons: input.buttons,
        clientX: input.clientX,
        clientY: input.clientY,
        canvasX: mapped.canvas.x,
        canvasY: mapped.canvas.y,
        viewportX: mapped.viewport.x,
        viewportY: mapped.viewport.y,
        logicalX: mapped.logical.x,
        logicalY: mapped.logical.y,
        target: hit,
        currentTarget,
        phase,
        layer,
        time: input.time,
        canceled,
        disabled: hit.disabled,
        stopPropagation() {
          stopped = true;
        },
      };
      events.push(event);
      this.listeners.get(currentTarget)?.forEach((listener) => listener(event));
      return event;
    };

    const path = (node: HudNode | null): HudNode[] => {
      const chain: HudNode[] = [];
      for (let current: HudNode | null = node; current; current = current.parent)
        chain.push(current);
      return chain;
    };

    const dispatchPath = (
      type: HudPointerEvent["type"],
      hit: HudNode,
      stopAt?: HudNode,
    ): boolean => {
      const ancestors = path(hit);
      for (let index = ancestors.length - 1; index >= 0; index -= 1) {
        const current = ancestors[index];
        if (!current || current === stopAt) continue;
        emit(type, current, "capture", hit);
        if (stopped) return true;
      }
      emit(type, hit, "target", hit);
      if (stopped) return true;
      for (const current of ancestors.slice(1)) {
        if (current === stopAt) break;
        emit(type, current, "bubble", hit);
        if (stopped) return true;
      }
      return stopped;
    };

    if (input.type === "move" || input.type === "down") {
      if (track.hover !== target) {
        if (track.hover) emit("pointerleave", track.hover, "target", track.hover);
        if (target) emit("pointerenter", target, "target", target);
        track.hover = target;
        this.hovered = target;
        target?.markDirty(DirtyFlag.Style);
      }
    }

    if (input.type === "down" && target) {
      track.pressed = target;
      track.capture = null;
      track.downLogical = { x: mapped.logical.x, y: mapped.logical.y };
      track.downTime = input.time;
      track.canceled = false;
      this.pressed = target;
      dispatchPath("pointerdown", target);
    } else if (input.type === "move" && target) {
      dispatchPath("pointermove", target);
    } else if (input.type === "up") {
      const hit = target ?? track.pressed;
      if (hit) dispatchPath("pointerup", hit);
      const threshold = options.clickMoveThreshold ?? 6;
      const moved = track.downLogical
        ? Math.hypot(mapped.logical.x - track.downLogical.x, mapped.logical.y - track.downLogical.y)
        : Infinity;
      if (hit && track.pressed === hit && !track.canceled && moved <= threshold) {
        dispatchPath("click", hit);
      }
      track.pressed = null;
      track.capture = null;
      this.pressed = null;
      this.tracks.delete(input.pointerId);
    } else if (input.type === "cancel") {
      const hit = track.capture ?? track.pressed ?? target;
      if (hit) dispatchPath("pointercancel", hit);
      track.canceled = true;
      track.pressed = null;
      track.capture = null;
      this.pressed = null;
      this.tracks.delete(input.pointerId);
    }

    this.lastLogical = { x: mapped.logical.x, y: mapped.logical.y };
    this.lastClient = { x: input.clientX, y: input.clientY, options };
    return events;
  }

  capture(pointerId: number, node: HudNode): void {
    const track = this.tracks.get(pointerId);
    if (track) track.capture = node;
  }

  release(pointerId: number): void {
    const track = this.tracks.get(pointerId);
    if (track) track.capture = null;
  }

  recomputeHover(options: PointerDispatchOptions = {}): HudPointerEvent[] {
    if (!this.lastClient) return [];
    return this.dispatch(
      {
        pointerId: 1,
        type: "move",
        clientX: this.lastClient.x,
        clientY: this.lastClient.y,
        button: 0,
        buttons: 0,
        pointerType: "mouse",
        time: 0,
      },
      { ...this.lastClient.options, ...options },
    );
  }

  cancelNode(node: HudNode): HudPointerEvent[] {
    const events: HudPointerEvent[] = [];
    for (const [pointerId, track] of this.tracks) {
      if (track.capture !== node && track.pressed !== node && track.hover !== node) continue;
      events.push(
        ...this.dispatch({
          pointerId,
          type: "cancel",
          clientX: 0,
          clientY: 0,
          button: 0,
          buttons: 0,
          pointerType: "mouse",
          time: 0,
        }),
      );
    }
    return events;
  }
}
