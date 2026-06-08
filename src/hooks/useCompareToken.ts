import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

// Normalized shape used by the comparison UI — works for ANY token whether it
// resolves from CoinGecko (rich majors) or token-search (DexScreener/Alchemy DEX
// tokens + contracts on any chain).
export interface CompareToken {
  slug: string;
  id?: string;
  name: string;
  symbol: string;
  image?: string;
  price: number;
  change1h?: number;
  change24h: number;
  change7d?: number;
  change30d?: number;
  marketCap?: number;
  marketCapRank?: number;
  volume24h?: number;
  liquidity?: number;
  fdv?: number;
  ath?: number;
  athChangePct?: number;
  circulatingSupply?: number;
  communityScore?: number;
  liquidityScore?: number;
  chain?: string;
  contractAddress?: string;
  coingeckoId?: string;
  source: "coingecko" | "dex";
}

const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const SOL_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function normalizeCG(j: any, slug: string): CompareToken {
  const m = j.market_data || {};
  return {
    slug, id: j.id, coingeckoId: j.id, name: j.name, symbol: (j.symbol || "").toUpperCase(),
    image: j.image?.large || j.image?.small,
    price: m.current_price?.usd ?? 0,
    change1h: m.price_change_percentage_1h_in_currency?.usd,
    change24h: m.price_change_percentage_24h ?? 0,
    change7d: m.price_change_percentage_7d_in_currency?.usd,
    change30d: m.price_change_percentage_30d_in_currency?.usd,
    marketCap: m.market_cap?.usd, marketCapRank: m.market_cap_rank,
    volume24h: m.total_volume?.usd, fdv: m.fully_diluted_valuation?.usd,
    ath: m.ath?.usd, athChangePct: m.ath_change_percentage?.usd,
    circulatingSupply: m.circulating_supply,
    communityScore: j.community_score, liquidityScore: j.liquidity_score,
    source: "coingecko",
  };
}

function normalizeLive(t: any, slug: string): CompareToken | null {
  if (!t) return null;
  return {
    slug, coingeckoId: t.coingeckoId, name: t.name, symbol: (t.symbol || "").toUpperCase(),
    image: t.logo, price: t.price ?? 0,
    change1h: t.change1h, change24h: t.change24h ?? 0, change7d: t.change7d,
    marketCap: t.marketCap, marketCapRank: t.rank, volume24h: t.volume24h,
    liquidity: t.liquidity, fdv: t.fdv,
    ath: t.ath, circulatingSupply: t.circulatingSupply,
    chain: t.chain, contractAddress: t.contractAddress,
    source: "dex",
  };
}

async function resolveToken(slug: string): Promise<CompareToken | null> {
  if (!slug) return null;

  // 1. Explicit chain_address (DEX-only tokens) or raw contract address.
  let chain: string | undefined;
  let address: string | undefined;
  if (slug.includes("_")) {
    const [c, a] = slug.split("_");
    chain = c; address = a;
  } else if (EVM_RE.test(slug)) {
    chain = "ethereum"; address = slug;
  } else if (SOL_RE.test(slug)) {
    chain = "solana"; address = slug;
  }

  if (address) {
    const { data } = await invokeFunction("token-search", { body: { query: address, chain: chain || "ethereum", mode: "search" } });
    return normalizeLive((data as any)?.tokens?.[0], slug);
  }

  // 2. Try CoinGecko by id for rich major-coin data (rank, ATH, 7d/30d, scores).
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${slug}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`);
    if (res.ok) {
      const j = await res.json();
      if (j?.id && j?.market_data) return normalizeCG(j, slug);
    }
  } catch { /* fall through */ }

  // 3. Fallback: worldwide token-search by symbol/name.
  const { data } = await invokeFunction("token-search", { body: { query: slug, chain: "all", mode: "search" } });
  return normalizeLive((data as any)?.tokens?.[0], slug);
}

export function useCompareToken(slug: string | undefined) {
  return useQuery<CompareToken | null>({
    queryKey: ["compare-token", slug],
    queryFn: () => resolveToken(slug || ""),
    enabled: !!slug,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Build the URL slug for a token picked from search.
export function tokenToSlug(t: { coingeckoId?: string; chain?: string; contractAddress?: string; symbol: string }): string {
  if (t.coingeckoId) return t.coingeckoId;
  if (t.contractAddress) return `${t.chain || "ethereum"}_${t.contractAddress}`;
  return t.symbol.toLowerCase();
}
