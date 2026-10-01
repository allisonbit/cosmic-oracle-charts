import { useQuery } from "@tanstack/react-query";
import { buildPrediction, fetchMarkets, fetchPriceSeries } from "@/lib/marketEngine";

export interface TechnicalIndicators {
  rsi: number;
  rsiSignal: 'oversold' | 'neutral' | 'overbought';
  macd: { value: number; signal: number; histogram: number; trend: 'bullish' | 'bearish' };
  movingAverages: { ma20: number; ma50: number; ma200: number; trend: 'bullish' | 'bearish' | 'neutral' };
  bollingerBands: { upper: number; middle: number; lower: number; position: 'upper' | 'middle' | 'lower' };
  volumeAnalysis: { trend: 'increasing' | 'decreasing' | 'stable'; strength: number };
  stochastic?: { k: number; d: number; signal: 'oversold' | 'neutral' | 'overbought' };
  atr?: number;
  obv?: string;
  vwap?: number;
}

export interface PredictionData {
  coinId: string;
  symbol: string;
  timeframe: string;
  timestamp: string;
  currentPrice: number;
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  probabilityBullish: number;
  probabilityBearish: number;
  priceTargets: {
    conservative: { low: number; high: number };
    moderate: { low: number; high: number };
    aggressive: { low: number; high: number };
  };
  tradingZones: {
    entryZone: { min: number; max: number };
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    takeProfit3: number;
  };
  supportLevels: number[];
  resistanceLevels: number[];
  technicalIndicators: TechnicalIndicators;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  volatilityIndex: number;
  summary: string;
  writeUp?: string;
  keyFactors: string[];
  bullScenario: { target: number; probability: number; triggers: string[] };
  bearScenario: { target: number; probability: number; triggers: string[] };
  disclaimer: string;
  marketData?: {
    volume24h: number;
    marketCap: number;
    high24h: number;
    low24h: number;
    change7d: number;
    change30d?: number;
    ath: number;
  };
}

export function usePricePrediction(
  coinId: string,
  timeframe: 'daily' | 'weekly' | 'monthly',
  enabled = true,
  opts?: { contractAddress?: string; chain?: string }
) {
  return useQuery<PredictionData>({
    queryKey: ['engine-prediction', coinId, timeframe],
    queryFn: async () => {
      // Real technical analysis from real history, computed in-browser.
      const [coins, series] = await Promise.all([
        fetchMarkets(250),
        fetchPriceSeries(coinId, timeframe === 'daily' ? 90 : timeframe === 'weekly' ? 365 : 730),
      ]);
      const coin = coins.find(c => c.id === coinId);
      const prediction = coin ? buildPrediction(coin, series, timeframe) : null;
      if (!prediction) throw new Error('Insufficient market history for analysis');
      return {
        ...prediction,
        // Real snapshot stats from the same markets fetch (no extra call).
        marketData: {
          volume24h: coin!.volume24h,
          marketCap: coin!.marketCap,
          high24h: coin!.high24h,
          low24h: coin!.low24h,
          change7d: coin!.change7d,
          change30d: coin!.change30d,
          ath: coin!.ath,
        },
      };
    },
    enabled: enabled && !!coinId && coinId.length > 0,
    staleTime: timeframe === 'daily' ? 5 * 60_000 : timeframe === 'weekly' ? 30 * 60_000 : 60 * 60_000,
    refetchInterval: false,
    gcTime: 60 * 60_000,
    refetchIntervalInBackground: false,
    // A setup must stay put while the user reads it. Window-focus refetches made
    // the levels re-roll on every tab switch — disabled so setups hold steady.
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
  });
}

// Re-export from extended cryptos for backward compatibility
import { TOP_50_CRYPTOS, ALL_CRYPTOS, searchCryptos, getCryptoById } from '@/lib/extendedCryptos';

export const TOP_CRYPTOS = TOP_50_CRYPTOS;
export { ALL_CRYPTOS, searchCryptos };

export function getCryptoBySlug(slug: string) {
  return getCryptoById(slug);
}

