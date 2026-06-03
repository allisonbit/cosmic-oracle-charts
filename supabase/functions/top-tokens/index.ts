import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map local chain id -> CoinGecko `category` (or `asset_platform`)
const CHAIN_CATEGORY: Record<string, string> = {
  ethereum: "ethereum-ecosystem",
  solana: "solana-ecosystem",
  bsc: "binance-smart-chain",
  polygon: "polygon-ecosystem",
  arbitrum: "arbitrum-ecosystem",
  optimism: "optimism-ecosystem",
  avalanche: "avalanche-ecosystem",
  base: "base-ecosystem",
  fantom: "fantom-ecosystem",
  cronos: "cronos-ecosystem",
  near: "near-protocol-ecosystem",
  sui: "sui-ecosystem",
  aptos: "aptos-ecosystem",
  ton: "the-open-network-ton-ecosystem",
  cosmos: "cosmos-ecosystem",
  polkadot: "polkadot-ecosystem",
  tron: "tron-ecosystem",
  cardano: "cardano-ecosystem",
};

// Asset platform id (used for contract addresses)
const ASSET_PLATFORM: Record<string, string> = {
  ethereum: "ethereum", bsc: "binance-smart-chain", polygon: "polygon-pos",
  arbitrum: "arbitrum-one", optimism: "optimistic-ethereum",
  avalanche: "avalanche", fantom: "fantom", base: "base", solana: "solana",
  cronos: "cronos", near: "near-protocol", sui: "sui", aptos: "aptos",
  ton: "the-open-network", tron: "tron",
};

const cache = new Map<string, { ts: number; tokens: any[] }>();
const TTL_MS = 120_000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let chain = "ethereum";
  let limit = 25;
  try {
    const body = await req.json();
    if (body?.chain) chain = String(body.chain);
    if (body?.limit) limit = Math.min(50, Math.max(5, Number(body.limit)));
  } catch { /* */ }

  const cat = CHAIN_CATEGORY[chain];
  const key = `${chain}:${limit}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.ts < TTL_MS) {
    return new Response(JSON.stringify({ tokens: hit.tokens, cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const params = new URLSearchParams({
      vs_currency: "usd",
      order: "volume_desc",
      per_page: String(limit),
      page: "1",
      sparkline: "false",
      price_change_percentage: "1h,24h,7d",
    });
    if (cat) params.set("category", cat);
    const r = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${params}`);
    if (!r.ok) throw new Error("coingecko " + r.status);
    const raw = await r.json() as any[];
    const platform = ASSET_PLATFORM[chain];

    const tokens = raw.map((t, i) => ({
      rank: i + 1,
      id: t.id,
      symbol: (t.symbol || "").toUpperCase(),
      name: t.name,
      image: t.image,
      price: t.current_price ?? 0,
      change1h: t.price_change_percentage_1h_in_currency ?? 0,
      change24h: t.price_change_percentage_24h_in_currency ?? t.price_change_percentage_24h ?? 0,
      change7d: t.price_change_percentage_7d_in_currency ?? 0,
      volume24h: t.total_volume ?? 0,
      marketCap: t.market_cap ?? 0,
      fdv: t.fully_diluted_valuation ?? t.market_cap ?? 0,
      circulatingSupply: t.circulating_supply ?? null,
      totalSupply: t.total_supply ?? null,
      ath: t.ath ?? null,
      atl: t.atl ?? null,
      athChange: t.ath_change_percentage ?? null,
      atlChange: t.atl_change_percentage ?? null,
      contractAddress: null as string | null,
      platform,
    }));

    cache.set(key, { ts: now, tokens });
    return new Response(JSON.stringify({ tokens }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ tokens: hit?.tokens ?? [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});