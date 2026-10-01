import { useQuery } from "@tanstack/react-query";
import { usePricePrediction } from "@/hooks/usePricePrediction";
import { type EnginePrediction } from "@/lib/marketEngine";

export interface ChainForecastTimeframe {
  prediction: "bullish" | "bearish" | "neutral";
  confidence: number;
  /** Always 0 — price targets require horizon-specific modeling; widgets hide it. */
  priceTarget: number;
  timeframe: string;
  reasoning: string;
}

export interface ChainForecast {
  shortTerm: ChainForecastTimeframe;
  midTerm: ChainForecastTimeframe;
  longTerm: ChainForecastTimeframe;
  keyTriggers: string[];
  riskLevel: number;
  overallConfidence: number;
  dailySummary: string;
}

export interface SentimentBucket {
  positive: number;
  neutral: number;
  negative: number;
  /** Always 0 — no social feed exists. */
  volume: number;
}

export interface SocialSentiment {
  twitter: SentimentBucket;
  reddit: SentimentBucket;
  telegram: SentimentBucket;
  news: { positive: number; neutral: number; negative: number; count: number };
  overallSentiment: number;
  /** Honest marker: no social feed exists in standalone mode. */
  note: string;
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

export interface ChainForecastResponse {
  forecast: ChainForecast | null;
  socialSentiment: SocialSentiment | null;
  timestamp: number;
}

const SOCIAL_NOTE = "No social feed in this build";

/**
 * Shape the engine prediction into the forecast object the chain widgets
 * render. Confidence is the engine's measured conviction — bias/strength from
 * RSI, MACD and moving averages — never random.
 */
function toTimeframes(pred: EnginePrediction): {
  shortTerm: ChainForecastTimeframe;
  midTerm: ChainForecastTimeframe;
  longTerm: ChainForecastTimeframe;
  overall: number;
  risk: number;
  triggers: string[];
  summary: string;
} {
  const bias = pred.bias;
  const reasoning = pred.summary;
  const sigs = pred.technicalIndicators;
  const rsiTxt = `RSI ${pred.technicalIndicators.rsi.toFixed(0)} (${pred.technicalIndicators.rsiSignal})`;
  const maTxt = `MA trend ${pred.technicalIndicators.movingAverages.trend}`;
  const triggers = [
    `${maTxt} on the daily chart`,
    `${rsiTxt} — ${sigs.rsiSignal === "oversold" ? "watch for a bounce" : sigs.rsiSignal === "overbought" ? "watch for a pullback" : "no momentum extreme"}`,
    `MACD ${sigs.macd.trend} (histogram ${sigs.macd.histogram >= 0 ? "+" : ""}${sigs.macd.histogram.toPrecision(3)})`,
    `Bollinger position: ${sigs.bollingerBands.position} band`,
    `Volume trend ${sigs.volumeAnalysis.trend}`,
  ];
  const conf = pred.confidence;
  return {
    shortTerm: { prediction: bias, confidence: conf, priceTarget: 0, timeframe: "Daily read", reasoning },
    midTerm: { prediction: bias, confidence: Math.round(conf * 0.85), priceTarget: 0, timeframe: "Swing horizon", reasoning },
    longTerm: { prediction: bias, confidence: Math.round(conf * 0.7), priceTarget: 0, timeframe: "Position horizon", reasoning },
    overall: conf,
    risk: pred.volatilityIndex,
    triggers,
    summary: `${pred.symbol} (${pred.timeframe}): ${pred.summary} ${rsiTxt}, ${maTxt}. ${pred.disclaimer}`,
  };
}

/**
 * Chain forecast — one real prediction per load from the same pure engine that
 * powers /price-prediction. No edge function, no polling, no random fallback.
 * `forecast` is null until the engine's first real read (needs ≥30 real price
 * points); social sentiment is null — there is no social feed in standalone mode.
 */
export function useChainForecast(chainId: string, enabled = true) {
  const coinId = chainId === "base" ? "ethereum" : chainId;
  const { data: pred, isLoading } = usePricePrediction(coinId, "daily");

  const query = useQuery({
    queryKey: ["chain-forecast", coinId, pred?.timestamp],
    queryFn: (): ChainForecastResponse => {
      if (!pred) return { forecast: null, socialSentiment: null, timestamp: Date.now() };
      const t = toTimeframes(pred);
      return {
        forecast: {
          shortTerm: t.shortTerm,
          midTerm: t.midTerm,
          longTerm: t.longTerm,
          keyTriggers: t.triggers,
          riskLevel: t.risk,
          overallConfidence: t.overall,
          dailySummary: t.summary,
        },
        socialSentiment: {
          twitter: { positive: 0, neutral: 0, negative: 0, volume: 0 },
          reddit: { positive: 0, neutral: 0, negative: 0, volume: 0 },
          telegram: { positive: 0, neutral: 0, negative: 0, volume: 0 },
          news: { positive: 0, neutral: 0, negative: 0, count: 0 },
          overallSentiment: 0,
          note: SOCIAL_NOTE,
        },
        timestamp: Date.now(),
      };
    },
    enabled: !!chainId,
    staleTime: 60_000,
    refetchInterval: false,
  });

  return { data: query.data, isLoading };
}
