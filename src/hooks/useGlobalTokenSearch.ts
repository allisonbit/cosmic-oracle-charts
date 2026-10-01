import { useState, useCallback } from 'react';
import { TOP_50_CRYPTOS, searchCryptos } from '@/lib/extendedCryptos';

export interface GlobalToken {
  id: string;
  symbol: string;
  name: string;
  address?: string;
  chain?: string;
  price?: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
  liquidity?: number;
  logo?: string;
  rank?: number;
  isFromSearch?: boolean;
}

// Default top 10 tokens
export const DEFAULT_TOKENS: GlobalToken[] = TOP_50_CRYPTOS.slice(0, 10).map(c => ({
  id: c.id,
  symbol: c.symbol.toUpperCase(),
  name: c.name,
  rank: c.rank
}));

export function useGlobalTokenSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GlobalToken[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search tokens globally via edge function (DexScreener + CoinGecko + local)
  const searchTokens = useCallback(async (query: string): Promise<GlobalToken[]> => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    setError(null);

    try {
      // First check local extended list
      const localResults = searchCryptos(query, 50).map(c => ({
        id: c.id,
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        rank: c.rank
      }));

      // Check if it looks like a contract address
      const isContractAddress = query.startsWith('0x') || query.length > 30;

      // Standalone live search: DexScreener's key-free public API for contracts
      // and for names the local list doesn't cover.
      if (isContractAddress || localResults.length < 5) {
        const url = isContractAddress
          ? `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(query)}`
          : `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { accept: 'application/json' } });
        const json = res.ok ? (await res.json()) as { pairs?: any[] } : null;

        const byAddr = new Map<string, GlobalToken>();
        for (const p of json?.pairs ?? []) {
          if (!p.baseToken?.address) continue;
          const addr: string = p.baseToken.address;
          const liq = p.liquidity?.usd ?? 0;
          const prev = byAddr.get(addr);
          if (prev && (prev.liquidity ?? 0) >= liq) continue;
          byAddr.set(addr, {
            id: addr,
            symbol: (p.baseToken.symbol || '').toUpperCase(),
            name: p.baseToken.name || p.baseToken.symbol || '',
            address: addr,
            chain: p.chainId,
            price: parseFloat(p.priceUsd ?? '0') || undefined,
            change24h: p.priceChange?.h24,
            volume24h: p.volume?.h24,
            marketCap: p.marketCap ?? p.fdv,
            liquidity: liq,
            logo: p.info?.imageUrl,
            isFromSearch: true,
          });
        }
        const apiTokens = [...byAddr.values()]
          .sort((a, b) => (b.liquidity ?? 0) - (a.liquidity ?? 0))
          .slice(0, 30);

        // Merge with local, prioritizing API for contract searches
        const merged = isContractAddress
          ? [...apiTokens, ...localResults]
          : [...localResults, ...apiTokens.filter(a => !localResults.find(l => l.symbol === a.symbol))];

        const unique = merged.filter((t, i, arr) =>
          arr.findIndex(x => x.symbol === t.symbol && x.id === t.id) === i
        ).slice(0, 50);

        setSearchResults(unique);
        setIsSearching(false);
        return unique;
      }

      setSearchResults(localResults);
      setIsSearching(false);
      return localResults;
    } catch (err) {
      console.error('Token search error:', err);
      setError('Search failed. Please try again.');
      setIsSearching(false);
      return [];
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    isSearching,
    searchResults,
    error,
    searchTokens,
    clearSearch,
    defaultTokens: DEFAULT_TOKENS
  };
}
