// Isolate-scoped cache with in-flight request deduplication.
//
// Why this exists:
//   Edge functions previously used `let cachedData = null; let cacheTimestamp = 0`
//   at module scope. Two bugs with that pattern:
//     1. Concurrent requests during a cache miss all bypass the cache and
//        fan out to the upstream API simultaneously (thundering herd).
//     2. No keying — only one entity could be cached per isolate.
//   This module keeps the same "best-effort isolate-local cache" semantics
//   (no behavior regression for the cache-hit path) but adds:
//     - Per-key entries
//     - Promise-based single-flight: concurrent misses share one upstream call.

type Entry<T> = { value: T; ts: number };

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export interface CacheOptions {
  /** Time-to-live in ms. */
  ttlMs: number;
}

/**
 * Get a cached value or compute it. Concurrent calls with the same key share
 * the same in-flight promise so the upstream `compute` runs at most once.
 */
export async function getOrSet<T>(
  key: string,
  opts: CacheOptions,
  compute: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && now - hit.ts < opts.ttlMs) return hit.value;

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const p = (async () => {
    try {
      const value = await compute();
      store.set(key, { value, ts: Date.now() });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

/** Force-set a cache entry (used when callers compute outside getOrSet). */
export function setCache<T>(key: string, value: T): void {
  store.set(key, { value, ts: Date.now() });
}

/** Read without computing. Returns undefined if missing or expired. */
export function peekCache<T>(key: string, ttlMs: number): T | undefined {
  const hit = store.get(key) as Entry<T> | undefined;
  if (!hit) return undefined;
  if (Date.now() - hit.ts >= ttlMs) return undefined;
  return hit.value;
}