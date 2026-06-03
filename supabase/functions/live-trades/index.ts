import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory cache (per warm instance) keyed by symbol
const cache = new Map<string, { ts: number; trades: any[] }>();
const TTL_MS = 4000;

const DEFAULT_SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
  "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "LINKUSDT", "TONUSDT",
  "TRXUSDT", "DOTUSDT", "MATICUSDT", "SUIUSDT", "ARBUSDT",
];

async function fetchTrades(symbol: string, limit = 10) {
  const now = Date.now();
  const hit = cache.get(symbol);
  if (hit && now - hit.ts < TTL_MS) return hit.trades;

  const r = await fetch(
    `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=${limit}`,
    { headers: { Accept: "application/json" } }
  );
  if (!r.ok) return hit?.trades ?? [];
  const raw = await r.json() as Array<{
    id: number; price: string; qty: string; quoteQty: string; time: number; isBuyerMaker: boolean;
  }>;
  const trades = raw.map((t) => ({
    id: t.id,
    symbol: symbol.replace("USDT", ""),
    side: t.isBuyerMaker ? "sell" : "buy",
    price: parseFloat(t.price),
    amount: parseFloat(t.qty),
    value: parseFloat(t.quoteQty),
    time: t.time,
    exchange: "Binance",
  }));
  cache.set(symbol, { ts: now, trades });
  return trades;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let symbols = DEFAULT_SYMBOLS;
    let perSymbol = 5;
    try {
      const body = await req.json();
      if (Array.isArray(body?.symbols) && body.symbols.length) symbols = body.symbols;
      if (typeof body?.perSymbol === "number") perSymbol = Math.min(20, body.perSymbol);
    } catch { /* ignore */ }

    const results = await Promise.all(
      symbols.slice(0, 20).map((s) => fetchTrades(s, perSymbol).catch(() => []))
    );
    const merged = results.flat()
      .sort((a, b) => b.time - a.time)
      .slice(0, 30);

    return new Response(JSON.stringify({ trades: merged, timestamp: Date.now() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ trades: [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});