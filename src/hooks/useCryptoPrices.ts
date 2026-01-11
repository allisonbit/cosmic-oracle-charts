import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface CryptoPricesResponse {
  prices: CryptoPrice[];
  timestamp: number;
}

// Fallback data for when edge function is unavailable
const FALLBACK_DATA: CryptoPricesResponse = {
  prices: [
    { symbol: 'BTC', name: 'Bitcoin', price: 97000, change24h: 1.2, volume24h: 45e9, marketCap: 1.9e12 },
    { symbol: 'ETH', name: 'Ethereum', price: 3400, change24h: 0.8, volume24h: 18e9, marketCap: 410e9 },
    { symbol: 'SOL', name: 'Solana', price: 190, change24h: 2.1, volume24h: 3e9, marketCap: 85e9 },
    { symbol: 'BNB', name: 'BNB', price: 680, change24h: 0.5, volume24h: 1.5e9, marketCap: 100e9 },
    { symbol: 'XRP', name: 'XRP', price: 2.3, change24h: 1.8, volume24h: 8e9, marketCap: 130e9 },
  ],
  timestamp: Date.now(),
};

export function useCryptoPrices() {
  return useQuery({
    queryKey: ["crypto-prices"],
    queryFn: async (): Promise<CryptoPricesResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("crypto-prices");
        
        if (error) {
          console.warn("Crypto prices unavailable, using fallback:", error.message);
          return { ...FALLBACK_DATA, timestamp: Date.now() };
        }
        
        return data as CryptoPricesResponse;
      } catch (err) {
        console.warn("Crypto prices exception, using fallback");
        return { ...FALLBACK_DATA, timestamp: Date.now() };
      }
    },
    refetchInterval: 30000, // 30 seconds - balanced for live feel without rate limiting
    staleTime: 25000, // Increased to reduce refetch pressure
    gcTime: 1000 * 60 * 5, // 5 min cache
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 3000,
    networkMode: 'offlineFirst', // Use cache first to avoid blocking render
  });
}
