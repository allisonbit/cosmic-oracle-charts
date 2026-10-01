import { useQuery } from "@tanstack/react-query";
import { fetchMarkets, fetchGlobal, fetchFearGreed } from "@/lib/marketEngine";

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  asset: string;
  chain: string;
  datetime: string;
  impact: 'low' | 'medium' | 'high';
  type: 'launch' | 'upgrade' | 'fork' | 'unlock' | 'governance' | 'regulatory';
  logo?: string;
}

export interface OnChainActivity {
  id: string;
  type: 'whale_movement' | 'exchange_flow' | 'bridge_activity' | 'large_transfer';
  asset: string;
  chain: string;
  amount: number;
  amountUSD: number;
  direction: 'inflow' | 'outflow';
  from: string;
  to: string;
  timestamp: string;
  txHash: string;
}

export interface NarrativeItem {
  id: string;
  narrative: string;
  description: string;
  momentum: number;
  chains: string[];
  topAssets: string[];
  sentiment: 'bullish' | 'neutral' | 'bearish';
  weeklyChange: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  impactScore: number;
  relatedAssets: string[];
  imageUrl?: string;
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  marketCapRank: number;
  priceChange24h: number;
}

export interface GlobalStats {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  activeCryptocurrencies?: number;
  markets?: number;
}

export interface CryptoFactoryData {
  events: MarketEvent[];
  onChainActivity: OnChainActivity[];
  narratives: NarrativeItem[];
  news: NewsItem[];
  trending: TrendingCoin[];
  globalStats?: GlobalStats;
  fearGreed?: { value: number; classification: string };
  topMovers?: any[];
  timestamp: number;
}

/**
 * Standalone Crypto Factory data. Real, engine-backed sections: global market
 * stats, top 24h movers and Fear & Greed. The feeds that required backend
 * aggregation (event calendar, on-chain whale flows, narratives, scored news)
 * have no key-free public source, so they return honestly empty arrays and the
 * UI shows its "no data right now" states — nothing is simulated.
 */
export function useCryptoFactory(_filters?: {
  chain?: string;
  asset?: string;
  impact?: string;
  narrative?: string;
}) {
  return useQuery<CryptoFactoryData>({
    queryKey: ['crypto-factory'],
    queryFn: async () => {
      const [markets, global, fng] = await Promise.all([
        fetchMarkets(100),
        fetchGlobal(),
        fetchFearGreed(),
      ]);

      const topMovers = [...markets]
        .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
        .slice(0, 15)
        .map(c => ({ id: c.id, symbol: c.symbol, name: c.name, logo: c.image, change24h: c.change24h }));

      const globalStats: GlobalStats | undefined = global
        ? {
            totalMarketCap: global.totalMarketCap,
            totalVolume: global.totalVolume24h,
            btcDominance: global.btcDominance,
            ethDominance: global.ethDominance,
            marketCapChange24h: global.marketCapChange24h,
            activeCryptocurrencies: global.activeCryptocurrencies,
          }
        : undefined;

      return {
        events: [],
        onChainActivity: [],
        narratives: [],
        news: [],
        trending: [],
        globalStats,
        fearGreed: fng ? { value: fng.value, classification: fng.label } : undefined,
        topMovers,
        timestamp: Date.now(),
      };
    },
    staleTime: 120_000,
    refetchInterval: false, // refresh on visit / manual refresh
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
