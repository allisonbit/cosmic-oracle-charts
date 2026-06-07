import { usePricePrediction } from "@/hooks/usePricePrediction";
import { useActiveSetup, TradeSetup } from "@/hooks/useTradeSetups";
import { computeLocalSignal, LocalSignalInput } from "@/lib/localSignal";

// ── useCanonicalSetup ─────────────────────────────────────────────────────────
// THE single source of truth for a coin's trade setup, used by BOTH the home
// "high-conviction" cards (LiveSignals) and the prediction page (TradeSetupCard)
// so they always show identical entry / SL / TP / bias / confidence.
//
// Precedence:
//   1. persisted, monitored setup from `trade_setups` (useActiveSetup)
//   2. the live AI prediction's tradingZones (usePricePrediction)
//   3. a deterministic, per-coin LOCAL signal from live market data — so cards
//      differ by coin even before the AI loads (fixes "all the same confidence").
// Works in all states: DB deployed → persisted; AI up → prediction; neither →
// local signal computed from the live price passed in.

export interface CanonicalSetup {
  bias: "bullish" | "bearish" | "neutral";
  confidence: number;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  lastPrice: number;
  pnlPercent: number;
  status: TradeSetup["status"];
  probabilityBullish: number;
  probabilityBearish: number;
  riskLevel: string;
  /** true when backed by a persisted, monitored setup (vs live prediction). */
  persisted: boolean;
  /** the raw persisted setup (for save/follow + status pills), if any. */
  setup: TradeSetup | null;
  /** the raw prediction (for summary/technicals), if loaded. */
  prediction: any;
  isLoading: boolean;
}

export function useCanonicalSetup(
  coinId: string,
  symbol: string,
  timeframe: "daily" | "weekly" | "monthly" = "daily",
  opts?: { contractAddress?: string; chain?: string; enabled?: boolean; live?: Partial<LocalSignalInput> },
): CanonicalSetup {
  const enabled = opts?.enabled ?? true;
  const { data: setup } = useActiveSetup(coinId, timeframe);
  const { data: prediction, isLoading } = usePricePrediction(
    coinId,
    symbol,
    timeframe,
    enabled,
    { contractAddress: opts?.contractAddress, chain: opts?.chain },
  );

  const zones = prediction?.tradingZones;
  const cp = prediction?.currentPrice ?? opts?.live?.price ?? 0;

  // Per-coin local signal from live data. Computed whenever a live price is
  // available (not only when the AI is absent) so we can use its directional lean
  // when the AI read is neutral/flat — which is what made every card show 50/50.
  const local = (!setup && (opts?.live?.price ?? 0) > 0)
    ? computeLocalSignal(
        {
          symbol,
          price: opts!.live!.price!,
          change24h: opts?.live?.change24h ?? 0,
          high24h: opts?.live?.high24h,
          low24h: opts?.live?.low24h,
          volume24h: opts?.live?.volume24h,
          marketCap: opts?.live?.marketCap,
          change7d: opts?.live?.change7d,
        },
        timeframe,
      )
    : null;

  // Is the AI prediction actually taking a side? A neutral bias collapses to a
  // dead 50/50, so we treat that as "no directional read" and defer to the local
  // momentum signal instead of rendering a flat 50.
  const predDirectional =
    !!prediction &&
    prediction.bias && prediction.bias !== "neutral" &&
    typeof prediction.probabilityBullish === "number" &&
    prediction.probabilityBullish !== 50;

  // Precedence for levels: persisted setup → AI prediction zones → local → price.
  const entryLow = setup?.entry_low ?? (zones?.entryZone as any)?.min ?? local?.entryLow ?? (cp ? cp * 0.98 : 0);
  const entryHigh = setup?.entry_high ?? (zones?.entryZone as any)?.max ?? local?.entryHigh ?? cp;
  const stopLoss = setup?.stop_loss ?? zones?.stopLoss ?? local?.stopLoss ?? (cp ? cp * 0.95 : 0);
  const tp1 = setup?.take_profit_1 ?? zones?.takeProfit1 ?? local?.tp1 ?? (cp ? cp * 1.05 : 0);
  const tp2 = setup?.take_profit_2 ?? zones?.takeProfit2 ?? local?.tp2 ?? (cp ? cp * 1.1 : 0);
  const tp3 = setup?.take_profit_3 ?? zones?.takeProfit3 ?? local?.tp3 ?? (cp ? cp * 1.15 : 0);

  // Direction / conviction: persisted setup wins; else a directional AI read; else
  // the local momentum signal; else whatever the AI gave.
  const bias = (
    setup?.bias ??
    (predDirectional ? prediction.bias : undefined) ??
    local?.bias ??
    prediction?.bias ??
    "neutral"
  ) as CanonicalSetup["bias"];

  const confidence =
    setup?.confidence ??
    (predDirectional ? prediction.confidence : undefined) ??
    local?.confidence ??
    prediction?.confidence ??
    50;

  const probabilityBullish =
    setup
      ? (setup.bias === "bullish" ? confidence : setup.bias === "bearish" ? 100 - confidence : (local?.probabilityBullish ?? 50))
      : predDirectional
        ? prediction.probabilityBullish
        : (local?.probabilityBullish ?? prediction?.probabilityBullish ?? 50);

  return {
    bias,
    confidence,
    entryLow,
    entryHigh,
    stopLoss,
    tp1,
    tp2,
    tp3,
    lastPrice: setup?.last_price ?? cp,
    pnlPercent: setup?.pnl_percent ?? 0,
    status: setup?.status ?? "active",
    probabilityBullish: Math.round(probabilityBullish),
    probabilityBearish: Math.round(100 - probabilityBullish),
    riskLevel: prediction?.riskLevel ?? local?.riskLevel ?? "medium",
    persisted: !!setup,
    setup: setup ?? null,
    // Surface the AI prediction when present; otherwise expose a minimal
    // prediction-shaped object from the local signal so consumers that read
    // technicalIndicators (RSI / MACD) still get per-coin values, not blanks.
    prediction: prediction ?? (local ? {
      technicalIndicators: {
        rsi: local.rsi,
        rsiSignal: local.rsi > 70 ? "overbought" : local.rsi < 30 ? "oversold" : "neutral",
        macd: { trend: local.macdTrend },
      },
      bias: local.bias,
      confidence: local.confidence,
      riskLevel: local.riskLevel,
    } : undefined),
    isLoading,
  };
}
