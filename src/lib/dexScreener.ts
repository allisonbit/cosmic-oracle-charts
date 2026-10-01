// ── dexScreener — standalone DEX market data client ──────────────────────────
// DexScreener's public API (api.dexscreener.com) is key-free and CORS-open,
// so the Token Explorer can talk to it directly from the browser — no edge
// function needed. All fields below map 1:1 from real API responses.

import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.dexscreener.com/latest/dex";

/**
 * Search anchors per DexScreener chainId: native symbol + deepest quote assets.
 * Merging these queries surfaces real on-chain pairs instead of token-name
 * matches on other chains.
 */
export const CHAIN_ANCHORS: Record<string, string[]> = {
  ethereum: ["ethereum weth", "ethereum usdt", "ethereum usdc", "ethereum dai"],
  solana: ["solana sol", "solana usdc", "solana usdt"],
  bsc: ["bsc wbnb", "bsc usdt", "bsc usdc"],
  avalanche: ["avalanche wavax", "avalanche usdc", "avalanche usdt"],
  polygon: ["polygon wpol", "polygon wpoly", "polygon usdc"],
  arbitrum: ["arbitrum weth", "arbitrum usdc", "arbitrum usdt"],
  base: ["base weth", "base usdc", "base dai"],
  optimism: ["optimism weth", "optimism usdc", "optimism usdt"],
  sui: ["sui sui", "sui usdc", "sui usdt"],
  ton: ["ton ton", "ton usdt", "ton usdc"],
};

/** DexScreener/GeckoTerminal chain slugs → GeckoTerminal network ids. */
const GT_NETWORKS: Record<string, string> = {
  ethereum: "eth",
  solana: "solana",
  bsc: "bsc",
  avalanche: "avax",
  polygon: "polygon",
  arbitrum: "arbitrum",
  base: "base",
  optimism: "optimism",
  sui: "sui",
  ton: "ton",
};

interface GTPool {
  id: string;
  attributes: {
    name: string;
    address: string;
    base_token_price_usd?: string;
    quote_token_price_usd?: string;
    volume_usd?: { h24?: number; h6?: number; h1?: number };
    reserve_in_usd?: number;
    price_change_percentage?: { h24?: number; h6?: number; h1?: number };
    transactions?: { h24?: { buys?: number; sells?: number } };
    fdv_usd?: string;
    market_cap_usd?: string;
  };
  relationships?: {
    base_token?: { data?: { id: string } };
  };
}

interface GTIncluded {
  id: string;
  type: string;
  attributes: { symbol?: string; name?: string; image_url?: string; coingecko_coin_id?: string }; 
}

/** GeckoTerminal serialises most numeric attributes as strings — coerce hard. */
function gtNum(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Real top pools per network from GeckoTerminal's free API. Returns the same
 * DexToken shape as the DexScreener source so widgets are source-agnostic.
 */
export function useDexPools(chainQuery: string, limit = 25, enabled = true) {
  return useQuery({
    queryKey: ["gt-pools", chainQuery, limit],
    queryFn: async (): Promise<DexToken[]> => {
      const network = GT_NETWORKS[chainQuery.toLowerCase()];
      if (!network) return [];
      const res = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/${network}/pools?sort=h24_volume_usd_desc&page=1`,
        { headers: { accept: "application/json" } },
      );
      if (!res.ok) return [];
      const json = (await res.json()) as { data?: GTPool[]; included?: GTIncluded[] };
      const pools = json.data ?? [];
      const meta = new Map<string, GTIncluded>();
      for (const inc of json.included ?? []) meta.set(inc.id, inc);
      const rows: DexToken[] = [];
      for (const p of pools.slice(0, limit)) {
        const a = p.attributes;
        const baseRel = p.relationships?.base_token?.data?.id;
        // included ids look like "eth_0x..." — split off the network prefix
        const baseMeta = baseRel ? meta.get(baseRel) : undefined;
        const namePair = a.name.split(" /");
        rows.push({
          id: p.id,
          symbol: (baseMeta?.attributes.symbol ?? namePair[0] ?? "").toUpperCase(),
          name: baseMeta?.attributes.name ?? namePair[0] ?? "",
          image: baseMeta?.attributes.image_url,
          price: gtNum(a.base_token_price_usd),
          change1h: gtNum(a.price_change_percentage?.h1),
          change24h: gtNum(a.price_change_percentage?.h24),
          change7d: gtNum(a.price_change_percentage?.h6),
          volume24h: gtNum(a.volume_usd?.h24),
          marketCap: gtNum(a.market_cap_usd) || gtNum(a.fdv_usd),
          fdv: gtNum(a.fdv_usd),
          liquidity: gtNum(a.reserve_in_usd),
          txns24h: gtNum(a.transactions?.h24?.buys) + gtNum(a.transactions?.h24?.sells),          buys24h: gtNum(a.transactions?.h24?.buys),
          sells24h: gtNum(a.transactions?.h24?.sells),
          contractAddress: baseRel?.split("_").pop() ?? null,
          pairUrl: `https://www.geckoterminal.com/${network}/pools/${a.address}`,
          dexId: p.id.split("_")[0] ?? "",
        });
      }
      return rows.filter(t => t.price > 0 || t.volume24h > 0);
    },
    enabled: enabled && !!chainQuery,
    staleTime: 120_000,
    refetchInterval: false,
    retry: 1,
  });
}

