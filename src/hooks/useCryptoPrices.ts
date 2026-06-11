import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h?: number;
  low24h?: number;
  image?: string;
  rank?: number;
}

export interface CryptoPricesResponse {
  prices: CryptoPrice[];
  timestamp: number;
}

// Fallback data for when edge function is unavailable
const FALLBACK_DATA: CryptoPricesResponse = {
  prices: [
    { symbol: 'BTC', name: 'Bitcoin',   price: 97000, change24h: 1.2,  volume24h: 45e9, marketCap: 1.9e12, high24h: 99000, low24h: 95000, image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',   rank: 1 },
    { symbol: 'ETH', name: 'Ethereum',  price: 3400,  change24h: 0.8,  volume24h: 18e9, marketCap: 410e9,  high24h: 3500,  low24h: 3350,  image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', rank: 2 },
    { symbol: 'SOL', name: 'Solana',    price: 190,   change24h: 2.1,  volume24h: 3e9,  marketCap: 85e9,   high24h: 198,   low24h: 185,   image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',  rank: 5 },
    { symbol: 'BNB', name: 'BNB',       price: 680,   change24h: 0.5,  volume24h: 1.5e9,marketCap: 100e9,  high24h: 690,   low24h: 672,   image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', rank: 4 },
    { symbol: 'XRP', name: 'XRP',       price: 2.3,   change24h: 1.8,  volume24h: 8e9,  marketCap: 130e9,  high24h: 2.4,   low24h: 2.25,  image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', rank: 3 },
  ],
  timestamp: Date.now(),
};

export function useCryptoPrices() {
  return useQuery({
    queryKey: ["crypto-prices"],
    queryFn: async (): Promise<CryptoPricesResponse> => {
      try {
        const { data, error } = await invokeFunction("crypto-prices");
        
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
    refetchInterval: 15000, // 15 seconds - live updates 24/7
    staleTime: 10000,
    gcTime: 1000 * 60 * 10, // 10 min cache
    refetchIntervalInBackground: false, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: 2000,
    networkMode: 'offlineFirst',
  });
}
