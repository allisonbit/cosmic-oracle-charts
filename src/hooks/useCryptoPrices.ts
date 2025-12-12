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
    refetchInterval: 10000, // Refresh every 10 seconds for live feel
    staleTime: 8000,
    refetchIntervalInBackground: true, // Keep fetching even when tab is not focused
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
