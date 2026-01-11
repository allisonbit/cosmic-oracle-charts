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

// Fallback data for when edge function is unavailable
const FALLBACK_DATA: MarketDataResponse = {
  global: {
    totalMarketCap: 3.2e12,
    totalVolume24h: 120e9,
    btcDominance: 54,
    ethDominance: 12,
    activeCryptocurrencies: 15000,
    marketCapChange24h: 1.2,
  },
  fearGreedIndex: 65,
  trending: [
    { symbol: 'BTC', name: 'Bitcoin', rank: 1, priceChange: 1.5 },
    { symbol: 'ETH', name: 'Ethereum', rank: 2, priceChange: 0.8 },
    { symbol: 'SOL', name: 'Solana', rank: 3, priceChange: 2.1 },
  ],
  topCoins: [
    { symbol: 'BTC', name: 'Bitcoin', price: 97000, change24h: 1.5, volume: 45e9, marketCap: 1.9e12, rank: 1 },
    { symbol: 'ETH', name: 'Ethereum', price: 3400, change24h: 0.8, volume: 18e9, marketCap: 410e9, rank: 2 },
    { symbol: 'SOL', name: 'Solana', price: 190, change24h: 2.1, volume: 3e9, marketCap: 85e9, rank: 5 },
  ],
  timestamp: Date.now(),
};

export function useMarketData() {
  return useQuery({
    queryKey: ["crypto-market"],
    queryFn: async (): Promise<MarketDataResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("crypto-market");
        
        if (error) {
          console.warn("Market data unavailable, using fallback:", error.message);
          return { ...FALLBACK_DATA, timestamp: Date.now() };
        }
        
        return data as MarketDataResponse;
      } catch (err) {
        console.warn("Market data exception, using fallback");
        return { ...FALLBACK_DATA, timestamp: Date.now() };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000, // Increased to reduce refetch pressure
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 3000,
    networkMode: 'offlineFirst', // Use cache first to avoid blocking render
  });
}
