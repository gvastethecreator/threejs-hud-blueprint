import type { ReadonlyPoint, ReadonlyRect } from "../contracts/geometry.js";
import { HudError } from "../contracts/errors.js";
import type { HudBlendMode } from "../contracts/geometry.js";
import {
  DIRTY_STAGE_ORDER,
  DirtyFlag,
  dirtyFlagNames,
  type InvalidationCounters,
} from "./DirtyFlags.js";

let nextNodeSequence = 1;

export type LayoutVisibility = "participate" | "collapse";
export type PointerEventsPolicy = "auto" | "none" | "box-only" | "box-none";

export type HudNodeOptions = Readonly<{
  id?: string;
  name?: string;
  userKey?: string;
  debugLabel?: string;
  visible?: boolean;
  opacity?: number;
  zIndex?: number;
  width?: number;
  height?: number;
  fill?: number;
  layoutVisibility?: LayoutVisibility;
  pointerEvents?: PointerEventsPolicy;
  disabled?: boolean;
  debugOverlay?: boolean;
}>;

export class HudNode {
  readonly id: string;
  name: string;
  userKey: string | undefined;
  debugLabel: string;
  parent: HudNode | null = null;
  readonly children: HudNode[] = [];
  position: ReadonlyPoint = { x: 0, y: 0 };
  bounds: ReadonlyRect = { x: 0, y: 0, width: 0, height: 0 };
  size: Readonly<{ width: number; height: number }> = { width: 0, height: 0 };
  fill = 0x000000;
  scaleX = 1;
  scaleY = 1;
  rotation = 0;
  pivot: ReadonlyPoint = { x: 0, y: 0 };
  visible: boolean;
  opacity: number;
  zIndex: number;
  clip: ReadonlyRect | null = null;
  blend: HudBlendMode = "premultiplied";
  layoutVisibility: LayoutVisibility = "participate";
  pointerEvents: PointerEventsPolicy = "auto";
  disabled = false;
  debugOverlay = false;
  insertionSeq = 0;
  renderSeq = -1;
  fontSize = 16;
  dirtyFlags: DirtyFlag = DirtyFlag.All;
  disposed = false;
  private nextChildSeq = 0;
  private recompute = {
    transform: 0,
    layout: 0,
    style: 0,
    text: 0,
    geometry: 0,
    children: 0,
    hitTest: 0,
    queue: 0,
    coalescedWrites: 0,
  };
  private readonly reasonLog: string[] = [];

  constructor(options: HudNodeOptions = {}) {
    const sequence = nextNodeSequence++;
    this.id = options.id ?? `hud-node-${sequence}`;
    this.name = options.name ?? this.id;
    this.userKey = options.userKey;
    this.debugLabel = options.debugLabel ?? this.name;
    this.visible = options.visible ?? true;
    this.opacity = clamp01(options.opacity ?? 1);
    this.zIndex = options.zIndex ?? 0;
    this.size = Object.freeze({ width: options.width ?? 0, height: options.height ?? 0 });
    this.fill = options.fill ?? 0x000000;
    this.bounds = { x: 0, y: 0, width: this.size.width, height: this.size.height };
    this.layoutVisibility = options.layoutVisibility ?? "participate";
    this.pointerEvents = options.pointerEvents ?? "auto";
    this.disabled = options.disabled ?? false;
    this.debugOverlay = options.debugOverlay ?? false;
  }

  add<T extends HudNode>(child: T): T {
    return this.insert(this.children.length, child);
  }

