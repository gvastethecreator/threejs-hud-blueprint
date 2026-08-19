import { HudLayer } from "../core/HudLayer.js";
import { HudImage } from "../primitives/Image.js";
import { Line } from "../primitives/Line.js";
import { NineSlice } from "../primitives/NineSlice.js";
import { Rect } from "../primitives/Rect.js";
import { RoundedRect } from "../primitives/RoundedRect.js";
import { Arc, Ring } from "../primitives/Ring.js";
import { encodeOverlayQueue } from "./encodeOverlayQueue.js";
import { HudResourcePool } from "./resourcePool.js";
import type { OverlayRendererProfile } from "./overlayProfile.js";

export type PrimitiveScenarioKind = "positive" | "edge";

export type PrimitiveScenario = Readonly<{
  id: string;
  primitive: string;
  kind: PrimitiveScenarioKind;
  profile: OverlayRendererProfile;
  commands: number;
  batches: number;
  drawCalls: number;
}>;

export type PrimitiveBudget = Readonly<{
  maxDrawCalls: number;
  maxBatches: number;
  maxGeometries: number;
  maxMaterials: number;
  maxAllocations: number;
}>;

export const PRIMITIVE_SHOWCASE_BUDGET: PrimitiveBudget = Object.freeze({
  maxDrawCalls: 16,
  maxBatches: 16,
  maxGeometries: 1,
  maxMaterials: 2,
  maxAllocations: 16,
});

export function runPrimitiveScenarios(
  profile: OverlayRendererProfile = "webgl",
): PrimitiveScenario[] {
  return [
    scenario("rect-positive", "Rect", "positive", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new Rect({ width: 40, height: 20, fill: 0x33aaff }));
      return layer;
    }),
    scenario("rect-edge-zero", "Rect", "edge", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new Rect({ width: 0, height: 20 }));
      return layer;
    }),
    scenario("rounded-positive", "RoundedRect", "positive", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new RoundedRect({ width: 48, height: 24, radius: 6 }));
      return layer;
    }),
    scenario("rounded-edge-stretch", "RoundedRect", "edge", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      const node = layer.add(new RoundedRect({ width: 48, height: 24, radius: 6 }));
      node.scaleX = 2;
      node.scaleY = 0.5;
      node.diagnoseNonUniformStretch();
      return layer;
    }),
    scenario("line-positive", "Line", "positive", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new Line({ x1: 0, y1: 0, x2: 40, y2: 0, strokeWidth: 1, pixelSnap: true }));
      return layer;
    }),
    scenario("line-edge-zero", "Line", "edge", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new Line({ x1: 5, y1: 5, x2: 5, y2: 5, strokeWidth: 1 }));
      return layer;
    }),
    scenario("image-positive", "Image", "positive", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(
        new HudImage({
          width: 16,
          height: 16,
          texture: { id: "icon", ownership: "borrowed", filter: "nearest", ready: true },
        }),
      );
      return layer;
    }),
    scenario("image-edge-unread", "Image", "edge", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(
        new HudImage({
          width: 16,
          height: 16,
          texture: { id: "late", ownership: "owned", filter: "linear", ready: false },
        }),
      );
      return layer;
    }),
    scenario("nineslice-positive", "NineSlice", "positive", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(
        new NineSlice({
          width: 80,
          height: 48,
          insets: { top: 6, right: 6, bottom: 6, left: 6 },
          texture: { id: "skin", ownership: "borrowed", filter: "linear", ready: true },
        }),
      );
      return layer;
    }),
    scenario("nineslice-edge-clip", "NineSlice", "edge", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      const node = layer.add(
        new NineSlice({
          width: 80,
          height: 48,
          insets: { top: 6, right: 6, bottom: 6, left: 6 },
          texture: { id: "skin", ownership: "borrowed", filter: "linear", ready: true },
        }),
      );
      node.setClip({ x: 200, y: 200, width: 4, height: 4 });
      return layer;
    }),
    scenario("ring-positive", "Ring", "positive", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new Ring({ outerRadius: 16, innerRadius: 10, value: 0.6 }));
      return layer;
    }),
    scenario("ring-edge-full", "Ring", "edge", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new Ring({ outerRadius: 16, innerRadius: 10, value: 1, sweep: Math.PI * 2 }));
      return layer;
    }),
    scenario("arc-positive", "Arc", "positive", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new Arc({ outerRadius: 14, value: 0.5 }));
      return layer;
    }),
    scenario("arc-edge-zero", "Arc", "edge", profile, () => {
      const layer = new HudLayer({ id: "s", referenceSize: { width: 200, height: 200 } });
      layer.add(new Arc({ outerRadius: 14, value: 0 }));
      return layer;
    }),
  ];
}

