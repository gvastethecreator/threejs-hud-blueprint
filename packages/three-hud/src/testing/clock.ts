import type { HudClock } from "../core/HUD.js";

export type { HudClock };

export class DeterministicClock implements HudClock {
  private currentMs: number;
  private lastTickMs: number;

  constructor(start = 0) {
    this.currentMs = start;
    this.lastTickMs = start;
  }

  nowMs(): number {
    return this.currentMs;
  }

  advance(ms: number): number {
    if (!Number.isFinite(ms) || ms < 0) throw new RangeError("advance ms must be finite and >= 0.");
    this.currentMs += ms;
    return this.currentMs;
  }

  tick(ms: number): number {
    this.advance(ms);
    const delta = (this.currentMs - this.lastTickMs) / 1000;
    this.lastTickMs = this.currentMs;
    return delta;
  }

  seconds(): number {
    return this.currentMs / 1000;
  }
}
