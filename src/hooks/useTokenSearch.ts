import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export function useTokenSearch(query: string, chain: string = 'ethereum') {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useCallback(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<TokenSearchResult>({
    queryKey: ['token-search', query, chain],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return { tokens: [], query: '', chain };
      }

      const { data, error } = await supabase.functions.invoke('token-search', {
        body: { query: query.trim(), chain }
      });

      if (error) {
        console.error('Token search error:', error);
        throw error;
      }

      return data as TokenSearchResult;
    },
    enabled: query.trim().length >= 2,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useTokenDetails(contractAddress: string, chain: string = 'ethereum') {
  return useQuery<SearchToken | null>({
    queryKey: ['token-details', contractAddress, chain],
    queryFn: async () => {
      if (!contractAddress) return null;

      const { data, error } = await supabase.functions.invoke('token-search', {
        body: { query: contractAddress, chain }
      });

      if (error) {
        console.error('Token details error:', error);
        throw error;
      }

      return data?.tokens?.[0] || null;
    },
    enabled: !!contractAddress,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}
