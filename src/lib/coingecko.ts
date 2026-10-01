/**
 * Standalone CoinGecko client — talks directly to the free public API from the
 * browser. No backend proxy, no key. Keeps the original signature: returns
 * parsed JSON on success or `null` on any error, so every existing call site
 * keeps working unchanged.
 *
 * Politeness: a localStorage cache (per-request TTL) plus a serial request
 * queue with a minimum gap between calls keeps usage well inside the free
 * tier's limits even on cold loads with many endpoints.
 */

const CG_BASE = "https://api.coingecko.com/api/v3";

export interface CoinGeckoFetchOptions {
  /** Path under /api/v3/, e.g. "simple/price" or "coins/bitcoin". Leading slash optional. */
  path: string;
  /** Query params; values are stringified. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Cache TTL in ms. Default 30s. */
  ttlMs?: number;
}

// ── localStorage cache (survives reloads, zero backend) ──────────────────────
interface CacheEntry<T> { t: number; v: T }

function cacheGet<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = localStorage.getItem(`ob-cg:${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.t > maxAgeMs) return null;
    return entry.v;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(`ob-cg:${key}`, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // Storage full/blocked — cache is best-effort only.
  }
}

// ── request queue — one call at a time, spaced ≥1s ───────────────────────────
let chain: Promise<unknown> = Promise.resolve();
let lastFetchAt = 0;

function queued<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const gap = Date.now() - lastFetchAt;
    if (gap < 1000) await new Promise(r => setTimeout(r, 1000 - gap));
    try {
      return await fn();
    } finally {
      lastFetchAt = Date.now();
    }
  });
  chain = run.catch(() => {});
  return run as Promise<T>;
}

export async function coingeckoFetch<T = unknown>(opts: CoinGeckoFetchOptions): Promise<T | null> {
  const params: Record<string, string | number | boolean> = {};
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v === undefined || v === null) continue;
      params[k] = v;
    }
  }
  const cleanPath = opts.path.replace(/^\//, "");
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  const cacheKey = `${cleanPath}?${qs}`;
  const ttl = opts.ttlMs ?? 30_000;
  const cached = cacheGet<T>(cacheKey, ttl);
  if (cached !== null) return cached;

  return queued(async () => {
    // Free-tier bursts (429) are normal on cold loads — retry inside the queue
    // slot with real backoff instead of failing the caller after one shot.
    const RETRYABLE = new Set([429, 500, 502, 503, 504]);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`${CG_BASE}/${cleanPath}${qs ? `?${qs}` : ""}`, {
          headers: { accept: "application/json" },
        });
        if (res.ok) {
          const json = (await res.json()) as T;
          cacheSet(cacheKey, json);
          return json;
        }
        if (!RETRYABLE.has(res.status) || attempt === 2) return null;
      } catch {
        if (attempt === 2) return null;
      }
      await new Promise(r => setTimeout(r, 4_000 * (attempt + 1)));
    }
    return null;
  });
}
