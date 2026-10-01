import { useQuery } from "@tanstack/react-query";
import { fetchMarkets, fetchGlobal, fetchFearGreed, type EngineCoin } from "@/lib/marketEngine";

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
  id?: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change1h?: number;
  change24h: number;
  change7d?: number;
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

// Live market snapshot from the standalone engine. `null` global data (network
// down) maps to zeros — the UI renders honest empty states from those.
function toTopCoin(c: EngineCoin): TopCoin {
  return {
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: c.image,
    price: c.price,
    change1h: c.change1h,
    change24h: c.change24h,
    change7d: c.change7d,
    volume: c.volume24h,
    marketCap: c.marketCap,
    rank: c.rank,
  };
}

export function useMarketData() {
  return useQuery({
    queryKey: ["engine-market"],
    queryFn: async (): Promise<MarketDataResponse> => {
      const [coins, global, fng] = await Promise.all([fetchMarkets(100), fetchGlobal(), fetchFearGreed()]);
      const ranked = [...coins].sort((a, b) => b.change24h - a.change24h);
      return {
        global: {
          totalMarketCap: global?.totalMarketCap ?? 0,
          totalVolume24h: global?.totalVolume24h ?? 0,
          btcDominance: global?.btcDominance ?? 0,
          ethDominance: global?.ethDominance ?? 0,
          activeCryptocurrencies: global?.activeCryptocurrencies ?? 0,
          marketCapChange24h: global?.marketCapChange24h ?? 0,
        },
        fearGreedIndex: fng?.value ?? 50,
        trending: ranked.slice(0, 5).map((c, i) => ({
          symbol: c.symbol,
          name: c.name,
          rank: i + 1,
          priceChange: c.change24h,
        })),
        topCoins: coins.slice(0, 100).map(toTopCoin),
        timestamp: Date.now(),
      };
    },
    refetchInterval: 90_000,
    staleTime: 60_000,
    gcTime: 1000 * 60 * 10,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: 3000,
  });
}
