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
      const { data, error } = await supabase.functions.invoke('price-prediction', {
        body: { coinId, symbol, timeframe }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!coinId,
    staleTime: timeframe === 'daily' ? 5 * 60 * 1000 : timeframe === 'weekly' ? 30 * 60 * 1000 : 60 * 60 * 1000,
    refetchInterval: timeframe === 'daily' ? 5 * 60 * 1000 : false,
    retry: 2
  });
}

// Top cryptocurrencies for prediction pages
export const TOP_CRYPTOS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB' },
  { id: 'solana', symbol: 'sol', name: 'Solana' },
  { id: 'ripple', symbol: 'xrp', name: 'XRP' },
  { id: 'cardano', symbol: 'ada', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche' },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot' },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink' },
  { id: 'matic-network', symbol: 'matic', name: 'Polygon' },
  { id: 'tron', symbol: 'trx', name: 'TRON' },
  { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu' },
  { id: 'litecoin', symbol: 'ltc', name: 'Litecoin' },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap' },
  { id: 'cosmos', symbol: 'atom', name: 'Cosmos' },
  { id: 'ethereum-classic', symbol: 'etc', name: 'Ethereum Classic' },
  { id: 'stellar', symbol: 'xlm', name: 'Stellar' },
  { id: 'near', symbol: 'near', name: 'NEAR Protocol' },
  { id: 'aptos', symbol: 'apt', name: 'Aptos' },
  { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum' },
  { id: 'optimism', symbol: 'op', name: 'Optimism' },
  { id: 'filecoin', symbol: 'fil', name: 'Filecoin' },
  { id: 'hedera-hashgraph', symbol: 'hbar', name: 'Hedera' },
  { id: 'vechain', symbol: 'vet', name: 'VeChain' },
  { id: 'aave', symbol: 'aave', name: 'Aave' },
  { id: 'the-graph', symbol: 'grt', name: 'The Graph' },
  { id: 'fantom', symbol: 'ftm', name: 'Fantom' },
  { id: 'algorand', symbol: 'algo', name: 'Algorand' },
  { id: 'sui', symbol: 'sui', name: 'Sui' },
  { id: 'immutable-x', symbol: 'imx', name: 'Immutable' },
  { id: 'injective-protocol', symbol: 'inj', name: 'Injective' },
  { id: 'render-token', symbol: 'rndr', name: 'Render' },
  { id: 'theta-token', symbol: 'theta', name: 'Theta Network' },
  { id: 'mantle', symbol: 'mnt', name: 'Mantle' },
  { id: 'flow', symbol: 'flow', name: 'Flow' },
  { id: 'axie-infinity', symbol: 'axs', name: 'Axie Infinity' },
  { id: 'decentraland', symbol: 'mana', name: 'Decentraland' },
  { id: 'the-sandbox', symbol: 'sand', name: 'The Sandbox' },
  { id: 'eos', symbol: 'eos', name: 'EOS' },
  { id: 'neo', symbol: 'neo', name: 'Neo' },
  { id: 'kucoin-shares', symbol: 'kcs', name: 'KuCoin Token' },
  { id: 'maker', symbol: 'mkr', name: 'Maker' },
  { id: 'pepe', symbol: 'pepe', name: 'Pepe' },
  { id: 'floki', symbol: 'floki', name: 'Floki' },
  { id: 'bonk', symbol: 'bonk', name: 'Bonk' },
  { id: 'gala', symbol: 'gala', name: 'Gala' },
  { id: 'sei-network', symbol: 'sei', name: 'Sei' },
  { id: 'stacks', symbol: 'stx', name: 'Stacks' },
  { id: 'celestia', symbol: 'tia', name: 'Celestia' }
];

export function getCryptoBySlug(slug: string) {
  return TOP_CRYPTOS.find(c => 
    c.id === slug || 
    c.symbol === slug.toLowerCase() || 
    c.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );
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
