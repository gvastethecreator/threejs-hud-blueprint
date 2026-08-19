export class DeterministicClock {
  nowMs: number;
  constructor(start = 0) {
    this.nowMs = start;
  }
  advance(ms: number): number {
    this.nowMs += ms;
    return this.nowMs;
  }
  seconds(): number {
    return this.nowMs / 1000;
  }
}
