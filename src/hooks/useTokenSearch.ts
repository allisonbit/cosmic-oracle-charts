import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface SearchToken {
  symbol: string;
  name: string;
  contractAddress: string;
  decimals: number;
  logo?: string;
  chain: string;
  price: number;
  change24h: number;
  verified: boolean;
  rank?: number;
  coingeckoId?: string;
}

interface TokenSearchResult {
  tokens: SearchToken[];
  query: string;
  chain: string;
  error?: string;
}

// Standalone: DexScreener's public API is key-free and CORS-open.
const DS_CHAINS: Record<string, string> = {
  ethereum: 'ethereum', solana: 'solana', bsc: 'bsc', bnb: 'bsc',
  avalanche: 'avalanche', polygon: 'polygon', arbitrum: 'arbitrum',
  base: 'base', optimism: 'optimism', sui: 'sui', ton: 'ton',
};

interface DSPair {
  chainId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  priceChange?: { h24?: number };
  liquidity?: { usd?: number };
  info?: { imageUrl?: string };
}

function toSearchToken(p: DSPair): SearchToken {
  return {
    symbol: p.baseToken.symbol ?? '',
    name: p.baseToken.name ?? p.baseToken.symbol ?? '',
    contractAddress: p.baseToken.address ?? '',
    decimals: 18,
    logo: p.info?.imageUrl,
    chain: p.chainId ?? 'ethereum',
    price: parseFloat(p.priceUsd ?? '0') || 0,
    change24h: p.priceChange?.h24 ?? 0,
    verified: (p.liquidity?.usd ?? 0) > 100_000,
  };
}

async function fetchPairs(url: string): Promise<DSPair[]> {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return [];
    const json = (await res.json()) as { pairs?: DSPair[] };
    return json.pairs ?? [];
  } catch {
    return [];
  }
}

export function useTokenSearch(query: string, chain: string = 'ethereum') {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<TokenSearchResult>({
    queryKey: ['token-search', debouncedQuery, chain],
    queryFn: async (): Promise<TokenSearchResult> => {
      const q = debouncedQuery.trim();
      if (q.length < 2) return { tokens: [], query: '', chain };

      const dsChain = DS_CHAINS[chain.toLowerCase()];
      const url = /^0x[a-fA-F0-9]{40}$/.test(q) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q)
        ? `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(q)}`
        : `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(dsChain && chain !== 'all' ? `${dsChain} ${q}` : q)}`;

      let pairs = await fetchPairs(url);
      if (dsChain && chain !== 'all') {
        pairs = pairs.filter(p => p.chainId?.toLowerCase() === dsChain);
      }

      // Dedupe by token address, keeping the most liquid pair.
      const byAddr = new Map<string, SearchToken>();
      for (const p of pairs) {
        if (!p.baseToken?.address) continue;
        const prev = byAddr.get(p.baseToken.address);
        if (!prev || (p.liquidity?.usd ?? 0) > 100_000) byAddr.set(p.baseToken.address, toSearchToken(p));
      }
      const tokens = [...byAddr.values()].slice(0, 30);
      return { tokens, query: q, chain };
    },
    enabled: query.trim().length >= 2,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useTokenDetails(contractAddress: string, chain: string = 'ethereum') {
  return useQuery<SearchToken | null>({
    queryKey: ['token-details', contractAddress, chain],
    queryFn: async (): Promise<SearchToken | null> => {
      if (!contractAddress) return null;
      const pairs = await fetchPairs(
        `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(contractAddress)}`,
      );
      const want = DS_CHAINS[chain.toLowerCase()];
      const filtered = want ? pairs.filter(p => p.chainId?.toLowerCase() === want) : pairs;
      if (!filtered.length) return null;
      const best = [...filtered].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
      return toSearchToken(best);
    },
    enabled: !!contractAddress,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
