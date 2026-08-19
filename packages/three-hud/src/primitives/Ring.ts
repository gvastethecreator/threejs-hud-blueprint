import type { HudDiagnosticHandler } from "../contracts/diagnostics.js";
import { emitDiagnostic } from "../contracts/diagnostics.js";
import { HudError } from "../contracts/errors.js";
import { HudNode, type HudNodeOptions } from "../core/HudNode.js";

export const RING_SEGMENT_CAP = 64;
export const RING_TICK_CAP = 36;

export type RingDirection = "cw" | "ccw";

export type RingOptions = HudNodeOptions &
  Readonly<{
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    sweep?: number;
    direction?: RingDirection;
    value?: number;
    min?: number;
    max?: number;
    segments?: number;
    ticks?: number;
  }>;

export class Ring extends HudNode {
  readonly primitive = "ring" as const;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  sweep: number;
  direction: RingDirection;
  value: number;
  min: number;
  max: number;
  segments: number;
  ticks: number;

  constructor(options: RingOptions = {}) {
    const outer = options.outerRadius ?? 24;
    super({ ...options, width: options.width ?? outer * 2, height: options.height ?? outer * 2 });
    this.innerRadius = options.innerRadius ?? outer * 0.6;
    this.outerRadius = outer;
    this.startAngle = options.startAngle ?? -Math.PI / 2;
    this.sweep = options.sweep ?? Math.PI * 2;
    this.direction = options.direction ?? "cw";
    this.min = options.min ?? 0;
    this.max = options.max ?? 1;
    this.value = options.value ?? this.max;
    this.segments = options.segments ?? 1;
    this.ticks = options.ticks ?? 0;
    this.assertRadii();
  }

  progressSweep(): number {
    const span = this.max - this.min;
    const ratio = span === 0 ? 0 : (this.value - this.min) / span;
    const clamped = Math.min(1, Math.max(0, ratio));
    const signed = this.direction === "cw" ? this.sweep : -this.sweep;
    return signed * clamped;
  }

  normalizedStart(): number {
    const tau = Math.PI * 2;
    const start = this.startAngle % tau;
    return start < 0 ? start + tau : start;
  }

  capCounts(handler?: HudDiagnosticHandler): { segments: number; ticks: number } {
    let segments = this.segments;
    let ticks = this.ticks;
    if (segments > RING_SEGMENT_CAP) {
      emitDiagnostic(handler, {
        severity: "warning",
        code: "RING_SEGMENT_CAP",
        message: `Ring segment count capped at ${RING_SEGMENT_CAP}.`,
        nodeId: this.id,
        details: { requested: segments, cap: RING_SEGMENT_CAP },
      });
      segments = RING_SEGMENT_CAP;
    }
    if (ticks > RING_TICK_CAP) {
      emitDiagnostic(handler, {
        severity: "warning",
        code: "RING_TICK_CAP",
        message: `Ring tick count capped at ${RING_TICK_CAP}.`,
        nodeId: this.id,
        details: { requested: ticks, cap: RING_TICK_CAP },
      });
      ticks = RING_TICK_CAP;
    }
    this.segments = Math.max(0, segments);
    this.ticks = Math.max(0, ticks);
    return { segments: this.segments, ticks: this.ticks };
  }

  private assertRadii(): void {
    if (!Number.isFinite(this.innerRadius) || !Number.isFinite(this.outerRadius)) {
      throw new HudError("INVALID_ARGUMENT", "Ring radii must be finite.", {
        innerRadius: String(this.innerRadius),
        outerRadius: String(this.outerRadius),
      });
    }
    if (this.innerRadius < 0 || this.outerRadius <= 0) {
      throw new HudError(
        "INVALID_ARGUMENT",
        "Ring outer radius must be positive and inner radius non-negative.",
        {
          innerRadius: this.innerRadius,
          outerRadius: this.outerRadius,
        },
      );
    }
    if (this.innerRadius > this.outerRadius) {
      throw new HudError("INVALID_ARGUMENT", "Ring inner radius cannot exceed outer radius.", {
        innerRadius: this.innerRadius,
        outerRadius: this.outerRadius,
      });
    }
  }
}

export class Arc extends Ring {
  constructor(options: RingOptions = {}) {
    super({ sweep: Math.PI, ...options, innerRadius: options.innerRadius ?? 0 });
  }
}
