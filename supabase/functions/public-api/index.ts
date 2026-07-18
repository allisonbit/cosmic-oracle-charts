// Free public REST API for Oracle Bull data.
//
//   GET /public-api/price/:coin
//   GET /public-api/trending
//   GET /public-api/prediction/:coin/:timeframe
//
// Routed via /api/v1/* on the site edge (see index.html/hosting rewrite).
// Simple in-memory IP rate limit: 60 req/min per IP. Warm-instance only —
// good enough for polite abuse control, not a security boundary.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; reset: number }>();

function checkRate(ip: string): { ok: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    const reset = now + WINDOW_MS;
    hits.set(ip, { count: 1, reset });
    return { ok: true, remaining: RATE_LIMIT - 1, reset };
  }
  entry.count++;
  return { ok: entry.count <= RATE_LIMIT, remaining: Math.max(0, RATE_LIMIT - entry.count), reset: entry.reset };
}

// Simple per-URL response cache (warm-instance only).
const respCache = new Map<string, { body: string; status: number; expires: number }>();
function cacheGet(key: string) {
  const e = respCache.get(key);
  if (!e || e.expires < Date.now()) return null;
  return e;
}
function cacheSet(key: string, body: string, status: number, ttlMs: number) {
  respCache.set(key, { body, status, expires: Date.now() + ttlMs });
  if (respCache.size > 500) respCache.delete(respCache.keys().next().value);
}

function json(body: unknown, init: ResponseInit = {}, ttlSec = 30) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${ttlSec}, stale-while-revalidate=${ttlSec * 4}`,
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, { status: 405 });

  const ip = req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "anon";
  const rate = checkRate(ip);
  const rateHeaders: Record<string, string> = {
    "X-RateLimit-Limit": String(RATE_LIMIT),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rate.reset / 1000)),
  };
  if (!rate.ok) {
    const retryAfter = Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000));
    return json(
      { error: "rate_limited", limit: RATE_LIMIT, window: "1m", retry_after_seconds: retryAfter },
      { status: 429, headers: { ...rateHeaders, "Retry-After": String(retryAfter) } },
      0,
    );
  }

  const url = new URL(req.url);
  // Strip both edge-function prefix and any /api/v1 prefix the edge rewrites.
  const path = url.pathname
    .replace(/^\/public-api/, "")
    .replace(/^\/api\/v1/, "")
    .replace(/^\/+/, "");
  const parts = path.split("/").filter(Boolean);

  // Serve from cache if fresh.
  const cacheKey = `${path}?${url.searchParams.toString()}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    return new Response(cached.body, {
      status: cached.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
        "X-Cache": "HIT",
        ...corsHeaders,
        ...rateHeaders,
      },
    });
  }

  const wrap = (r: Response, ttlMs: number) => {
    r.headers.set("X-Cache", "MISS");
    for (const [k, v] of Object.entries(rateHeaders)) r.headers.set(k, v);
    r.clone().text().then((t) => cacheSet(cacheKey, t, r.status, ttlMs)).catch(() => {});
    return r;
  };

  try {
    // /
    if (parts.length === 0) {
      return wrap(json({
        name: "Oracle Bull Public API",
        version: "v1",
        endpoints: [
          "GET /api/v1/price/:coin",
          "GET /api/v1/trending",
          "GET /api/v1/prediction/:coin/:timeframe",
        ],
        rate_limit: `${RATE_LIMIT} req/min`,
        docs: "https://oraclebull.com/api-docs",
      }, {}, 300), 300_000);
    }

    // /price/:coin
    if (parts[0] === "price" && parts[1]) {
      const coin = encodeURIComponent(parts[1].toLowerCase());
      const data = await fetchJson<any>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_last_updated_at=true`,
      );
      if (!data || !data[coin]) return json({ error: "coin_not_found", coin }, { status: 404 });
      return wrap(json({
        coin,
        price_usd: data[coin].usd,
        change_24h_pct: data[coin].usd_24h_change,
        market_cap_usd: data[coin].usd_market_cap,
        updated_at: new Date((data[coin].last_updated_at ?? 0) * 1000).toISOString(),
      }, {}, 30), 30_000);
    }

    // /trending
    if (parts[0] === "trending") {
      const data = await fetchJson<any[]>(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&price_change_percentage=24h",
      );
      if (!data) return json({ error: "upstream_unavailable" }, { status: 502 });
      const sorted = [...data].sort((a, b) => Math.abs(b.price_change_percentage_24h ?? 0) - Math.abs(a.price_change_percentage_24h ?? 0));
      return wrap(json({
        updated_at: new Date().toISOString(),
        gainers: sorted.filter((c) => (c.price_change_percentage_24h ?? 0) > 0).slice(0, 10).map((c) => ({
          id: c.id, symbol: c.symbol, name: c.name, price: c.current_price, change_24h_pct: c.price_change_percentage_24h,
        })),
        losers: sorted.filter((c) => (c.price_change_percentage_24h ?? 0) < 0).slice(0, 10).map((c) => ({
          id: c.id, symbol: c.symbol, name: c.name, price: c.current_price, change_24h_pct: c.price_change_percentage_24h,
        })),
      }, {}, 60), 60_000);
    }

    // /prediction/:coin/:timeframe
    if (parts[0] === "prediction" && parts[1] && parts[2]) {
      const coin = parts[1].toLowerCase();
      const timeframe = parts[2].toLowerCase();
      if (!["daily", "weekly", "monthly"].includes(timeframe)) {
        return json({ error: "invalid_timeframe", allowed: ["daily", "weekly", "monthly"] }, { status: 400 });
      }
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data } = await supabase
        .from("predictions_cache")
        .select("coin_id, symbol, timeframe, bias, confidence, target_low, target_high, rationale, expires_at, updated_at")
        .eq("coin_id", coin)
        .eq("timeframe", timeframe)
        .gt("expires_at", new Date().toISOString())
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return json({ error: "no_active_prediction", coin, timeframe }, { status: 404 });
      return wrap(json({ ...data, source: "oraclebull.com" }, {}, 120), 120_000);
    }

    return json({ error: "not_found", path }, { status: 404 });
  } catch (err) {
    console.error("public-api error", err);
    return json({ error: "internal_error" }, { status: 500 });
  }
});