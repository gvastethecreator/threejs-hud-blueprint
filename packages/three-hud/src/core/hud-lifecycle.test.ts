import { describe, expect, it } from "vitest";
import { HudError } from "../contracts/errors.js";
import { HUD } from "./HUD.js";
import type { HudRendererAdapter } from "../render/contracts.js";

function adapter(
  hooks: Partial<HudRendererAdapter> = {},
): HudRendererAdapter & { disposed: number } {
  const state = { disposed: 0 };
  return {
    id: "test",
    initialize: hooks.initialize ?? (() => undefined),
    resize: hooks.resize ?? (() => undefined),
    render: hooks.render ?? (() => undefined),
    dispose() {
      state.disposed += 1;
      hooks.dispose?.();
    },
    get disposed() {
      return state.disposed;
    },
  };
}

describe("hud-lifecycle", () => {
  it("rejects render before readiness with INVALID_STATE", () => {
    const hud = new HUD({ referenceSize: { width: 10, height: 10 } });
    expect(() => hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 0 })).toThrow(HudError);
    try {
      hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 0 });
    } catch (error) {
      expect((error as HudError).code).toBe("INVALID_STATE");
    }
  });

  it("dispose is idempotent and does not double-destroy the adapter", async () => {
    const host = adapter();
    const hud = new HUD({ referenceSize: { width: 10, height: 10 }, rendererAdapter: host });
    await hud.initialize();
    hud.dispose();
    hud.dispose();
    expect(host.disposed).toBe(1);
    expect(hud.state).toBe("disposed");
  });

  it("drops diagnostics after dispose and ignores superseded initialize", async () => {
    const received: string[] = [];
    let finishInit: (() => void) | undefined;
    const host = adapter({
      initialize: () =>
        new Promise<void>((resolve) => {
          finishInit = resolve;
        }),
    });
    const hud = new HUD({
      referenceSize: { width: 10, height: 10 },
      rendererAdapter: host,
      onDiagnostic: (diagnostic) => received.push(diagnostic.code),
    });
    const pending = hud.initialize();
    hud.dispose();
    hud.reportDiagnostic({ severity: "info", code: "LATE", message: "late" });
    finishInit?.();
    await pending;
    expect(hud.state).toBe("disposed");
    expect(received).toEqual([]);
  });

  it("suspend keeps resources but blocks update and render until resume", async () => {
    const hud = new HUD({ referenceSize: { width: 10, height: 10 } });
    await hud.initialize();
    const layer = hud.createLayer({ id: "main" });
    hud.suspend();
    expect(hud.state).toBe("suspended");
    expect(() => hud.update(0.016)).toThrow(HudError);
    expect(() => hud.render({ deltaSeconds: 0, elapsedSeconds: 0, frame: 1 })).toThrow(HudError);
    expect(layer.disposed).toBe(false);
    hud.resume();
    hud.update(0.016);
    expect(hud.frame).toBe(1);
    hud.dispose();
  });

  it("failed initialize releases the adapter and returns to created", async () => {
    const host = adapter({
      initialize: () => {
        throw new Error("gpu");
      },
    });
    const hud = new HUD({ referenceSize: { width: 10, height: 10 }, rendererAdapter: host });
    await expect(hud.initialize()).rejects.toThrow("gpu");
    expect(hud.state).toBe("created");
    expect(host.disposed).toBe(1);
  });
});
