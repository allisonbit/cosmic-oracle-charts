import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const cache: Record<string, { ts: number; data: any }> = {};
const TTL_MS = 60_000;

// Deribit public API. Currencies: BTC, ETH, SOL (SOL recently supported).
async function fetchAsset(asset: string) {
  const cur = asset.toUpperCase();
  // Get all instruments (options) and last trades summary
  const [tradesRes, summaryRes] = await Promise.all([
    fetch(`https://www.deribit.com/api/v2/public/get_last_trades_by_currency?currency=${cur}&kind=option&count=20`),
    fetch(`https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=${cur}&kind=option`),
  ]);
  if (!tradesRes.ok || !summaryRes.ok) throw new Error("deribit " + tradesRes.status);
  const trades = (await tradesRes.json())?.result?.trades ?? [];
  const summary = (await summaryRes.json())?.result ?? [];

  // Compute put/call ratio from open interest
  let callOI = 0, putOI = 0;
  for (const s of summary) {
    const oi = Number(s.open_interest ?? 0);
    if (typeof s.instrument_name !== "string") continue;
    if (s.instrument_name.endsWith("-C")) callOI += oi;
    else if (s.instrument_name.endsWith("-P")) putOI += oi;
  }
  const putCallRatio = callOI > 0 ? putOI / callOI : 0;

  // Max pain approximation: strike with greatest combined OI imbalance among near-term expiry
  // Pick the nearest expiry from instrument name (e.g., BTC-26JAN24-95000-C)
  let nearestExpiry: string | null = null;
  let nearestTs = Infinity;
  for (const s of summary) {
    const parts = (s.instrument_name as string).split("-");
    if (parts.length < 4) continue;
    const expiry = parts[1];
    const ts = Date.parse(`${expiry.slice(0, 2)} ${expiry.slice(2, 5)} 20${expiry.slice(5)}`);
    if (!isNaN(ts) && ts > Date.now() && ts < nearestTs) { nearestTs = ts; nearestExpiry = expiry; }
  }
  const strikeMap = new Map<number, number>();
  for (const s of summary) {
    const parts = (s.instrument_name as string).split("-");
    if (parts.length < 4 || parts[1] !== nearestExpiry) continue;
    const strike = Number(parts[2]);
    strikeMap.set(strike, (strikeMap.get(strike) ?? 0) + Number(s.open_interest ?? 0));
  }
  let maxPainStrike = 0, maxOI = 0;
  for (const [strike, oi] of strikeMap) {
    if (oi > maxOI) { maxOI = oi; maxPainStrike = strike; }
  }

  // Format recent trades
  const formatted = trades.slice(0, 8).map((t: any) => {
    const parts = (t.instrument_name as string).split("-");
    const expiry = parts[1] ?? "";
    const strike = parts[2] ?? "";
    const isCall = parts[3] === "C";
    return {
      type: isCall ? "call" : "put",
      asset: cur,
      strike: `$${Number(strike).toLocaleString()}`,
      expiry,
      size: `${t.amount} contracts`,
      premium: `${t.direction === "buy" ? "+" : "-"}$${Math.round(t.price * t.amount * (t.index_price ?? 1)).toLocaleString()}`,
      direction: t.direction,
    };
  });

  return {
    trades: formatted,
    putCallRatio: Number(putCallRatio.toFixed(2)),
    maxPain: maxPainStrike ? `$${maxPainStrike.toLocaleString()}` : "—",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const url = new URL(req.url);
  const asset = (url.searchParams.get("asset") ?? "BTC").toUpperCase();
  const now = Date.now();
  if (cache[asset] && now - cache[asset].ts < TTL_MS) {
    return new Response(JSON.stringify({ ...cache[asset].data, cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const data = await fetchAsset(asset);
    cache[asset] = { ts: now, data };
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ trades: [], putCallRatio: 0, maxPain: "—", error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});