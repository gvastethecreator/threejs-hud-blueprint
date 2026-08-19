import { describe, expect, it } from "vitest";
import { FontRegistry, type ParsedFontFace } from "./fontRegistry.js";
import type { FontRegistration } from "./contracts.js";

function bytes(id: string, cacheKey = "shared"): FontRegistration {
  return { id, source: new Uint8Array([1, 2, 3]), cacheKey, family: "fixture" };
}

describe("font-registry", () => {
  it("deduplicates concurrent loads of the same cache key", async () => {
    let loads = 0;
    let release: ((face: ParsedFontFace) => void) | undefined;
    const registry = new FontRegistry({
      load: () =>
        new Promise((resolve) => {
          loads += 1;
          release = resolve;
        }),
    });
    const first = registry.register(bytes("a"));
    const second = registry.register(bytes("b"));
    expect(loads).toBe(1);
    release?.({ cacheKey: "shared", owned: true, unitsPerEm: 1000 });
    const [a, b] = await Promise.all([first, second]);
    expect(a.state).toBe("ready");
    expect(b.state).toBe("ready");
    expect(loads).toBe(1);
    expect(registry.events().some((event) => event.type === "dedupe")).toBe(true);
    registry.dispose();
  });

  it("abort removes the handle and does not publish a partial font", async () => {
    const controller = new AbortController();
    const registry = new FontRegistry({
      load: (_registration, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () =>
            reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
          );
        }),
    });
    const pending = registry.register(bytes("gone"), controller.signal);
    controller.abort();
    await expect(pending).rejects.toThrow("aborted");
    expect(registry.get("gone")).toBeUndefined();
    expect(registry.snapshot()).toEqual([]);
    expect(registry.events().some((event) => event.type === "abort")).toBe(true);
    registry.dispose();
  });

  it("ignores stale completion after unregister and dispose", async () => {
    let finish: ((face: ParsedFontFace) => void) | undefined;
    const registry = new FontRegistry({
      load: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    });
    const pending = registry.register(bytes("late"));
    expect(registry.unregister("late")).toBe(true);
    finish?.({ cacheKey: "shared", owned: true, unitsPerEm: 1000 });
    const result = await pending;
    expect(result.state).toBe("disposed");
    expect(registry.get("late")).toBeUndefined();
    expect(registry.events().some((event) => event.type === "stale")).toBe(true);

    let finishDispose: ((face: ParsedFontFace) => void) | undefined;
    const disposed = new FontRegistry({
      load: () =>
        new Promise((resolve) => {
          finishDispose = resolve;
        }),
    });
    const late = disposed.register(bytes("x", "other"));
    disposed.dispose();
    finishDispose?.({ cacheKey: "other", owned: true, unitsPerEm: 1000 });
    const published = await late;
    expect(published.state).toBe("disposed");
    expect(disposed.get("x")).toBeUndefined();
    expect(disposed.snapshot()).toEqual([]);
  });

  it("releases a shared face only after the last handle is gone", async () => {
    const registry = new FontRegistry();
    await registry.register(bytes("one"));
    await registry.register(bytes("two"));
    expect(registry.get("one")?.state).toBe("ready");
    registry.unregister("one");
    expect(registry.get("two")?.state).toBe("ready");
    registry.unregister("two");
    expect(registry.snapshot()).toEqual([]);
    const frozen = registry.snapshot();
    expect(Object.isFrozen(frozen)).toBe(true);
    registry.dispose();
  });
});