  insert<T extends HudNode>(index: number, child: T): T {
    this.assertAlive();
    child.assertAlive();
    if (Object.is(child, this) || this.isDescendantOf(child)) {
      throw new TypeError("A HUD node cannot be parented to itself or one of its descendants.");
    }
    if (child.parent === this) {
      const current = this.children.indexOf(child);
      if (current === index || current === index - 1) return child;
      this.children.splice(current, 1);
      this.children.splice(index > current ? index - 1 : index, 0, child);
      this.markDirty(DirtyFlag.Children | DirtyFlag.Layout);
      return child;
    }
    child.parent?.remove(child);
    child.parent = this;
    child.insertionSeq = this.nextChildSeq++;
    const clipped = Math.max(0, Math.min(index, this.children.length));
    this.children.splice(clipped, 0, child);
    this.markDirty(DirtyFlag.Children | DirtyFlag.Layout | DirtyFlag.HitTest | DirtyFlag.Queue);
    return child;
  }

  remove<T extends HudNode>(child: T): T | null {
    this.assertAlive();
    const index = this.children.indexOf(child);
    if (index < 0) return null;
    this.children.splice(index, 1);
    child.parent = null;
    this.markDirty(DirtyFlag.Children | DirtyFlag.Layout);
    return child;
  }

  setPosition(x: number, y: number): void {
    this.assertAlive();
    if (!Number.isFinite(x) || !Number.isFinite(y))
      throw new RangeError("Position must be finite.");
    if (this.position.x === x && this.position.y === y) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.position = { x, y };
    this.markDirty(DirtyFlag.Transform);
  }

