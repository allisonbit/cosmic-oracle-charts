import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  globalStats: GlobalStats;
  fearGreed?: { value: number; classification: string };
  topMovers?: any[];
  timestamp: number;
}

export function useCryptoFactory(filters?: {
  chain?: string;
  asset?: string;
  impact?: string;
  narrative?: string;
}) {
  return useQuery<CryptoFactoryData>({
    queryKey: ['crypto-factory', filters],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('crypto-factory');
      
      if (error) {
        console.error('Crypto factory error:', error);
        throw error;
      }

      let { events, onChainActivity, narratives, news, trending, globalStats, fearGreed, topMovers, timestamp } = data;

      // Apply filters
      if (filters?.chain && filters.chain !== 'All') {
        events = events.filter((e: MarketEvent) => 
          e.chain.toLowerCase().includes(filters.chain!.toLowerCase())
        );
        onChainActivity = onChainActivity.filter((a: OnChainActivity) => 
          a.chain.toLowerCase().includes(filters.chain!.toLowerCase())
        );
        narratives = narratives.filter((n: NarrativeItem) => 
          n.chains.some(c => c.toLowerCase().includes(filters.chain!.toLowerCase()))
        );
      }

      if (filters?.asset) {
        events = events.filter((e: MarketEvent) => 
          e.asset.toLowerCase().includes(filters.asset!.toLowerCase())
        );
        onChainActivity = onChainActivity.filter((a: OnChainActivity) => 
          a.asset.toLowerCase().includes(filters.asset!.toLowerCase())
        );
        news = news.filter((n: NewsItem) => 
          n.relatedAssets.some((a: string) => a.toLowerCase().includes(filters.asset!.toLowerCase()))
        );
      }

      if (filters?.impact && filters.impact !== 'All') {
        events = events.filter((e: MarketEvent) => e.impact === filters.impact);
      }

      return {
        events,
        onChainActivity,
        narratives,
        news,
        trending: trending || [],
        globalStats: globalStats || {},
        fearGreed: fearGreed || { value: 50, classification: 'Neutral' },
        topMovers: topMovers || [],
        timestamp,
      };
    },
    staleTime: 45000,
    refetchInterval: 60000, // Refresh every 60 seconds 24/7
    gcTime: 1000 * 60 * 15, // 15 min cache
    refetchIntervalInBackground: true, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}
