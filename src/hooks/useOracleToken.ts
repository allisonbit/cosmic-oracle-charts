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
      const { data, error } = await supabase.functions.invoke('oracle-token');
      
      if (error) {
        console.error('Oracle token fetch error:', error);
        throw error;
      }
      
      return data as OracleTokenData;
    },
    staleTime: 30000, // Refresh every 30 seconds
    refetchInterval: 60000, // Auto-refresh every minute
  });
}
