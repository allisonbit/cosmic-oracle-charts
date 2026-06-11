import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

interface LiquidationLevel {
  asset: string;
  symbol: string;
  price: number;
  longLiquidations: number;
  shortLiquidations: number;
  type: 'long' | 'short' | 'balanced';
  priceDistance: number;
}

interface LiquidationData {
  levels: LiquidationLevel[];
  totalLongLiquidations: number;
  totalShortLiquidations: number;
  longPercentage: number;
  lastUpdated: string;
}

async function fetchLiquidationData(): Promise<LiquidationData> {
  const { data, error } = await invokeFunction('liquidation-data');
  
  if (error) {
    console.error('Error fetching liquidation data:', error);
    throw error;
  }
  
  return data;
}

export function useLiquidationData() {
  return useQuery({
    queryKey: ['liquidation-data'],
    queryFn: fetchLiquidationData,
    refetchInterval: 20000, // Refresh every 20 seconds 24/7
    staleTime: 15000,
    gcTime: 1000 * 60 * 10,
    refetchIntervalInBackground: false, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}
