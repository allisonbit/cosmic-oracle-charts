import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CoinGecko chain-asset id per local chain id
const CG_ID: Record<string, string> = {
  ethereum: "ethereum", bitcoin: "bitcoin", solana: "solana", bsc: "binancecoin",
  polygon: "matic-network", arbitrum: "arbitrum", optimism: "optimism",
  avalanche: "avalanche-2", fantom: "fantom", base: "ethereum",
  cronos: "crypto-com-chain", sui: "sui", aptos: "aptos", near: "near",
  ton: "the-open-network", cardano: "cardano", cosmos: "cosmos",
  polkadot: "polkadot", tron: "tron", algorand: "algorand",
};

// DefiLlama chain slug per local chain id
const LLAMA_CHAIN: Record<string, string> = {
  ethereum: "Ethereum", solana: "Solana", bsc: "BSC", polygon: "Polygon",
  arbitrum: "Arbitrum", optimism: "Optimism", avalanche: "Avalanche",
  fantom: "Fantom", base: "Base", cronos: "Cronos", sui: "Sui", aptos: "Aptos",
  near: "Near", ton: "TON", tron: "Tron", linea: "Linea", scroll: "Scroll",
  zksync: "zkSync Era", mantle: "Mantle", gnosis: "Gnosis", celo: "Celo",
  starknet: "Starknet", bitcoin: "Bitcoin",
};

let llamaCache: { ts: number; chains: any[] } | null = null;
const TTL_MS = 5 * 60_000;

async function getLlama() {
  const now = Date.now();
  if (llamaCache && now - llamaCache.ts < TTL_MS) return llamaCache.chains;
  const r = await fetch("https://api.llama.fi/v2/chains");
  if (!r.ok) return llamaCache?.chains ?? [];
  const chains = await r.json();
  llamaCache = { ts: now, chains };
  return chains;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let chain = "ethereum";
  try {
    const body = await req.json();
    if (body?.chain) chain = String(body.chain);
  } catch { /* */ }

  try {
    const llamaName = LLAMA_CHAIN[chain];
    const cgId = CG_ID[chain];

    const [chains, priceRes] = await Promise.all([
      getLlama(),
      cgId
        ? fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`).then((r) => r.ok ? r.json() : null).catch(() => null)
        : Promise.resolve(null),
    ]);

    const chainData = chains.find((c: any) => c.name === llamaName);
    const price = cgId && priceRes?.[cgId] ? priceRes[cgId] : null;

    return new Response(JSON.stringify({
      chain,
      tvl: chainData?.tvl ?? null,
      tvlChange1d: chainData?.change_1d ?? null,
      tvlChange7d: chainData?.change_7d ?? null,
      nativePrice: price?.usd ?? null,
      nativeChange24h: price?.usd_24h_change ?? null,
      nativeVolume24h: price?.usd_24h_vol ?? null,
      nativeMarketCap: price?.usd_market_cap ?? null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});