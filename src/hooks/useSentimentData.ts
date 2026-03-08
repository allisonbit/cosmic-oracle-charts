import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RealNewsArticle {
  title: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: number;
  categories: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  body: string;
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  large: string;
  marketCapRank: number;
  priceBtc: number;
  score: number;
  slug: string;
}

export interface TrendingCategory {
  name: string;
  marketCap: number;
  marketCapChange24h: number;
  volume: number;
  coinsCount: number;
}

export interface FearGreedEntry {
  value: number;
  classification: string;
  timestamp: number;
}

export interface GlobalMarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptos: number;
  marketCapChange24h: number;
}

export interface TopCoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  ath: number;
  athChangePercentage: number;
  circulatingSupply: number;
  totalSupply: number;
}

export interface SentimentData {
  news: RealNewsArticle[];
  trending: TrendingCoin[];
  trendingNfts: Array<{ name: string; symbol: string; thumb: string; floorPrice: string; change24h: number }>;
  trendingCategories: TrendingCategory[];
  fearGreed: FearGreedEntry[];
  global: GlobalMarketData | null;
  topCoins: TopCoinData[];
  lastUpdated: string;
  source: string;
}

async function fetchSentimentData(): Promise<SentimentData> {
  const { data, error } = await supabase.functions.invoke('sentiment-data');
  if (error) throw error;
  return data;
}

export function useSentimentData() {
  return useQuery({
    queryKey: ['sentiment-data'],
    queryFn: fetchSentimentData,
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 45000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
