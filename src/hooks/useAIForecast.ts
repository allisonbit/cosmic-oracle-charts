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
    queryKey: ["ai-forecast", analysisType, coinData?.symbol || "market"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("ai-forecast", {
          body: { coinData, analysisType },
        });
        
        if (error) {
          console.error("Error fetching AI forecast:", error);
          throw error;
        }
        
        return data;
      } catch (err) {
        console.error("Exception fetching AI forecast:", err);
        throw err;
      }
    },
    enabled: enabled && !!coinData,
    staleTime: 90000, // 1.5 minutes
    refetchInterval: 120000, // Refresh every 2 minutes
    gcTime: 1000 * 60 * 15, // 15 min cache
    refetchIntervalInBackground: true, // Keep updating 24/7
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: 2000,
  });
}
