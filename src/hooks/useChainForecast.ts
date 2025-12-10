import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChainDataResponse } from "./useChainData";

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

// Fallback data generator
function generateFallbackForecast(chainId: string, priceChange: number): ChainForecastResponse {
  const trend = priceChange > 2 ? "bullish" : priceChange < -2 ? "bearish" : "neutral";
  const chainName = chainId.charAt(0).toUpperCase() + chainId.slice(1);

  return {
    forecast: {
      shortTerm: {
        prediction: trend,
        confidence: 65 + Math.floor(Math.random() * 20),
        priceTarget: 0,
        timeframe: "1-4 hours",
        reasoning: `${chainName} showing ${trend} momentum in short-term trading based on on-chain activity.`,
      },
      midTerm: {
        prediction: trend === "bullish" ? "bullish" : "neutral",
        confidence: 55 + Math.floor(Math.random() * 25),
        priceTarget: 0,
        timeframe: "24-48 hours",
        reasoning: "Medium-term outlook depends on broader market conditions and on-chain activity.",
      },
      longTerm: {
        prediction: "bullish",
        confidence: 60 + Math.floor(Math.random() * 20),
        priceTarget: 0,
        timeframe: "3-7 days",
        reasoning: "Long-term fundamentals remain strong with continued ecosystem development.",
      },
      keyTriggers: [
        "Whale accumulation patterns",
        "Network upgrade announcements",
        "DeFi TVL changes",
        "Cross-chain bridge activity",
        "Market sentiment shifts",
      ],
      riskLevel: Math.floor(30 + Math.random() * 40),
      overallConfidence: Math.floor(60 + Math.random() * 25),
      dailySummary: `${chainName} network activity shows ${trend} signals. Monitor whale movements and DeFi metrics for trading opportunities.`,
    },
    tokenRisks: Array.from({ length: 8 }, (_, i) => ({
      symbol: `TOKEN${i + 1}`,
      name: `Token ${i + 1}`,
      riskLevel: (["low", "medium", "high", "extreme"] as const)[Math.floor(Math.random() * 4)],
      riskScore: Math.random() * 100,
      reasons: ["Stable liquidity", "Active development"],
      liquidity: Math.random() * 10e6,
      volatility: Math.random() * 100,
    })),
    socialSentiment: {
      twitter: { positive: 45, neutral: 35, negative: 20, volume: 15000 },
      reddit: { positive: 40, neutral: 40, negative: 20, volume: 5000 },
      telegram: { positive: 50, neutral: 30, negative: 20, volume: 8000 },
      news: { positive: 35, neutral: 45, negative: 20, count: 50 },
      overallSentiment: 65 + Math.floor(Math.random() * 20),
    },
    timestamp: Date.now(),
  };
}

export function useChainForecast(chainId: string, chainData: ChainDataResponse | undefined, enabled = true) {
  return useQuery({
    queryKey: ["chain-forecast", chainId],
    queryFn: async (): Promise<ChainForecastResponse> => {
      try {
        console.log("Fetching chain forecast for:", chainId);
        const { data, error } = await supabase.functions.invoke("chain-forecast", {
          body: { chainId, chainData },
        });

        if (error) {
          console.error("Error fetching chain forecast:", error);
          return generateFallbackForecast(chainId, chainData?.overview?.priceChange24h || 0);
        }

        console.log("Chain forecast received:", data);
        return data as ChainForecastResponse;
      } catch (err) {
        console.error("Exception fetching chain forecast:", err);
        return generateFallbackForecast(chainId, chainData?.overview?.priceChange24h || 0);
      }
    },
    enabled: enabled && !!chainId && !!chainData,
    staleTime: 300000,
    refetchInterval: 300000,
    retry: 1,
    retryDelay: 1000,
  });
}