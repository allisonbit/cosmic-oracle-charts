// ─────────────────────────────────────────────────────────────────────────────
// resolve-predictions
//
// Walks every entry in `predictions_cache` whose horizon has already elapsed
// (`expires_at < now()`) AND that has no matching row in `prediction_outcomes`
// yet. For each one, fetches the current price from CoinGecko and decides
// whether the directional bias was correct:
//
//   bullish  → hit if actual >= target_high
//   bearish  → hit if actual <= target_low
//   neutral  → hit if target_low <= actual <= target_high
//
// Writes the outcome to `prediction_outcomes` so the public Accuracy
// Leaderboard at /accuracy can rank coins by hit rate. Idempotent — the
// unique index on prediction_id blocks double-resolution.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PredictionRow {
  id: string;
  coin_id: string;
  symbol: string;
  timeframe: string;
  bias: string;
  confidence: number | null;
  current_price: number | null;
  prediction_data: {
    priceTargets?: {
      moderate?: { low?: number; high?: number };
      conservative?: { low?: number; high?: number };
      aggressive?: { low?: number; high?: number };
    };
  } | null;
  created_at: string;
  expires_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // 1. Pull recently-expired predictions that haven't been resolved yet.
    const { data: predictions, error: pErr } = await supabase
      .from("predictions_cache")
      .select("id, coin_id, symbol, timeframe, bias, confidence, current_price, prediction_data, created_at, expires_at")
      .lt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(200);

    if (pErr) throw pErr;
    if (!predictions || predictions.length === 0) {
      return json({ resolved: 0, skipped: 0, message: "no expired predictions" });
    }

    // 2. Skip the ones we already resolved.
    const ids = predictions.map((p) => p.id);
    const { data: existing } = await supabase
      .from("prediction_outcomes")
      .select("prediction_id")
      .in("prediction_id", ids);
    const done = new Set((existing ?? []).map((r) => r.prediction_id));
    const todo = (predictions as PredictionRow[]).filter((p) => !done.has(p.id));

    if (todo.length === 0) {
      return json({ resolved: 0, skipped: predictions.length, message: "all already resolved" });
    }

    // 3. Batch-fetch current prices from CoinGecko (one call per chunk of 50).
    const uniqueCoinIds = [...new Set(todo.map((p) => p.coin_id))];
    const priceById: Record<string, number> = {};
    for (let i = 0; i < uniqueCoinIds.length; i += 50) {
      const slice = uniqueCoinIds.slice(i, i + 50);
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${slice.join(",")}&vs_currencies=usd`;
      const res = await fetch(url);
      if (!res.ok) { await res.text(); continue; }
      const j = (await res.json()) as Record<string, { usd?: number }>;
      for (const [id, val] of Object.entries(j)) {
        if (val && typeof val.usd === "number") priceById[id] = val.usd;
      }
    }

    // 4. Build outcome rows.
    const rows = todo
      .map((p) => {
        const actual = priceById[p.coin_id];
        const entry = Number(p.current_price);
        const m = p.prediction_data?.priceTargets?.moderate;
        const low = Number(m?.low);
        const high = Number(m?.high);
        if (!actual || !entry || !Number.isFinite(low) || !Number.isFinite(high)) return null;

        let hit = false;
        if (p.bias === "bullish")      hit = actual >= high;
        else if (p.bias === "bearish") hit = actual <= low;
        else                            hit = actual >= low && actual <= high;

        return {
          prediction_id: p.id,
          coin_id: p.coin_id,
          symbol: p.symbol,
          timeframe: p.timeframe,
          bias: p.bias,
          confidence: p.confidence ?? 0,
          entry_price: entry,
          target_low: low,
          target_high: high,
          actual_price: actual,
          hit,
          predicted_at: p.created_at,
          resolved_at: new Date().toISOString(),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (rows.length === 0) {
      return json({ resolved: 0, skipped: todo.length, message: "no price data" });
    }

    // 5. Upsert into prediction_outcomes (unique on prediction_id).
    const { error: insErr } = await supabase
      .from("prediction_outcomes")
      .upsert(rows, { onConflict: "prediction_id" });
    if (insErr) throw insErr;

    return json({ resolved: rows.length, skipped: todo.length - rows.length, total_candidates: predictions.length });
  } catch (e) {
    console.error("resolve-predictions error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}