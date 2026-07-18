// Renders the daily digest HTML for admin preview.
// GET  ?sample=1  → fixture data (no external fetches)
// GET  (default)  → live data via fetchDigestData
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildDigestHtml, fetchDigestData, type DigestData } from "../_shared/digest-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SAMPLE: DigestData = {
  btc:  { symbol: "btc", name: "Bitcoin",  price: 98432.15, change24h: 2.14 },
  eth:  { symbol: "eth", name: "Ethereum", price: 3421.88,  change24h: 3.42 },
  gainers: [
    { symbol: "sol",  name: "Solana",   price: 244.12, change24h: 12.4 },
    { symbol: "sui",  name: "Sui",      price: 4.87,   change24h: 9.8 },
    { symbol: "avax", name: "Avalanche",price: 47.22,  change24h: 8.1 },
    { symbol: "link", name: "Chainlink",price: 24.55,  change24h: 6.7 },
    { symbol: "ada",  name: "Cardano",  price: 1.12,   change24h: 5.3 },
  ],
  losers: [
    { symbol: "trx", name: "TRON",      price: 0.271,  change24h: -6.2 },
    { symbol: "xrp", name: "XRP",       price: 2.31,   change24h: -4.9 },
    { symbol: "dot", name: "Polkadot",  price: 8.44,   change24h: -3.8 },
    { symbol: "ltc", name: "Litecoin",  price: 112.30, change24h: -3.1 },
    { symbol: "atom",name: "Cosmos",    price: 7.02,   change24h: -2.4 },
  ],
  predictions: [
    { coin_id: "bitcoin",  symbol: "btc", timeframe: "daily",  bias: "bullish", confidence: 78 },
    { coin_id: "ethereum", symbol: "eth", timeframe: "weekly", bias: "bullish", confidence: 71 },
    { coin_id: "solana",   symbol: "sol", timeframe: "daily",  bias: "neutral", confidence: 62 },
  ],
  narrative: "Markets are risk-on today: 68 of the top 100 assets are green, led by SOL (+12.4%). Bitcoin is +2.14%.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const url = new URL(req.url);
  const sample = url.searchParams.get("sample") === "1";
  const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  let data: DigestData;
  if (sample) {
    data = SAMPLE;
  } else {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    data = await fetchDigestData(supabase);
  }

  const html = buildDigestHtml({
    ...data,
    unsubscribeUrl: "https://oraclebull.com/unsubscribe?token=preview",
    date,
  });
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
  });
});
