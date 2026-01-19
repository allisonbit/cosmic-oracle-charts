import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TechnicalIndicators {
  rsi: number;
  rsiSignal: 'oversold' | 'neutral' | 'overbought';
  macd: { value: number; signal: number; histogram: number; trend: 'bullish' | 'bearish' };
  movingAverages: { ma20: number; ma50: number; ma200: number; trend: 'bullish' | 'bearish' | 'neutral' };
  bollingerBands: { upper: number; middle: number; lower: number; position: 'upper' | 'middle' | 'lower' };
  volumeAnalysis: { trend: 'increasing' | 'decreasing' | 'stable'; strength: number };
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
  keyFactors: string[];
  bullScenario: { target: number; probability: number; triggers: string[] };
  bearScenario: { target: number; probability: number; triggers: string[] };
  disclaimer: string;
}

export function usePricePrediction(
  coinId: string,
  symbol: string,
  timeframe: 'daily' | 'weekly' | 'monthly',
  enabled = true
) {
  return useQuery<PredictionData>({
    queryKey: ['price-prediction', coinId, timeframe],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      try {
        const { data, error } = await supabase.functions.invoke('price-prediction', {
          body: { coinId, symbol, timeframe }
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Price prediction error:', error);
          throw new Error(error.message || 'Failed to fetch prediction');
        }
        
        if (!data) {
          throw new Error('No prediction data received');
        }
        
        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    },
    enabled: enabled && !!coinId && coinId.length > 0,
    staleTime: timeframe === 'daily' ? 3 * 60 * 1000 : timeframe === 'weekly' ? 15 * 60 * 1000 : 30 * 60 * 1000,
    refetchInterval: timeframe === 'daily' ? 5 * 60 * 1000 : timeframe === 'weekly' ? 15 * 60 * 1000 : 30 * 60 * 1000, // All timeframes auto-refresh 24/7
    gcTime: 1000 * 60 * 60, // Keep in cache for 60 minutes
    refetchIntervalInBackground: true, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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
  { pattern: 'what-will-{coin}-price-be-today', template: 'What will {name} price be today?', timeframe: 'daily' as const },
  { pattern: 'will-{coin}-go-up-today', template: 'Will {name} go up today?', timeframe: 'daily' as const },
  { pattern: '{coin}-price-prediction-today', template: '{name} price prediction today', timeframe: 'daily' as const },
  { pattern: 'is-{coin}-bullish-today', template: 'Is {name} bullish today?', timeframe: 'daily' as const },
  { pattern: 'what-will-{coin}-price-be-this-week', template: 'What will {name} price be this week?', timeframe: 'weekly' as const },
  { pattern: 'will-{coin}-go-up-this-week', template: 'Will {name} go up this week?', timeframe: 'weekly' as const },
  { pattern: '{coin}-price-prediction-this-week', template: '{name} price prediction this week', timeframe: 'weekly' as const },
  { pattern: '{coin}-weekly-forecast', template: '{name} weekly forecast', timeframe: 'weekly' as const },
  { pattern: 'what-will-{coin}-price-be-this-month', template: 'What will {name} price be this month?', timeframe: 'monthly' as const },
  { pattern: 'is-{coin}-a-good-investment-this-month', template: 'Is {name} a good investment this month?', timeframe: 'monthly' as const },
  { pattern: '{coin}-price-prediction-this-month', template: '{name} price prediction this month', timeframe: 'monthly' as const },
  { pattern: '{coin}-monthly-forecast', template: '{name} monthly forecast', timeframe: 'monthly' as const },
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
