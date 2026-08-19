import { HUD } from "../core/HUD.js";
import { HudNode } from "../core/HudNode.js";
import type { ReadonlySize } from "../contracts/geometry.js";
import { LinearBar } from "../widgets/LinearBar.js";
import { DeterministicClock } from "./clock.js";
import { createMockRendererAdapter } from "./mocks.js";

export type HudFixture = Readonly<{
  hud: HUD;
  clock: DeterministicClock;
  adapter: ReturnType<typeof createMockRendererAdapter>;
}>;

export function createHudFixture(
  options: {
    referenceSize?: ReadonlySize;
    clock?: DeterministicClock;
    rendererKind?: "webgl" | "webgpu";
  } = {},
): HudFixture {
  const clock = options.clock ?? new DeterministicClock();
  const adapter = createMockRendererAdapter(options.rendererKind ?? "webgl");
  const hud = new HUD({
    referenceSize: options.referenceSize ?? { width: 1920, height: 1080 },
    rendererAdapter: adapter,
    clock,
  });
  return { hud, clock, adapter };
}

export function createCanonicalTreeFixture(): {
  root: HudNode;
  child: HudNode;
  bar: LinearBar;
} {
  const root = new HudNode({ id: "root", width: 200, height: 80 });
  const child = root.add(new HudNode({ id: "child", width: 40, height: 40 }));
  const bar = root.add(new LinearBar({ id: "hp", width: 120, height: 16, value: 40, label: "HP" }));
  child.setPosition(8, 8);
  bar.setPosition(56, 8);
  return { root, child, bar };
}
