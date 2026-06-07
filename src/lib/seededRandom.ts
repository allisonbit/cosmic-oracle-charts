// ── Seeded pseudo-random generator ────────────────────────────────────────────
// Deterministic randomness so visualizations (sparklines, candle wicks, signal
// strength) stay STABLE for a given coin within a day instead of twitching on
// every React render. Same seed → same sequence.

/** FNV-1a string hash → 32-bit uint seed. */
export function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — returns a function producing floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * seededRng — convenience: build a PRNG from any string key.
 * Pass a UTC-day-scoped key (e.g. `${symbol}|${bias}|${utcDay}`) so the output
 * is stable across the day and rolls over naturally.
 */
export function seededRng(key: string): () => number {
  return mulberry32(hashSeed(key));
}

/** Current UTC date as YYYY-MM-DD — handy for day-stable seeds. */
export function utcDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