// Question intent templates for SEO pages
export const QUESTION_INTENTS = [
  // Daily intent - highest search volume
  { pattern: 'what-will-{coin}-price-be-today', template: 'What will {name} price be today?', timeframe: 'daily' as const },
  { pattern: 'will-{coin}-go-up-today', template: 'Will {name} go up today?', timeframe: 'daily' as const },
  { pattern: '{coin}-price-prediction-today', template: '{name} price prediction today', timeframe: 'daily' as const },
  { pattern: 'is-{coin}-bullish-today', template: 'Is {name} bullish today?', timeframe: 'daily' as const },
  { pattern: 'should-i-buy-{coin}-today', template: 'Should I buy {name} today?', timeframe: 'daily' as const },
  { pattern: '{coin}-forecast-today', template: '{name} forecast today', timeframe: 'daily' as const },
  { pattern: 'is-{coin}-going-up-or-down-today', template: 'Is {name} going up or down today?', timeframe: 'daily' as const },
  { pattern: '{coin}-price-tomorrow', template: '{name} price tomorrow', timeframe: 'daily' as const },
  { pattern: '{coin}-price-right-now', template: '{name} price right now', timeframe: 'daily' as const },
  { pattern: 'is-{coin}-a-buy-today', template: 'Is {name} a buy today?', timeframe: 'daily' as const },
  // Weekly intent
  { pattern: 'what-will-{coin}-price-be-this-week', template: 'What will {name} price be this week?', timeframe: 'weekly' as const },
  { pattern: 'will-{coin}-go-up-this-week', template: 'Will {name} go up this week?', timeframe: 'weekly' as const },
  { pattern: '{coin}-price-prediction-this-week', template: '{name} price prediction this week', timeframe: 'weekly' as const },
  { pattern: '{coin}-weekly-forecast', template: '{name} weekly forecast', timeframe: 'weekly' as const },
  { pattern: 'should-i-buy-{coin}-this-week', template: 'Should I buy {name} this week?', timeframe: 'weekly' as const },
  { pattern: '{coin}-analysis-this-week', template: '{name} analysis this week', timeframe: 'weekly' as const },
  { pattern: '{coin}-price-next-week', template: '{name} price next week', timeframe: 'weekly' as const },
  // Monthly intent
  { pattern: 'what-will-{coin}-price-be-this-month', template: 'What will {name} price be this month?', timeframe: 'monthly' as const },
  { pattern: 'is-{coin}-a-good-investment-this-month', template: 'Is {name} a good investment this month?', timeframe: 'monthly' as const },
  { pattern: '{coin}-price-prediction-this-month', template: '{name} price prediction this month', timeframe: 'monthly' as const },
  { pattern: '{coin}-monthly-forecast', template: '{name} monthly forecast', timeframe: 'monthly' as const },
  { pattern: 'should-i-buy-{coin}-now', template: 'Should I buy {name} now?', timeframe: 'monthly' as const },
  { pattern: '{coin}-price-prediction-2026', template: '{name} price prediction 2026', timeframe: 'monthly' as const },
  { pattern: '{coin}-price-prediction-2027', template: '{name} price prediction 2027', timeframe: 'monthly' as const },
  { pattern: 'is-{coin}-a-good-investment', template: 'Is {name} a good investment?', timeframe: 'monthly' as const },
  { pattern: '{coin}-buy-or-sell', template: '{name}: buy or sell?', timeframe: 'monthly' as const },
  { pattern: 'will-{coin}-reach-new-highs', template: 'Will {name} reach new highs?', timeframe: 'monthly' as const },
  { pattern: '{coin}-price-prediction-long-term', template: '{name} long-term price prediction', timeframe: 'monthly' as const },
  { pattern: 'is-{coin}-worth-buying', template: 'Is {name} worth buying?', timeframe: 'monthly' as const },
  { pattern: '{coin}-technical-analysis', template: '{name} technical analysis', timeframe: 'weekly' as const },
  { pattern: '{coin}-whale-activity', template: '{name} whale activity', timeframe: 'daily' as const },
  { pattern: '{coin}-vs-bitcoin', template: '{name} vs Bitcoin', timeframe: 'monthly' as const },
];

export function getQuestionIntent(slug: string): { 
  crypto: typeof TOP_CRYPTOS[0]; 
  question: string; 
  timeframe: 'daily' | 'weekly' | 'monthly';
} | null {
  for (const crypto of TOP_CRYPTOS) {
    for (const intent of QUESTION_INTENTS) {
      const coinVariants = [crypto.id, crypto.symbol, crypto.name.toLowerCase().replace(/\s+/g, '-')];
      for (const coinVar of coinVariants) {
        const pattern = intent.pattern.replace('{coin}', coinVar);
        if (slug === pattern) {
          return {
            crypto,
            question: intent.template.replace('{name}', crypto.name),
            timeframe: intent.timeframe
          };
        }
      }
    }
  }
  return null;
}