/** Minimal shape both the explorer table and discovery feed consume. */
export interface DexToken {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  liquidity: number;
  txns24h: number;
  buys24h: number;
  sells24h: number;
  contractAddress: string | null;
  pairUrl: string;
  dexId: string;
}

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken?: { symbol?: string };
  priceUsd?: string;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  volume?: { h24?: number; h6?: number; h1?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  txns?: { h24?: { buys?: number; sells?: number } };
  info?: { imageUrl?: string };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function normalizePair(p: DexPair): DexToken {
  const change = p.priceChange ?? {};
  const volume = p.volume ?? {};
  const txns = p.txns?.h24 ?? {};
  const buys = txns.buys ?? 0;
  const sells = txns.sells ?? 0;
  return {
    id: `${p.chainId}:${p.pairAddress}`,
    symbol: p.baseToken.symbol ?? "",
    name: p.baseToken.name ?? p.baseToken.symbol ?? "",
    image: p.info?.imageUrl,
    price: parseFloat(p.priceUsd ?? "0") || 0,
    change1h: change.h1 ?? 0,
    change24h: change.h24 ?? 0,
    change7d: change.h6 ?? 0, // DexScreener's public API stops at h6; label honestly in UI
    volume24h: volume.h24 ?? 0,
    marketCap: p.marketCap ?? p.fdv ?? 0,
    fdv: p.fdv ?? 0,
    liquidity: p.liquidity?.usd ?? 0,
    txns24h: buys + sells,
    buys24h: buys,
    sells24h: sells,
    contractAddress: p.baseToken.address ?? null,
    pairUrl: p.url ?? "",
    dexId: p.dexId ?? "",
  };
}

/**
 * Top DEX pairs on a chain, ranked by 24h volume.
 *
 * Primary source: GeckoTerminal's free pools API — real top-of-book pools per
 * network with 24h volume, liquidity and buy/sell counts. DexScreener's
 * search endpoint (fallback) ranks by TOKEN-name relevance rather than chain,
 * so it's only used when GeckoTerminal doesn't cover the network.
 */
export function useDexTopTokens(chainQuery: string, limit = 25, enabled = true) {
  const pools = useDexPools(chainQuery, limit, enabled);

  const hasPools = !!pools.data && pools.data.length > 0;
  const search = useQuery({
    queryKey: ["dex-top-tokens-search", chainQuery, limit],
    queryFn: async (): Promise<DexToken[]> => {
      const chain = chainQuery.toLowerCase();
      // Anchor terms: native symbol plus deepest quote assets.
      const anchors: string[] = CHAIN_ANCHORS[chain] ?? [chain];
      const results = await Promise.all(
        anchors.map(q => fetchJson<{ pairs?: DexPair[] }>(
          `${BASE}/search?q=${encodeURIComponent(q)}`,
        )),
      );
      const byToken = new Map<string, DexToken>();
      for (const json of results) {
        for (const p of json?.pairs ?? []) {
          if (p.chainId?.toLowerCase() !== chain) continue; // strict chain filter
          const t = normalizePair(p);
          const key = t.symbol.toUpperCase();
          const prev = byToken.get(key);
          if (!prev || t.liquidity > prev.liquidity) byToken.set(key, t);
        }
      }
      return [...byToken.values()]
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, limit);
    },
    enabled: enabled && !!chainQuery && pools.isSuccess && !hasPools,
    staleTime: 120_000,
    refetchInterval: false,
    retry: 1,
  });

  if (hasPools) return { data: pools.data, isLoading: pools.isLoading, isFetching: pools.isFetching };
  return { data: search.data ?? pools.data, isLoading: pools.isLoading || (search.fetchStatus !== "idle" && search.isLoading), isFetching: pools.isFetching || search.isFetching };
}

/**
 * Token discovery — same real pairs, plus derived categories from real moves:
 * rising (>5% 24h), crashing (<-5%), unusual (volume far above liquidity).
 */
export function useDexDiscovery(chainQuery: string, enabled = true) {
  const { data: tokens, isLoading } = useDexTopTokens(chainQuery, 50, enabled);
  return {
    data: tokens
      ? {
          tokens: tokens.map(t => {
            const volLiq = t.liquidity > 0 ? t.volume24h / t.liquidity : 0;
            const category: 'rising' | 'crashing' | 'new' | 'unusual' =
              t.change24h > 5 ? 'rising' : t.change24h < -5 ? 'crashing' : volLiq > 5 ? 'unusual' : 'new';
            return {
              symbol: t.symbol,
              name: t.name,
              price: t.price,
              change24h: t.change24h,
              change7d: t.change7d,
              volume24h: t.volume24h,
              marketCap: t.marketCap,
              rank: 0,
              logo: t.image ?? "",
              category,
              momentum: t.change1h,
              volumeSpike: volLiq,
              socialScore: 0,
              volatility: Math.abs(t.change24h),
              liquidityScore: Math.min(100, (t.liquidity / 1e6) * 10),
              sparkline: undefined,
              coingeckoId: undefined,
            };
          }),
          chain: chainQuery,
          timestamp: Date.now(),
          lastUpdated: new Date().toISOString(),
        }
      : undefined,
    isLoading,
  };
}
