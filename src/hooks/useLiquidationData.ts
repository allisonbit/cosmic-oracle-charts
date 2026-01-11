import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase.functions.invoke('liquidation-data');
  
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
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
    retry: 2,
  });
}
