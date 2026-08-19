import { layoutCacheKey, type NormalizedTextStyle } from "./textStyle.js";

export type Measurement = Readonly<{
  width: number;
  height: number;
}>;

export type MeasurementCacheStats = Readonly<{
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}>;

export class MeasurementCache {
  private readonly maxSize: number;
  private readonly entries = new Map<string, Measurement>();
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(maxSize = 256) {
    this.maxSize = Math.max(1, maxSize);
  }

  stats(): MeasurementCacheStats {
    return Object.freeze({
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      size: this.entries.size,
    });
  }

  get(style: NormalizedTextStyle, text: string): Measurement | undefined {
    const key = layoutCacheKey(style, text);
    const hit = this.entries.get(key);
    if (hit) {
      this.hits += 1;
      this.entries.delete(key);
      this.entries.set(key, hit);
      return hit;
    }
    this.misses += 1;
    return undefined;
  }

  set(style: NormalizedTextStyle, text: string, measurement: Measurement): Measurement {
    const key = layoutCacheKey(style, text);
    if (this.entries.has(key)) this.entries.delete(key);
    else if (this.entries.size >= this.maxSize) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) {
        this.entries.delete(oldest);
        this.evictions += 1;
      }
    }
    const frozen = Object.freeze({ ...measurement });
    this.entries.set(key, frozen);
    return frozen;
  }

  measure(style: NormalizedTextStyle, text: string, compute: () => Measurement): Measurement {
    const cached = this.get(style, text);
    if (cached) return cached;
    return this.set(style, text, compute());
  }
}
