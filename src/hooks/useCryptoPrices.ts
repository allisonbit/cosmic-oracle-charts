import { useQuery } from "@tanstack/react-query";
import { fetchMarkets, type EngineCoin } from "@/lib/marketEngine";

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

// Live prices come from the standalone market engine (CoinGecko public API,
// client-side cache + queue). If the network is unreachable we surface an EMPTY
// list — callers render their honest "data unavailable" states. No fabricated
// prices: stale/fake numbers are worse than none.
function toCryptoPrice(c: EngineCoin): CryptoPrice {
  return {
    symbol: c.symbol,
    name: c.name,
    price: c.price,
    change24h: c.change24h,
    volume24h: c.volume24h,
    marketCap: c.marketCap,
    high24h: c.high24h,
    low24h: c.low24h,
    image: c.image,
    rank: c.rank,
  };
}

export function useCryptoPrices() {
  return useQuery({
    queryKey: ["engine-prices"],
    queryFn: async (): Promise<CryptoPricesResponse> => {
      const coins = await fetchMarkets(100);
      return { prices: coins.map(toCryptoPrice), timestamp: Date.now() };
    },
    refetchInterval: 60_000, // 1 min — matches engine cache TTL
    staleTime: 45_000,
    gcTime: 1000 * 60 * 10,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: 3000,
  });
}
