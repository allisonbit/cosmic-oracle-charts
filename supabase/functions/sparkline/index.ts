import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const cache = new Map<string, { ts: number; points: Array<{ time: string; price: number; volume: number; marketCap: number }> }>();
const TTL_MS = 90_000;

const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
  XRP: "ripple", DOGE: "dogecoin", ADA: "cardano", AVAX: "avalanche-2",
  LINK: "chainlink", TON: "the-open-network", TRX: "tron", DOT: "polkadot",
  MATIC: "matic-network", SUI: "sui", ARB: "arbitrum", OP: "optimism",
  LTC: "litecoin", BCH: "bitcoin-cash", ATOM: "cosmos", NEAR: "near",
  APT: "aptos", FIL: "filecoin", ICP: "internet-computer", HBAR: "hedera-hashgraph",
  ETC: "ethereum-classic", XLM: "stellar", VET: "vechain", ALGO: "algorand",
  AAVE: "aave", UNI: "uniswap", MKR: "maker", FET: "fetch-ai", RNDR: "render-token",
  PEPE: "pepe", SHIB: "shiba-inu", TAO: "bittensor",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: any = {};
  try { body = await req.json(); } catch { /* */ }
  const symbol = String(body?.symbol || "BTC").toUpperCase();
  const days = Math.min(30, Math.max(1, Number(body?.days || 1)));
  // Callers that compute technical indicators (RSI/EMA-50/MACD) need more points;
  // tiny sparklines keep the default. Bounded to keep payloads sane.
  const maxPoints = Math.min(365, Math.max(12, Number(body?.maxPoints || 48)));
  const id = body?.id || SYMBOL_TO_ID[symbol];

  if (!id) {
    return new Response(JSON.stringify({ points: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const key = `${id}:${days}:${maxPoints}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.ts < TTL_MS) {
    return new Response(JSON.stringify({ points: hit.points, cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? "" : "hourly"}`
    );
    if (!r.ok) throw new Error("coingecko " + r.status);
    const data = await r.json() as {
      prices: Array<[number, number]>;
      total_volumes?: Array<[number, number]>;
      market_caps?: Array<[number, number]>;
    };
    const step = data.prices.length > maxPoints ? Math.ceil(data.prices.length / maxPoints) : 1;
    const keep = (_: unknown, i: number) => i % step === 0;
    const prices = step > 1 ? data.prices.filter(keep) : data.prices;
    // Sample volumes / market caps with the SAME stride so they stay aligned to prices.
    const volumes = (data.total_volumes && step > 1 ? data.total_volumes.filter(keep) : data.total_volumes) ?? [];
    const caps = (data.market_caps && step > 1 ? data.market_caps.filter(keep) : data.market_caps) ?? [];
    const points = prices.map(([t, p], i) => ({
      time: new Date(t).toISOString(),
      price: p,
      volume: volumes[i]?.[1] ?? 0,
      marketCap: caps[i]?.[1] ?? 0,
    }));
    cache.set(key, { ts: now, points });
    return new Response(JSON.stringify({ points }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ points: hit?.points ?? [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});