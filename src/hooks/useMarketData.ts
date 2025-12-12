import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GlobalMarketData {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptocurrencies: number;
  marketCapChange24h: number;
}

export interface TrendingCoin {
  symbol: string;
  name: string;
  rank: number;
  priceChange: number;
}

export interface TopCoin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  rank: number;
}

export interface MarketDataResponse {
  global: GlobalMarketData;
  fearGreedIndex: number;
  trending: TrendingCoin[];
  topCoins: TopCoin[];
  timestamp: number;
}

export function useMarketData() {
  return useQuery({
    queryKey: ["crypto-market"],
    queryFn: async (): Promise<MarketDataResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("crypto-market");
        
        if (error) {
          console.error("Error fetching market data:", error);
          throw error;
        }
        
        return data as MarketDataResponse;
      } catch (err) {
        console.error("Exception fetching market data:", err);
        throw err;
      }
    },
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10000,
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
