import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
}

// Hook for searching tokens
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
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        return { tokens: [], query: '', chain };
      }

      const { data, error } = await supabase.functions.invoke('token-search', {
        body: { query: debouncedQuery.trim(), chain, mode: 'search' }
      });

      if (error) {
        console.error('Token search error:', error);
        throw error;
      }

      return data as TokenSearchResult;
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

// Hook for getting trending/top tokens for a chain
export function useTrendingTokens(chain: string = 'ethereum', limit: number = 50) {
  return useQuery<TokenSearchResult>({
    queryKey: ['trending-tokens', chain, limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('token-search', {
        body: { chain, mode: 'trending', limit }
      });

      if (error) {
        console.error('Trending tokens error:', error);
        throw error;
      }

      return data as TokenSearchResult;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });
}

// Hook for getting token details by address
export function useTokenByAddress(address: string, chain: string = 'ethereum') {
  return useQuery<LiveToken | null>({
    queryKey: ['token-by-address', address, chain],
    queryFn: async () => {
      if (!address) return null;

      const { data, error } = await supabase.functions.invoke('token-search', {
        body: { query: address, chain, mode: 'search' }
      });

      if (error) {
        console.error('Token lookup error:', error);
        throw error;
      }

      return data?.tokens?.[0] || null;
    },
    enabled: !!address,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
