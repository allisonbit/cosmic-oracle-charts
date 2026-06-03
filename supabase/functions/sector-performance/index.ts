import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let cache: { ts: number; sectors: any[] } | null = null;
const TTL_MS = 120_000; // 2 min

// Map CoinGecko category id -> display name and link target
const SECTOR_MAP: Array<{ id: string; name: string; link: string }> = [
  { id: "layer-1", name: "Layer 1", link: "/explorer" },
  { id: "ethereum-ecosystem", name: "Ethereum Eco", link: "/chain/ethereum" },
  { id: "solana-ecosystem", name: "Solana Eco", link: "/chain/solana" },
  { id: "layer-2", name: "Layer 2", link: "/explorer" },
  { id: "decentralized-finance-defi", name: "DeFi", link: "/explorer" },
  { id: "artificial-intelligence", name: "AI & Big Data", link: "/explorer" },
  { id: "meme-token", name: "Meme Coins", link: "/explorer" },
  { id: "gaming", name: "Gaming", link: "/explorer" },
  { id: "infrastructure", name: "Infrastructure", link: "/explorer" },
  { id: "real-world-assets-rwa", name: "RWA", link: "/explorer" },
  { id: "privacy-coins", name: "Privacy", link: "/explorer" },
  { id: "depin", name: "DePIN", link: "/explorer" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const now = Date.now();
  if (cache && now - cache.ts < TTL_MS) {
    return new Response(JSON.stringify({ sectors: cache.sectors, cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const r = await fetch("https://api.coingecko.com/api/v3/coins/categories");
    if (!r.ok) throw new Error("coingecko categories " + r.status);
    const cats = await r.json() as Array<{ id: string; name: string; market_cap_change_24h: number; top_3_coins?: string[]; volume_24h: number; market_cap: number; }>;
    const byId = new Map(cats.map((c) => [c.id, c]));

    const sectors = SECTOR_MAP.map(({ id, name, link }) => {
      const c = byId.get(id);
      if (!c) return null;
      return {
        name,
        change: c.market_cap_change_24h ?? 0,
        marketCap: c.market_cap ?? 0,
        volume: c.volume_24h ?? 0,
        link,
      };
    }).filter(Boolean);

    cache = { ts: now, sectors };
    return new Response(JSON.stringify({ sectors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ sectors: cache?.sectors ?? [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});