import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const cache = new Map<string, { ts: number; points: Array<{ time: string; price: number }> }>();
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
  const id = body?.id || SYMBOL_TO_ID[symbol];

  if (!id) {
    return new Response(JSON.stringify({ points: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const key = `${id}:${days}`;
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
    const data = await r.json() as { prices: Array<[number, number]> };
    const slice = data.prices.length > 48
      ? data.prices.filter((_, i) => i % Math.ceil(data.prices.length / 48) === 0)
      : data.prices;
    const points = slice.map(([t, p]) => ({
      time: new Date(t).toISOString(),
      price: p,
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