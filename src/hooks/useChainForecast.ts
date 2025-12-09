import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChainForecast {
  shortTerm: {
    prediction: "bullish" | "bearish" | "neutral";
    confidence: number;
    priceTarget: number;
    timeframe: string;
    reasoning: string;
  };
  midTerm: {
    prediction: "bullish" | "bearish" | "neutral";
    confidence: number;
    priceTarget: number;
    timeframe: string;
    reasoning: string;
  };
  longTerm: {
    prediction: "bullish" | "bearish" | "neutral";
    confidence: number;
    priceTarget: number;
    timeframe: string;
    reasoning: string;
  };
  keyTriggers: string[];
  riskLevel: number;
  overallConfidence: number;
  dailySummary: string;
}

export interface TokenRisk {
  symbol: string;
  name: string;
  riskLevel: "low" | "medium" | "high" | "extreme";
  riskScore: number;
  reasons: string[];
  liquidity: number;
  volatility: number;
}

export interface SocialSentiment {
  twitter: { positive: number; neutral: number; negative: number; volume: number };
  reddit: { positive: number; neutral: number; negative: number; volume: number };
  telegram: { positive: number; neutral: number; negative: number; volume: number };
  news: { positive: number; neutral: number; negative: number; count: number };
  overallSentiment: number;
}

export interface ChainForecastResponse {
  forecast: ChainForecast;
  tokenRisks: TokenRisk[];
  socialSentiment: SocialSentiment;
  timestamp: number;
}

export function useChainForecast(chainId: string, chainData: any, enabled = true) {
  return useQuery({
    queryKey: ["chain-forecast", chainId],
    queryFn: async (): Promise<ChainForecastResponse> => {
      const { data, error } = await supabase.functions.invoke("chain-forecast", {
        body: { chainId, chainData },
      });

      if (error) {
        console.error("Error fetching chain forecast:", error);
        throw error;
      }

      return data as ChainForecastResponse;
    },
    enabled: enabled && !!chainId && !!chainData,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000,
  });
}
