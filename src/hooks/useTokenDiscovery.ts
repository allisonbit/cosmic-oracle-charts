import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DiscoveryToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  logo: string;
  category: 'rising' | 'crashing' | 'new' | 'unusual';
  momentum: number;
  volumeSpike: number;
  socialScore: number;
  volatility: number;
  liquidityScore: number;
  sparkline?: number[];
  coingeckoId?: string;
}

export interface TokenDiscoveryResponse {
  tokens: DiscoveryToken[];
  chain: string;
  timestamp: number;
  lastUpdated: string;
}

// Fallback data for when edge function is unavailable
const FALLBACK_DATA: TokenDiscoveryResponse = {
  tokens: [],
  chain: 'ethereum',
  timestamp: Date.now(),
  lastUpdated: new Date().toISOString(),
};

export function useTokenDiscovery(chain: string = 'ethereum', enabled = true) {
  return useQuery<TokenDiscoveryResponse>({
    queryKey: ['token-discovery', chain],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('token-discovery', {
          body: { chain }
        });

        if (error) {
          console.warn('Token discovery error, using fallback:', error.message);
          return { ...FALLBACK_DATA, chain };
        }

        return data as TokenDiscoveryResponse;
      } catch (err) {
        console.warn('Token discovery exception, using fallback');
        return { ...FALLBACK_DATA, chain };
      }
    },
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 3000,
  });
}
