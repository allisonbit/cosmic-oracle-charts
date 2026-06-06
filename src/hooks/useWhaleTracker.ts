import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

interface WhaleTransaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  asset: string;
  amount: number;
  value: number;
  from: string;
  to: string;
  hash: string;
  timestamp: number;
  chain: string;
  impact: 'high' | 'medium' | 'low';
}

interface WhaleData {
  transactions: WhaleTransaction[];
  netflow: number;
  inflow: number;
  outflow: number;
  lastUpdated: string;
  source: string;
}

async function fetchWhaleData(chain: string = 'ethereum'): Promise<WhaleData> {
  const { data, error } = await invokeFunction('whale-tracker', {
    body: { chain }
  });
  
  if (error) {
    console.error('Error fetching whale data:', error);
    throw error;
  }
  
  return data;
}

export function useWhaleTracker(chain: string = 'ethereum') {
  return useQuery({
    queryKey: ['whale-tracker', chain],
    queryFn: () => fetchWhaleData(chain),
    refetchInterval: 20000, // Refresh every 20 seconds 24/7
    staleTime: 15000,
    gcTime: 1000 * 60 * 10,
    refetchIntervalInBackground: true, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}
