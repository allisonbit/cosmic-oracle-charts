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
      try {
        const { data, error } = await supabase.functions.invoke('token-discovery', {
          body: { chain }
        });

        if (error) {
          console.error('Token discovery error:', error);
          throw error;
        }

        return data as TokenDiscoveryResponse;
      } catch (err) {
        console.error('Token discovery exception:', err);
        throw err;
      }
    },
    enabled,
    staleTime: 20000, // 20 seconds
    refetchInterval: 20000, // Refresh every 20 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
