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
      const { data, error } = await supabase.functions.invoke("crypto-prices");
      
      if (error) {
        console.error("Error fetching crypto prices:", error);
        throw error;
      }
      
      return data as CryptoPricesResponse;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
}
