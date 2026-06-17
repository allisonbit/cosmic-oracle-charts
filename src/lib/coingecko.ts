/**
 * Client-side helper for the `coingecko-proxy` edge function.
 *
 * Why: direct browser calls to api.coingecko.com bypass our cache, leak
 * end-user IPs to the upstream, and have no rate-limit protection. Use this
 * helper instead of `fetch("https://api.coingecko.com/...")`.
 */
import { invokeFunction } from "@/integrations/supabase/functions";

export interface CoinGeckoFetchOptions {
  /** Path under /api/v3/, e.g. "simple/price" or "coins/bitcoin". Leading slash optional. */
  path: string;
  /** Query params; values are stringified. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Edge-side cache TTL in ms. Default 30s, max 5min. */
  ttlMs?: number;
}

/**
 * Fetch from CoinGecko via the server-side proxy. Returns parsed JSON on
 * success or `null` on any error (mirrors the previous fail-soft behavior of
 * direct `fetch(...).then(r => r.json())` call sites with try/catch).
 */
export async function coingeckoFetch<T = unknown>(opts: CoinGeckoFetchOptions): Promise<T | null> {
  const params: Record<string, string | number | boolean> = {};
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v === undefined || v === null) continue;
      params[k] = v;
    }
  }
  try {
    const { data, error } = await invokeFunction("coingecko-proxy", {
      body: { path: opts.path, params, ttlMs: opts.ttlMs },
    });
    if (error) return null;
    const payload = data as { data?: T | null; error?: string } | null;
    if (!payload || payload.error) return null;
    return (payload.data ?? null) as T | null;
  } catch {
    return null;
  }
}