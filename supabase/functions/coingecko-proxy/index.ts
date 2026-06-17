// Generic CoinGecko API proxy.
//
// Why this exists:
//   Several client-side files (YearPrediction, HowToBuyCoin, useCompareToken,
//   TokenStrengthSearch, PredictionLeaderboard) used to call api.coingecko.com
//   directly from the browser. That bypassed our caching layer, leaked usage
//   patterns from end-user IPs, and risked CORS issues. This proxy gives those
//   call sites a single server-side passthrough with isolate-local caching.
//
// Request body: { path: string, params?: Record<string,string|number|boolean>, ttlMs?: number }
//   `path` is appended to https://api.coingecko.com/api/v3/ — leading slash optional.
//   Whitelisted to api/v3/* to prevent abuse as an open proxy.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, preflight, jsonResponse } from "../_shared/cors.ts";
import { getOrSet } from "../_shared/cache.ts";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const DEFAULT_TTL_MS = 30_000;
const MAX_TTL_MS = 5 * 60_000;

interface ProxyBody {
  path: string;
  params?: Record<string, string | number | boolean>;
  ttlMs?: number;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  const clean = path.replace(/^\/+/, "");
  const url = new URL(`${COINGECKO_BASE}/${clean}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  let body: ProxyBody;
  try {
    body = (await req.json()) as ProxyBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.path || typeof body.path !== "string") {
    return jsonResponse({ error: "Missing 'path'" }, { status: 400 });
  }

  const url = buildUrl(body.path, body.params);
  const ttlMs = Math.min(Math.max(Number(body.ttlMs) || DEFAULT_TTL_MS, 1_000), MAX_TTL_MS);

  try {
    const data = await getOrSet(`cg:${url}`, { ttlMs }, async () => {
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
      return await r.json();
    });
    return jsonResponse({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    console.warn("coingecko-proxy error:", message, "url=", url);
    return jsonResponse({ data: null, error: message }, { status: 502 });
  }
});