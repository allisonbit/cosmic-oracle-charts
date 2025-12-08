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

export function useAIForecast(coinData: any, analysisType: "coin_forecast" | "market_sentiment", enabled = true) {
  return useQuery({
    queryKey: ["ai-forecast", analysisType, JSON.stringify(coinData)],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-forecast", {
        body: { coinData, analysisType },
      });
      
      if (error) {
        console.error("Error fetching AI forecast:", error);
        throw error;
      }
      
      return data;
    },
    enabled: enabled && !!coinData,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000,
  });
}
