// ── useLiveTokenSearch — standalone live token search & trending ─────────────
// The old implementation called the `token-search` Supabase edge function,
// which no longer exists. Everything here now talks directly to free, key-less,
// CORS-open public APIs: DexScreener for search/address lookup and
// GeckoTerminal for per-chain trending pools. Same exported names and shapes as
// before, so every consumer keeps working.

import { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface LiveToken {
  symbol: string;
  name: string;
  contractAddress: string;
  pairAddress?: string;
  chain: string;
  price: number;
  change24h: number;
  change1h?: number;
  change5m?: number;
  change7d?: number;
  volume24h: number;
  liquidity?: number;
  marketCap?: number;
  fdv?: number;
  txns24h?: number;
  buys24h?: number;
  sells24h?: number;
  dexId?: string;
  logo?: string;
  verified?: boolean;
  isTrending?: boolean;
  rank?: number;
  coingeckoId?: string;
  sparkline?: number[];
  quoteToken?: string;
  ath?: number;
  atl?: number;
  circulatingSupply?: number;
  totalSupply?: number;
}

interface TokenSearchResult {
  tokens: LiveToken[];
  query: string;
  chain: string;
  mode?: string;
  error?: string;
  nextPage?: number | null;
}

/** Our chain slugs → DexScreener chain ids. */
const DS_CHAINS: Record<string, string> = {
  ethereum: 'ethereum', solana: 'solana', bsc: 'bsc', bnb: 'bsc',
  avalanche: 'avalanche', polygon: 'polygon', arbitrum: 'arbitrum',
  base: 'base', optimism: 'optimism', sui: 'sui', ton: 'ton',
};

/** Our chain slugs → GeckoTerminal network ids (for trending pools). */
const GT_NETWORKS: Record<string, string> = {
  ethereum: 'eth', solana: 'solana', bsc: 'bsc', avalanche: 'avax',
  polygon: 'polygon', arbitrum: 'arbitrum', base: 'base',
  optimism: 'optimism', sui: 'sui', ton: 'ton',
};

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};

interface DSPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken?: { symbol?: string };
  priceUsd?: string;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  txns?: { h24?: { buys?: number; sells?: number } };
  info?: { imageUrl?: string };
}

