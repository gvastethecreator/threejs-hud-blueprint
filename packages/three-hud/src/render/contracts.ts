import type { HudLayer } from "../core/HudLayer.js";

export type HudFrameInfo = Readonly<{
  deltaSeconds: number;
  elapsedSeconds: number;
  frame: number;
}>;

export interface HudRendererAdapter {
  readonly id: string;
  initialize(): void | Promise<void>;
  resize(): void;
  render(layers: readonly HudLayer[], frame: HudFrameInfo): void;
  suspend?(): void;
  resume?(): void;
  dispose(): void;
}
