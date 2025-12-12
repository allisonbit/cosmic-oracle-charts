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

export function useCryptoPrices() {
  return useQuery({
    queryKey: ["crypto-prices"],
    queryFn: async (): Promise<CryptoPricesResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("crypto-prices");
        
        if (error) {
          console.error("Error fetching crypto prices:", error);
          // Return last cached data or throw
          throw error;
        }
        
        return data as CryptoPricesResponse;
      } catch (err) {
        console.error("Exception fetching crypto prices:", err);
        throw err;
      }
    },
    refetchInterval: 20000, // 20 seconds - balanced for live feel without rate limiting
    staleTime: 15000,
    gcTime: 1000 * 60 * 5, // 5 min cache
    refetchIntervalInBackground: false, // Don't refetch when tab not focused
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000),
  });
}
