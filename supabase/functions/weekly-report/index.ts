// Generates a "State of Crypto" snapshot each Monday and persists it into
// public.weekly_reports so /reports/:slug can render a citable, permanent URL.
//
// Pulls: CoinGecko top-30 markets + global stats + Fear & Greed index.
// Writes: one row keyed by ISO week slug (idempotent via UPSERT).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isoWeekSlug(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-w${String(week).padStart(2, "0")}`;
}

async function safeFetch(url: string): Promise<any | null> {
  try {
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const now = new Date();
  const slug = isoWeekSlug(now);

  const [markets, global, fg] = await Promise.all([
    safeFetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&price_change_percentage=24h,7d"),
    safeFetch("https://api.coingecko.com/api/v3/global"),
    safeFetch("https://api.alternative.me/fng/?limit=1"),
  ]);

  const coins = Array.isArray(markets) ? markets.map((c: any) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: c.image,
    price: c.current_price,
    market_cap: c.market_cap,
    change_24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0,
    change_7d: c.price_change_percentage_7d_in_currency ?? 0,
  })) : [];

  const gainers = [...coins].sort((a, b) => b.change_7d - a.change_7d).slice(0, 10);
  const losers = [...coins].sort((a, b) => a.change_7d - b.change_7d).slice(0, 10);

  const bullish = coins.filter((c) => c.change_7d > 0).length;
  const breadth = coins.length ? bullish / coins.length : 0.5;
  const mood = breadth > 0.65 ? "bullish" : breadth < 0.35 ? "bearish" : "mixed";

  const fgIndex = Number(fg?.data?.[0]?.value ?? 50);
  const totalMcap = global?.data?.total_market_cap?.usd ?? 0;
  const totalVol = global?.data?.total_volume?.usd ?? 0;
  const mcapChange = global?.data?.market_cap_change_percentage_24h_usd ?? 0;
  const btcDom = global?.data?.market_cap_percentage?.btc ?? 0;

  // Prediction accuracy summary for the past week
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const { data: outcomes } = await supabase
    .from("prediction_outcomes")
    .select("hit, timeframe")
    .gte("resolved_at", weekAgo);
  const totalResolved = outcomes?.length ?? 0;
  const totalHits = (outcomes ?? []).filter((o: any) => o.hit).length;
  const hitRate = totalResolved ? totalHits / totalResolved : 0;

  const content = {
    slug,
    generated_at: now.toISOString(),
    market: {
      total_market_cap: totalMcap,
      total_volume_24h: totalVol,
      market_cap_change_24h: mcapChange,
      btc_dominance: btcDom,
      fear_greed: fgIndex,
      mood,
      breadth,
      bullish_count: bullish,
      total_tracked: coins.length,
    },
    gainers,
    losers,
    accuracy: {
      resolved: totalResolved,
      hits: totalHits,
      hit_rate: hitRate,
    },
  };

  const { error } = await supabase
    .from("weekly_reports")
    .upsert(
      { slug, week_iso: slug, content, published_at: now.toISOString() },
      { onConflict: "slug" },
    );

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Send weekly-report email to all digest subscribers (best-effort).
  let emailed = 0;
  try {
    const { data: subs } = await supabase
      .from("digest_subscribers")
      .select("id, email")
      .order("created_at", { ascending: true });

    const btc = coins.find((c: any) => c.id === "bitcoin");
    const eth = coins.find((c: any) => c.id === "ethereum");
    const topMovers = [...coins]
      .sort((a, b) => b.change_7d - a.change_7d)
      .slice(0, 8)
      .map((c: any) => ({ symbol: c.symbol.toUpperCase(), change: c.change_7d }));

    const emailData = {
      weekOf: slug,
      btcChange: btc?.change_7d,
      ethChange: eth?.change_7d,
      topMovers,
      summary: content.market?.mood ? `Market mood this week: ${content.market.mood}.` : undefined,
    };

    for (const sub of subs ?? []) {
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "weekly-report",
            recipientEmail: sub.email,
            idempotencyKey: `weekly-report-${slug}-${sub.id}`,
            templateData: emailData,
          },
        });
        emailed++;
      } catch (e) {
        console.error("weekly-report email failed for", sub.email, e);
      }
    }
  } catch (e) {
    console.error("weekly-report email batch error", e);
  }

  return new Response(JSON.stringify({ ok: true, slug, coins: coins.length, emailed }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});