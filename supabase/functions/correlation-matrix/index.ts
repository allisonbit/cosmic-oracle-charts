import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASSETS: Array<{ symbol: string; id: string }> = [
  { symbol: "BTC", id: "bitcoin" },
  { symbol: "ETH", id: "ethereum" },
  { symbol: "SOL", id: "solana" },
  { symbol: "XRP", id: "ripple" },
  { symbol: "BNB", id: "binancecoin" },
  { symbol: "ADA", id: "cardano" },
];

let cache: { ts: number; matrix: Record<string, Record<string, number>>; symbols: string[] } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 min

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 3) return 0;
  const ma = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const mb = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    num += x * y; da += x * x; db += y * y;
  }
  const den = Math.sqrt(da * db);
  return den === 0 ? 0 : num / den;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const now = Date.now();
  if (cache && now - cache.ts < TTL_MS) {
    return new Response(JSON.stringify({ ...cache, cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const series: Record<string, number[]> = {};
    await Promise.all(ASSETS.map(async ({ symbol, id }) => {
      const r = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`);
      if (!r.ok) { series[symbol] = []; return; }
      const j = await r.json();
      const prices: number[] = (j.prices ?? []).map((p: [number, number]) => p[1]);
      const returns: number[] = [];
      for (let i = 1; i < prices.length; i++) returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      series[symbol] = returns;
    }));
    const symbols = ASSETS.map(a => a.symbol);
    const matrix: Record<string, Record<string, number>> = {};
    for (const a of symbols) {
      matrix[a] = {};
      for (const b of symbols) {
        matrix[a][b] = a === b ? 1 : Number(pearson(series[a], series[b]).toFixed(2));
      }
    }
    cache = { ts: now, matrix, symbols };
    return new Response(JSON.stringify({ matrix, symbols }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ matrix: cache?.matrix ?? {}, symbols: cache?.symbols ?? [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});