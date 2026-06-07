import { usePricePrediction } from "@/hooks/usePricePrediction";
import { useActiveSetup, TradeSetup } from "@/hooks/useTradeSetups";

// ── useCanonicalSetup ─────────────────────────────────────────────────────────
// THE single source of truth for a coin's trade setup, used by BOTH the home
// "high-conviction" cards (LiveSignals) and the prediction page (TradeSetupCard)
// so they always show identical entry / SL / TP / bias / confidence.
//
// Precedence (matches what TradeSetupCard always used):
//   1. persisted, monitored setup from `trade_setups` (useActiveSetup)
//   2. the live prediction's tradingZones (usePricePrediction)
// Works in both states: DB deployed → persisted; not deployed → tradingZones.

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
  opts?: { contractAddress?: string; chain?: string; enabled?: boolean },
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
  const cp = prediction?.currentPrice ?? 0;

  // Prediction-zone fallback (the exact precedence TradeSetupCard used inline)
  const entryLow = setup?.entry_low ?? (zones?.entryZone as any)?.min ?? (cp ? cp * 0.98 : 0);
  const entryHigh = setup?.entry_high ?? (zones?.entryZone as any)?.max ?? cp;
  const stopLoss = setup?.stop_loss ?? zones?.stopLoss ?? (cp ? cp * 0.95 : 0);
  const tp1 = setup?.take_profit_1 ?? zones?.takeProfit1 ?? (cp ? cp * 1.05 : 0);
  const tp2 = setup?.take_profit_2 ?? zones?.takeProfit2 ?? (cp ? cp * 1.1 : 0);
  const tp3 = setup?.take_profit_3 ?? zones?.takeProfit3 ?? (cp ? cp * 1.15 : 0);

  const bias = (setup?.bias ?? prediction?.bias ?? "neutral") as CanonicalSetup["bias"];
  const confidence = setup?.confidence ?? prediction?.confidence ?? 50;
  const probabilityBullish = prediction?.probabilityBullish ?? (bias === "bullish" ? confidence : 100 - confidence);

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
    riskLevel: prediction?.riskLevel ?? "medium",
    persisted: !!setup,
    setup: setup ?? null,
    prediction,
    isLoading,
  };
}
