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

export function useTokenDiscovery(chain: string = 'ethereum', enabled = true) {
  return useQuery<TokenDiscoveryResponse>({
    queryKey: ['token-discovery', chain],
    queryFn: async () => {
      console.log('Fetching token discovery for:', chain);
      
      const { data, error } = await supabase.functions.invoke('token-discovery', {
        body: { chain }
      });

      if (error) {
        console.error('Token discovery error:', error);
        throw error;
      }

      console.log('Token discovery data:', data);
      return data as TokenDiscoveryResponse;
    },
    enabled,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
