// Public JSON feed of resolved prediction outcomes, aggregated per coin.
// Backs /accuracy.json — meant for partners, researchers, and aggregators
// to consume Oracle Bull's hit-rate track record programmatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const { data, error } = await supabase
    .from("prediction_outcomes")
    .select("coin_id, symbol, timeframe, hit, confidence, resolved_at")
    .order("resolved_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  type Bucket = { coin_id: string; symbol: string; total: number; hits: number; sum_confidence: number; by_timeframe: Record<string, { total: number; hits: number }> };
  const byCoin = new Map<string, Bucket>();
  for (const r of data ?? []) {
    const b = byCoin.get(r.coin_id) ?? { coin_id: r.coin_id, symbol: r.symbol, total: 0, hits: 0, sum_confidence: 0, by_timeframe: {} };
    b.total += 1;
    if (r.hit) b.hits += 1;
    b.sum_confidence += r.confidence || 0;
    const tf = (b.by_timeframe[r.timeframe] = b.by_timeframe[r.timeframe] ?? { total: 0, hits: 0 });
    tf.total += 1;
    if (r.hit) tf.hits += 1;
    byCoin.set(r.coin_id, b);
  }

  const coins = [...byCoin.values()]
    .map((b) => ({
      coin_id: b.coin_id,
      symbol: b.symbol,
      total: b.total,
      hits: b.hits,
      hit_rate: b.total ? b.hits / b.total : 0,
      avg_confidence: b.total ? b.sum_confidence / b.total : 0,
      by_timeframe: Object.fromEntries(
        Object.entries(b.by_timeframe).map(([k, v]) => [k, { total: v.total, hits: v.hits, hit_rate: v.total ? v.hits / v.total : 0 }]),
      ),
    }))
    .sort((a, b) => b.hit_rate - a.hit_rate || b.total - a.total);

  const totalResolved = coins.reduce((s, c) => s + c.total, 0);
  const totalHits = coins.reduce((s, c) => s + c.hits, 0);

  const body = {
    source: "Oracle Bull",
    url: "https://oraclebull.com/accuracy",
    generated_at: new Date().toISOString(),
    summary: {
      total_predictions_resolved: totalResolved,
      total_correct: totalHits,
      overall_hit_rate: totalResolved ? totalHits / totalResolved : 0,
      coins_tracked: coins.length,
    },
    coins,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      ...corsHeaders,
    },
  });
});