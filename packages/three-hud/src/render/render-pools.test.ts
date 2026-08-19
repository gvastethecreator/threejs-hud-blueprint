import { Matrix4 } from "three";
import { describe, expect, it } from "vitest";
import { HudResourcePool } from "./resourcePool.js";

const identity = new Matrix4();

describe("render-pools", () => {
  it("draws 100 primitives with one shared geometry and one material", () => {
    const pool = new HudResourcePool({ initialCapacity: 16 });
    pool.beginFrame();
    for (let index = 0; index < 100; index += 1) {
      const slot = pool.acquireSlot();
      pool.writeInstance(slot, identity, 0x33aaee);
    }
    pool.endFrame();
    const stats = pool.diagnostics();
    expect(stats.geometryCount).toBe(1);
    expect(stats.materialCount).toBe(1);
    expect(stats.instanceUsed).toBe(100);
    expect(stats.instanceCapacity).toBeGreaterThanOrEqual(100);
    expect(stats.growCount).toBeGreaterThan(0);
    expect(stats.growCount).toBeLessThanOrEqual(8);
    pool.dispose();
  });

  it("returns released slots for reuse without leaving a visible stale instance", () => {
    const pool = new HudResourcePool({ initialCapacity: 8 });
    const first = pool.acquireSlot();
    const second = pool.acquireSlot();
    pool.writeInstance(first, identity, 0xff0000);
    pool.writeInstance(second, identity, 0x00ff00);
    pool.releaseSlot(first);
    const reused = pool.acquireSlot();
    expect(reused).toBe(first);
    pool.writeInstance(reused, identity, 0x0000ff);
    expect(pool.diagnostics().instanceUsed).toBe(2);
    pool.dispose();
  });

  it("reference-counts cached materials and disposes them with the pool", () => {
    const pool = new HudResourcePool({ initialCapacity: 4 });
    const created: Array<{ dispose: () => void }> = [];
    const extra = pool.acquireMaterial("image|nearest", () => {
      const material = { dispose: () => created.push({ dispose() {} }) };
      created.push(material);
      return material as never;
    });
    pool.acquireMaterial("image|nearest", () => extra);
    expect(pool.diagnostics().materialCount).toBe(2);
    pool.releaseMaterial("image|nearest");
    expect(pool.diagnostics().materialCount).toBe(2);
    pool.releaseMaterial("image|nearest");
    expect(pool.diagnostics().materialCount).toBe(1);
    pool.dispose();
    expect(pool.diagnostics().materialCount).toBe(0);
  });

  it("does not allocate after warm-up of a fixed scene", () => {
    const pool = new HudResourcePool({ initialCapacity: 16 });
    const writeScene = (): void => {
      pool.beginFrame();
      for (let index = 0; index < 40; index += 1) {
        pool.writeInstance(pool.acquireSlot(), identity, 0xffffff);
      }
      pool.endFrame();
    };
    writeScene();
    const warmed = pool.diagnostics().allocations;
    writeScene();
    writeScene();
    expect(pool.diagnostics().allocations).toBe(warmed);
    expect(pool.diagnostics().instanceUsed).toBe(40);
    pool.dispose();
  });
});