export function measureShowcase(profile: OverlayRendererProfile = "webgl") {
  const pool = new HudResourcePool({ initialCapacity: 8 });
  const layer = new HudLayer({ id: "showcase", referenceSize: { width: 400, height: 240 } });
  layer.add(new Rect({ width: 40, height: 16 })).setPosition(8, 8);
  layer.add(new RoundedRect({ width: 40, height: 16, radius: 4 })).setPosition(56, 8);
  layer.add(new Line({ x1: 8, y1: 40, x2: 80, y2: 40, strokeWidth: 1, pixelSnap: true }));
  layer.add(new Ring({ outerRadius: 12, innerRadius: 7, value: 0.7 })).setPosition(100, 8);
  layer.add(new Arc({ outerRadius: 12, value: 0.4 })).setPosition(140, 8);
  layer
    .add(
      new HudImage({
        width: 16,
        height: 16,
        texture: { id: "icon", ownership: "borrowed", filter: "nearest", ready: true },
      }),
    )
    .setPosition(180, 8);
  layer
    .add(
      new NineSlice({
        width: 64,
        height: 32,
        insets: { top: 4, right: 4, bottom: 4, left: 4 },
        texture: { id: "panel", ownership: "borrowed", filter: "linear", ready: true },
      }),
    )
    .setPosition(8, 56);
  const snapshot = encodeOverlayQueue([layer], profile).snapshot();
  for (let index = 0; index < snapshot.commands.length; index += 1) pool.acquireSlot();
  pool.endFrame();
  const diagnostics = pool.diagnostics();
  pool.dispose();
  return {
    profile,
    drawCalls: snapshot.batches.length,
    batches: snapshot.batches.length,
    commands: snapshot.commands.length,
    geometries: diagnostics.geometryCount,
    materials: diagnostics.materialCount,
    instanceBytes: diagnostics.instanceCapacity * 16 * 4,
    allocations: diagnostics.allocations,
    topology: snapshot.topology,
  };
}

export function budgetDelta(
  measured: ReturnType<typeof measureShowcase>,
  budget: PrimitiveBudget = PRIMITIVE_SHOWCASE_BUDGET,
): string[] {
  const delta: string[] = [];
  if (measured.drawCalls > budget.maxDrawCalls) {
    delta.push(`drawCalls ${measured.drawCalls} > ${budget.maxDrawCalls}`);
  }
  if (measured.batches > budget.maxBatches)
    delta.push(`batches ${measured.batches} > ${budget.maxBatches}`);
  if (measured.geometries > budget.maxGeometries) {
    delta.push(`geometries ${measured.geometries} > ${budget.maxGeometries}`);
  }
  if (measured.materials > budget.maxMaterials)
    delta.push(`materials ${measured.materials} > ${budget.maxMaterials}`);
  if (measured.allocations > budget.maxAllocations) {
    delta.push(`allocations ${measured.allocations} > ${budget.maxAllocations}`);
  }
  return delta;
}

function scenario(
  id: string,
  primitive: string,
  kind: PrimitiveScenarioKind,
  profile: OverlayRendererProfile,
  build: () => HudLayer,
): PrimitiveScenario {
  const snapshot = encodeOverlayQueue([build()], profile).snapshot();
  return Object.freeze({
    id,
    primitive,
    kind,
    profile,
    commands: snapshot.commands.length,
    batches: snapshot.batches.length,
    drawCalls: snapshot.batches.length,
  });
}
