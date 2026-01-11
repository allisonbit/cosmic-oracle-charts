import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TOP_50_CRYPTOS, EXTENDED_CRYPTOS, searchCryptos } from '@/lib/extendedCryptos';

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

      // If contract address or no local results, search via API
      if (isContractAddress || localResults.length < 5) {
        const { data, error: apiError } = await supabase.functions.invoke('token-search', {
          body: { query, mode: 'search', limit: 30 }
        });

        if (!apiError && data?.tokens) {
          const apiTokens: GlobalToken[] = data.tokens.map((t: any) => ({
            id: t.id || t.baseToken?.address || t.address || `token-${t.symbol}`,
            symbol: (t.symbol || t.baseToken?.symbol || '').toUpperCase(),
            name: t.name || t.baseToken?.name || t.symbol,
            address: t.address || t.baseToken?.address,
            chain: t.chain || t.chainId,
            price: t.price || t.priceUsd,
            change24h: t.priceChange24h,
            volume24h: t.volume24h,
            marketCap: t.marketCap || t.fdv,
            liquidity: t.liquidity?.usd,
            logo: t.image || t.logo,
            isFromSearch: true
          }));

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