function pairToLiveToken(p: DSPair, chainOverride?: string): LiveToken {
  const txns = p.txns?.h24 ?? {};
  return {
    symbol: p.baseToken.symbol ?? '',
    name: p.baseToken.name ?? p.baseToken.symbol ?? '',
    contractAddress: p.baseToken.address ?? '',
    pairAddress: p.pairAddress,
    chain: chainOverride || p.chainId || 'ethereum',
    price: num(p.priceUsd),
    change24h: p.priceChange?.h24 ?? 0,
    change1h: p.priceChange?.h1,
    change5m: p.priceChange?.m5,
    change7d: undefined, // DexScreener's public API stops at h6
    volume24h: p.volume?.h24 ?? 0,
    liquidity: p.liquidity?.usd,
    marketCap: p.marketCap ?? p.fdv,
    fdv: p.fdv,
    txns24h: (txns.buys ?? 0) + (txns.sells ?? 0),
    buys24h: txns.buys,
    sells24h: txns.sells,
    dexId: p.dexId,
    logo: p.info?.imageUrl,
    verified: (p.liquidity?.usd ?? 0) > 100_000,
    quoteToken: p.quoteToken?.symbol,
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── search (name / symbol / contract address) ────────────────────────────────

export function useLiveTokenSearch(query: string, chain: string = 'ethereum') {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<TokenSearchResult>({
    queryKey: ['live-token-search', debouncedQuery, chain],
    queryFn: async (): Promise<TokenSearchResult> => {
      const q = debouncedQuery.trim();
      if (q.length < 2) return { tokens: [], query: '', chain };

      // Raw contract address → DexScreener token lookup across its chain id.
      const isEvm = /^0x[a-fA-F0-9]{40}$/.test(q);
      const isSol = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q);
      if (isEvm || isSol) {
        const json = await fetchJson<{ pairs?: DSPair[] }>(
          `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(q)}`,
        );
        let tokens = (json?.pairs ?? []).map(p => pairToLiveToken(p));
        if (chain !== 'all') {
          const want = DS_CHAINS[chain.toLowerCase()];
          if (want) tokens = tokens.filter(t => t.chain.toLowerCase() === want);
        }
        tokens.sort((a, b) => (b.liquidity ?? 0) - (a.liquidity ?? 0));
        return { tokens: tokens.slice(0, 30), query: q, chain, mode: 'search' };
      }

      // Text search — a bare chain name returns off-chain token matches, so
      // anchor the query with the chain for better on-chain relevance.
      const dsChain = chain !== 'all' ? DS_CHAINS[chain.toLowerCase()] : undefined;
      const queries = dsChain ? [`${dsChain} ${q}`, q] : [q];
      const responses = await Promise.all(
        queries.map(u =>
          fetchJson<{ pairs?: DSPair[] }>(
            `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(u)}`,
          ),
        ),
      );
      const byAddr = new Map<string, LiveToken>();
      for (const json of responses) {
        for (const p of json?.pairs ?? []) {
          if (dsChain && p.chainId?.toLowerCase() !== dsChain) continue;
          const t = pairToLiveToken(p);
          const key = `${t.chain}:${t.contractAddress}`;
          const prev = byAddr.get(key);
          if (!prev || (t.liquidity ?? 0) > (prev.liquidity ?? 0)) byAddr.set(key, t);
        }
      }
      const tokens = [...byAddr.values()].sort((a, b) => (b.liquidity ?? 0) - (a.liquidity ?? 0)).slice(0, 30);
      return { tokens, query: q, chain, mode: 'search' };
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ── trending / top tokens per chain (GeckoTerminal real top pools) ───────────

function gtPoolsToTokens(chain: string, limit: number): Promise<LiveToken[]> {
  const network = GT_NETWORKS[chain.toLowerCase()];
  if (!network) return Promise.resolve([]);
  return fetchJson<{
    data?: Array<{
      id: string;
      attributes: {
        name: string; address: string;
        base_token_price_usd?: string;
        volume_usd?: { h24?: number };
        reserve_in_usd?: number;
        price_change_percentage?: { h24?: number; h6?: number; h1?: number };
        transactions?: { h24?: { buys?: number; sells?: number } };
        fdv_usd?: string; market_cap_usd?: string;
      };
      relationships?: { base_token?: { data?: { id: string } } };
    }>;
    included?: Array<{ id: string; type: string; attributes: { symbol?: string; name?: string; image_url?: string } }>;
  }>(`https://api.geckoterminal.com/api/v2/networks/${network}/pools?sort=h24_volume_usd_desc&page=1`).then(json => {
    const pools = json?.data ?? [];
    const meta = new Map<string, { symbol?: string; name?: string; image_url?: string }>();
    for (const inc of json?.included ?? []) meta.set(inc.id, inc);
    const out: LiveToken[] = [];
    for (const p of pools.slice(0, limit)) {
      const a = p.attributes;
      const baseRel = p.relationships?.base_token?.data?.id;
      const m = baseRel ? meta.get(baseRel) : undefined;
      const price = num(a.base_token_price_usd);
      const volume = num(a.volume_usd?.h24);
      if (price <= 0 && volume <= 0) continue;
      out.push({
        symbol: (m?.symbol ?? a.name.split(' / ')[0] ?? '').toUpperCase(),
        name: m?.name ?? a.name.split(' / ')[0] ?? '',
        contractAddress: baseRel?.split('_').pop() ?? a.address,
        pairAddress: a.address,
        chain,
        price,
        change24h: num(a.price_change_percentage?.h24),
        change1h: num(a.price_change_percentage?.h1),
        volume24h: volume,
        liquidity: num(a.reserve_in_usd),
        marketCap: num(a.market_cap_usd) || num(a.fdv_usd),
        fdv: num(a.fdv_usd),
        txns24h: num(a.transactions?.h24?.buys) + num(a.transactions?.h24?.sells),
        buys24h: num(a.transactions?.h24?.buys),
        sells24h: num(a.transactions?.h24?.sells),
        dexId: p.id.split('_')[0] ?? '',
        logo: m?.image_url,
        verified: true,
        isTrending: true,
        rank: out.length + 1,
      });
    }
    return out;
  });
}

export function useTrendingTokens(chain: string = 'ethereum', limit: number = 50) {
  return useQuery<TokenSearchResult>({
    queryKey: ['trending-tokens', chain, limit],
    queryFn: async (): Promise<TokenSearchResult> => {
      const tokens = await gtPoolsToTokens(chain, limit);
      return { tokens, query: '', chain, mode: 'trending', nextPage: null };
    },
    staleTime: 60000,
    refetchInterval: false, // no polling — data refreshes on visit/refetch
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useInfiniteTrendingTokens(chain: string = 'ethereum', limit: number = 50) {
  return useInfiniteQuery<TokenSearchResult>({
    queryKey: ['infinite-trending-tokens', chain, limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }): Promise<TokenSearchResult> => {
      // GeckoTerminal's free pools endpoint serves one page of real top pools;
      // beyond it we honestly return empty rather than fabricate more rows.
      const tokens = pageParam === 1 ? await gtPoolsToTokens(chain, limit) : [];
      return { tokens, query: '', chain, mode: 'trending', nextPage: tokens.length >= limit ? pageParam + 1 : null };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useTokenByAddress(address: string, chain: string = 'ethereum') {
  return useQuery<LiveToken | null>({
    queryKey: ['token-by-address', address, chain],
    queryFn: async (): Promise<LiveToken | null> => {
      if (!address) return null;
      const json = await fetchJson<{ pairs?: DSPair[] }>(
        `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(address)}`,
      );
      let pairs = json?.pairs ?? [];
      const want = DS_CHAINS[chain.toLowerCase()];
      if (want) pairs = pairs.filter(p => p.chainId?.toLowerCase() === want);
      if (!pairs.length) return null;
      const best = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
      return pairToLiveToken(best, want ? chain : undefined);
    },
    enabled: !!address,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