  setSize(
    width: number,
    height: number,
    dirty: DirtyFlag = DirtyFlag.Layout | DirtyFlag.Geometry,
  ): void {
    this.assertAlive();
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) {
      throw new RangeError("Size must be finite and non-negative.");
    }
    if (this.size.width === width && this.size.height === height) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.size = Object.freeze({ width, height });
    this.bounds = { ...this.bounds, width, height };
    this.markDirty(dirty);
  }

  setFontSize(fontSize: number): void {
    this.assertAlive();
    if (!Number.isFinite(fontSize) || fontSize <= 0)
      throw new RangeError("fontSize must be a finite positive number.");
    if (this.fontSize === fontSize) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.fontSize = fontSize;
    this.markDirty(DirtyFlag.Text | DirtyFlag.Layout | DirtyFlag.Geometry | DirtyFlag.HitTest);
  }

  effectiveVisible(): boolean {
    for (let current: HudNode | null = this; current; current = current.parent) {
      if (!current.visible) return false;
    }
    return true;
  }

  effectiveOpacity(): number {
    let opacity = 1;
    for (let current: HudNode | null = this; current; current = current.parent)
      opacity *= current.opacity;
    return opacity;
  }

  worldBounds(): ReadonlyRect {
    const width = this.size.width * this.scaleX;
    const height = this.size.height * this.scaleY;
    let x = this.position.x - this.pivot.x * this.scaleX;
    let y = this.position.y - this.pivot.y * this.scaleY;
    for (let current = this.parent; current; current = current.parent) {
      x += current.position.x;
      y += current.position.y;
    }
    if (this.rotation === 0) return { x, y, width, height };
    const cx = x + this.pivot.x * this.scaleX;
    const cy = y + this.pivot.y * this.scaleY;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const corners = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const corner of corners) {
      const dx = corner.x - cx;
      const dy = corner.y - cy;
      const rx = cx + dx * cos - dy * sin;
      const ry = cy + dx * sin + dy * cos;
      minX = Math.min(minX, rx);
      minY = Math.min(minY, ry);
      maxX = Math.max(maxX, rx);
      maxY = Math.max(maxY, ry);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  setClip(clip: ReadonlyRect | null): void {
    this.assertAlive();
    this.clip = clip ? Object.freeze({ ...clip }) : null;
    this.markDirty(DirtyFlag.HitTest | DirtyFlag.Queue);
  }

  setBlend(blend: HudBlendMode): void {
    this.assertAlive();
    if (blend !== "premultiplied" && blend !== "alpha" && blend !== "additive") {
      throw new HudError("INVALID_ARGUMENT", "Unsupported blend mode.", { blend: String(blend) });
    }
    if (this.blend === blend) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.blend = blend;
    this.markDirty(DirtyFlag.Style | DirtyFlag.Queue);
  }

  setLayoutVisibility(visibility: LayoutVisibility): void {
    this.assertAlive();
    if (this.layoutVisibility === visibility) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.layoutVisibility = visibility;
    this.markDirty(DirtyFlag.Layout | DirtyFlag.HitTest | DirtyFlag.Queue);
  }

  setPointerEvents(policy: PointerEventsPolicy): void {
    this.assertAlive();
    if (this.pointerEvents === policy) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.pointerEvents = policy;
    this.markDirty(DirtyFlag.HitTest | DirtyFlag.Style);
  }

  setDisabled(disabled: boolean): void {
    this.assertAlive();
    if (this.disabled === disabled) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.disabled = disabled;
    this.markDirty(DirtyFlag.Style | DirtyFlag.HitTest);
  }

  setOpacity(opacity: number): void {
    this.assertAlive();
    const next = clamp01(opacity);
    if (next === this.opacity) {
      this.markDirty(DirtyFlag.None);
      return;
    }
    this.opacity = next;
    this.markDirty(DirtyFlag.Style);
  }

  markDirty(flags: DirtyFlag): void {
    if (flags === DirtyFlag.None) {
      this.recompute.coalescedWrites += 1;
      return;
    }
    const added = flags & ~this.dirtyFlags;
    if (added === 0) {
      this.recompute.coalescedWrites += 1;
      return;
    }
    this.dirtyFlags |= flags;
    this.pushReasons(added);
    if (added & DirtyFlag.Transform) this.recompute.transform += 1;
    if (added & DirtyFlag.Layout) this.recompute.layout += 1;
    if (added & DirtyFlag.Style) this.recompute.style += 1;
    if (added & DirtyFlag.Text) this.recompute.text += 1;
    if (added & DirtyFlag.Geometry) this.recompute.geometry += 1;
    if (added & DirtyFlag.Children) this.recompute.children += 1;
    if (added & DirtyFlag.HitTest) this.recompute.hitTest += 1;
    if (added & DirtyFlag.Queue) this.recompute.queue += 1;
    if (this.parent && (added & (DirtyFlag.Layout | DirtyFlag.Children)) !== 0) {
      this.parent.markDirty(DirtyFlag.Layout);
    }
  }

  clearDirty(flags: DirtyFlag = DirtyFlag.All): void {
    this.dirtyFlags &= ~flags;
  }

  invalidationCounters(): InvalidationCounters {
    return Object.freeze({ ...this.recompute });
  }

  dirtyReasons(): readonly string[] {
    return this.reasonLog.slice();
  }

  processInvalidation(): void {
    for (const stage of DIRTY_STAGE_ORDER) {
      if ((this.dirtyFlags & stage) === 0) continue;
      this.applyInvalidationStage(stage);
      this.clearDirty(stage);
    }
    for (const child of this.children) child.processInvalidation();
  }

  /** Runs before a dirty bit is cleared. If this throws, the flag stays set. */
  protected applyInvalidationStage(_stage: DirtyFlag): void {}

  private pushReasons(flags: DirtyFlag): void {
    for (const name of dirtyFlagNames(flags)) {
      this.reasonLog.push(name);
      if (this.reasonLog.length > 8) this.reasonLog.shift();
    }
  }

  dispose(): void {
    if (this.disposed) return;
    for (const child of [...this.children]) child.dispose();
    this.children.length = 0;
    this.parent?.remove(this);
    this.parent = null;
    this.disposed = true;
    this.dirtyFlags = DirtyFlag.None;
  }

  protected assertAlive(): void {
    if (this.disposed) throw new Error(`HUD node ${this.id} is disposed.`);
  }

  private isDescendantOf(candidate: HudNode): boolean {
    for (let current: HudNode | null = this.parent; current; current = current.parent) {
      if (current === candidate) return true;
    }
    return false;
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError("Opacity must be finite.");
  return Math.min(1, Math.max(0, value));
}
