import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OracleTokenData {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  logo: string | null;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  holders: number;
  liquidity: number;
  allTimeHigh: number;
  allTimeLow: number;
  recentTransfers: {
    from: string;
    to: string;
    value: string;
    hash: string;
    blockNum: string;
  }[];
  lastUpdated: string;
}

export function useOracleToken() {
  return useQuery<OracleTokenData>({
    queryKey: ['oracle-token'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('oracle-token');
        
        if (error) {
          console.error('Oracle token fetch error:', error);
          throw error;
        }
        
        return data as OracleTokenData;
      } catch (err) {
        console.error('Oracle token exception:', err);
        throw err;
      }
    },
    staleTime: 10000,
    refetchInterval: 15000, // Auto-refresh every 15 seconds 24/7
    gcTime: 1000 * 60 * 10,
    refetchIntervalInBackground: true, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}
