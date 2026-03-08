import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CoinForecast {
  trend: "bullish" | "bearish" | "neutral";
  strength: "weak" | "moderate" | "strong";
  prediction24h: "up" | "down" | "sideways";
  supportLevel: number;
  resistanceLevel: number;
  reasoning: string;
}

export interface MarketSentiment {
  overallSentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  keyInsights: string[];
  shortTermOutlook: string;
  riskLevel: "low" | "medium" | "high";
}

const FALLBACK_SENTIMENT = {
  forecast: {
    overallSentiment: "neutral" as const,
    confidence: 55,
    keyInsights: [
      "Market analysis based on price action and volume",
      "Monitoring support and resistance levels",
      "Using algorithmic analysis mode"
    ],
    shortTermOutlook: "Market conditions are stable. Monitoring key indicators.",
    riskLevel: "medium" as const,
  },
  timestamp: Date.now(),
  fallback: true,
};

export function useAIForecast(coinData: any, analysisType: "coin_forecast" | "market_sentiment", enabled = true) {
  return useQuery({
    queryKey: ["ai-forecast", analysisType, coinData?.symbol || "market"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("ai-forecast", {
          body: { coinData, analysisType },
        });
        
        if (error) {
          console.warn("AI forecast unavailable, using fallback:", error.message);
          return FALLBACK_SENTIMENT;
        }
        
        return data;
      } catch (err) {
        console.warn("AI forecast exception, using fallback");
        return FALLBACK_SENTIMENT;
      }
    },
    enabled: enabled && !!coinData,
    staleTime: 90000,
    refetchInterval: 120000,
    gcTime: 1000 * 60 * 15,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    retryDelay: 5000,
  });
}