// ──────────────────────────────────────────────────────────────────────────────
// polymarket — proxy + normalizer for Polymarket's public gamma API.
//
// Browse:  POST {}                  → top active markets by 24h volume
// Search:  POST { q: "bitcoin" }    → any market matching the query (public-search)
// Paging:  POST { limit, offset }
//
// We flatten Polymarket "events" into individual binary markets (each with its
// implied-probability prices), derive a theme category from the event tags, and
// return signal-ready, normalized objects. No CORS headaches (server-side fetch),
// cached 60s. Read-only, public data — informational only, not betting advice.
// ──────────────────────────────────────────────────────────────────────────────
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GAMMA = "https://gamma-api.polymarket.com";

function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") { try { const j = JSON.parse(v); return Array.isArray(j) ? j.map(String) : []; } catch { return []; } }
  return [];
}
function num(v: unknown): number { const n = typeof v === "string" ? parseFloat(v) : (v as number); return Number.isFinite(n) ? n : 0; }

const CATEGORY_RULES: { cat: string; kw: string[] }[] = [
  { cat: "Crypto", kw: ["crypto", "bitcoin", "btc", "ethereum", "eth", "solana", "memecoin", "defi", "token", "coin", "stablecoin", "altcoin"] },
  { cat: "Politics", kw: ["politic", "election", "trump", "biden", "president", "senate", "congress", "governor", "democrat", "republican", "vote", "primary", "poll"] },
  { cat: "Geopolitics", kw: ["war", "iran", "israel", "russia", "ukraine", "china", "gaza", "nato", "military", "nuclear", "geopolit", "ceasefire", "hamas"] },
  { cat: "Economy", kw: ["fed", "inflation", "interest rate", "rate", "gdp", "recession", "economy", "jobs", "cpi", "unemployment", "powell"] },
  { cat: "Sports", kw: ["nfl", "nba", "soccer", "football", "basketball", "baseball", "mlb", "ufc", "sport", "league", "cup", "match", "premier", "champion", "ligue", "serie", "liga", "tennis", "golf"] },
  { cat: "Tech", kw: ["ai", "openai", "tech", "apple", "google", "tesla", "spacex", "nvidia", "gpt", "chatgpt", "anthropic"] },
  { cat: "Culture", kw: ["celebrity", "movie", "oscar", "music", "grammy", "culture", "tv", "show", "award", "box office", "netflix", "time person"] },
];
function deriveCategory(tags: string[], title: string): string {
  const hay = (tags.join(" ") + " " + title).toLowerCase();
  for (const r of CATEGORY_RULES) if (r.kw.some((k) => hay.includes(k))) return r.cat;
  return "Other";
}

function normalizeEvent(ev: any): any[] {
  const tags: string[] = (ev?.tags || []).map((t: any) => t?.label || t?.name || (typeof t === "string" ? t : "")).filter(Boolean);
  const category = deriveCategory(tags, ev?.title || "");
  const eventSlug = ev?.slug || "";
  const out: any[] = [];
  for (const m of ev?.markets || []) {
    if (m?.closed === true || m?.active === false) continue;
    const prices = parseArr(m?.outcomePrices).map(num);
    const outcomes = parseArr(m?.outcomes);
    if (!prices.length || prices.length !== outcomes.length) continue;
    out.push({
      id: String(m?.id ?? m?.conditionId ?? `${eventSlug}-${out.length}`),
      question: m?.question || ev?.title || "Untitled market",
      eventTitle: ev?.title || "",
      slug: m?.slug || eventSlug,
      url: eventSlug ? `https://polymarket.com/event/${eventSlug}` : "https://polymarket.com",
      image: m?.image || m?.icon || ev?.image || ev?.icon || "",
      outcomes,
      outcomePrices: prices,
      volume24hr: num(m?.volume24hr),
      volume: num(m?.volumeNum ?? m?.volume),
      liquidity: num(m?.liquidityNum ?? m?.liquidity),
      spread: num(m?.spread),
      oneDayPriceChange: num(m?.oneDayPriceChange),
      lastTradePrice: num(m?.lastTradePrice),
      bestBid: num(m?.bestBid),
      bestAsk: num(m?.bestAsk),
      endDate: m?.endDate || ev?.endDate || null,
      tags,
      category,
    });
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const q = typeof body?.q === "string" ? body.q.trim() : "";
    const limit = Math.min(Math.max(Number(body?.limit) || 80, 1), 150);
    const offset = Math.max(Number(body?.offset) || 0, 0);

    let events: any[] = [];
    if (q) {
      const r = await fetch(`${GAMMA}/public-search?q=${encodeURIComponent(q)}&limit_per_type=40&events_status=active`);
      if (r.ok) { const j = await r.json(); events = j?.events || []; }
    } else {
      const r = await fetch(`${GAMMA}/events?closed=false&active=true&archived=false&order=volume24hr&ascending=false&limit=${Math.ceil(limit / 1.5)}&offset=${offset}`);
      if (r.ok) { const j = await r.json(); events = Array.isArray(j) ? j : (j?.events || j?.data || []); }
    }

    const seen = new Set<string>();
    const markets: any[] = [];
    for (const ev of events) {
      for (const m of normalizeEvent(ev)) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        markets.push(m);
      }
    }
    markets.sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0));

    const categories = Array.from(new Set(markets.map((m) => m.category)));

    return new Response(JSON.stringify({ markets: markets.slice(0, limit), count: markets.length, categories, query: q }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ markets: [], count: 0, categories: [], error: String(e) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
