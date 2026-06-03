import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALCHEMY_KEYS = [
  Deno.env.get("ALCHEMY_API_KEY_1"),
  Deno.env.get("ALCHEMY_API_KEY_2"),
  Deno.env.get("ALCHEMY_API_KEY_3"),
  Deno.env.get("ALCHEMY_API_KEY_4"),
  Deno.env.get("ALCHEMY_API_KEY_5"),
].filter(Boolean) as string[];

function pickKey(): string | null {
  if (!ALCHEMY_KEYS.length) return null;
  return ALCHEMY_KEYS[Math.floor(Date.now() / 30000) % ALCHEMY_KEYS.length];
}

const NETWORK: Record<string, string> = {
  ethereum: "eth-mainnet",
  polygon: "polygon-mainnet",
  arbitrum: "arb-mainnet",
  optimism: "opt-mainnet",
  base: "base-mainnet",
  avalanche: "avax-mainnet",
};

const cache = new Map<string, { ts: number; data: any }>();
const TTL_MS = 5 * 60_000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let chain = "ethereum";
  let address = "";
  try {
    const body = await req.json();
    if (body?.chain) chain = String(body.chain);
    if (body?.address) address = String(body.address);
  } catch { /* */ }

  if (!address || !NETWORK[chain]) {
    return new Response(JSON.stringify({ holders: [], distribution: [], totalHolders: null, supported: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const cacheKey = `${chain}:${address.toLowerCase()}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && now - hit.ts < TTL_MS) {
    return new Response(JSON.stringify({ ...hit.data, cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const key = pickKey();
  if (!key) {
    return new Response(JSON.stringify({ holders: [], distribution: [], totalHolders: null, supported: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = `https://${NETWORK[chain]}.g.alchemy.com/v2/${key}`;
    // 1. Total supply via metadata
    const metaR = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "alchemy_getTokenMetadata",
        params: [address],
      }),
    });
    const meta = await metaR.json();
    const decimals = meta?.result?.decimals ?? 18;

    // 2. Owners with balances (top page)
    const ownersR = await fetch(`https://${NETWORK[chain]}.g.alchemy.com/v2/${key}/getOwnersForToken?contractAddress=${address}&withTokenBalances=true`, {
      headers: { Accept: "application/json" },
    });
    const owners = await ownersR.json();
    const list = (owners?.owners ?? []) as Array<{ ownerAddress: string; tokenBalances: Array<{ balance: string }> }>;

    const parsed = list.map((o) => {
      const balRaw = o.tokenBalances?.[0]?.balance ?? "0x0";
      let bal = 0;
      try {
        bal = Number(BigInt(balRaw)) / Math.pow(10, decimals);
      } catch { bal = 0; }
      return { address: o.ownerAddress, balance: bal };
    }).filter(h => h.balance > 0).sort((a, b) => b.balance - a.balance);

    const totalBalances = parsed.reduce((s, h) => s + h.balance, 0) || 1;
    const topHolders = parsed.slice(0, 10).map(h => ({
      address: h.address,
      balance: h.balance,
      pct: (h.balance / totalBalances) * 100,
    }));

    const top10 = parsed.slice(0, 10).reduce((s, h) => s + h.balance, 0);
    const top50 = parsed.slice(10, 50).reduce((s, h) => s + h.balance, 0);
    const top100 = parsed.slice(50, 100).reduce((s, h) => s + h.balance, 0);
    const remaining = Math.max(0, totalBalances - top10 - top50 - top100);

    const distribution = [
      { label: "Top 10 Holders", pct: (top10 / totalBalances) * 100 },
      { label: "Top 11-50 Holders", pct: (top50 / totalBalances) * 100 },
      { label: "Top 51-100 Holders", pct: (top100 / totalBalances) * 100 },
      { label: "Remaining", pct: (remaining / totalBalances) * 100 },
    ];

    const data = {
      holders: topHolders,
      distribution,
      totalHolders: parsed.length,
      supported: true,
    };
    cache.set(cacheKey, { ts: now, data });
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ holders: [], distribution: [], totalHolders: null, supported: false, error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});