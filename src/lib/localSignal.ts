// ── localSignal — deterministic per-coin signal from live market data ─────────
// The prediction edge function is the source of truth, but it can be slow, rate-
// limited, or briefly unavailable. Before it loads we MUST NOT show a flat
// confidence/bias for every coin (the "all markets have the same confidence"
// bug). This derives a distinct, data-driven bias / confidence / RSI / levels
// from the live price data each coin already has, mirroring the edge function's
// scoring so the client fallback is consistent with the eventual AI result.
//
// Stable within a UTC day via a seeded jitter keyed by symbol — never re-rolls on
// every render, but differs across coins.

import { seededRng, utcDayKey } from "@/lib/seededRandom";

export interface LocalSignalInput {
  symbol: string;
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  marketCap?: number;
  /** Optional longer-horizon momentum if available. */
  change7d?: number;
}

export interface LocalSignal {
  bias: "bullish" | "bearish" | "neutral";
  confidence: number;          // 0–100, varies per coin
  probabilityBullish: number;  // 0–100
  probabilityBearish: number;  // 0–100
  rsi: number;                 // 0–100
  riskLevel: "low" | "medium" | "high" | "extreme";
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  macdTrend: "bullish" | "bearish";
}

/**
 * Compute a distinct, deterministic signal for a single coin from its live data.
 * `timeframe` widens the level spacing for weekly/monthly the same way the edge
 * function does.
 */
export function computeLocalSignal(
  input: LocalSignalInput,
  timeframe: "daily" | "weekly" | "monthly" = "daily",
): LocalSignal {
  const price = input.price > 0 ? input.price : 0;
  const change24h = Number.isFinite(input.change24h) ? input.change24h : 0;
  const change7d = Number.isFinite(input.change7d as number) ? (input.change7d as number) : change24h * 3;

  // Derive a high/low band when not provided, from 24h volatility.
  const vol = Math.max(Math.abs(change24h) / 100, 0.01);
  const high24h = input.high24h && input.high24h > 0 ? input.high24h : price * (1 + vol);
  const low24h = input.low24h && input.low24h > 0 ? input.low24h : price * (1 - vol);

  // Day-stable jitter so confidence/RSI aren't a perfectly smooth function of
  // change (which would make coins with equal change look identical), but never
  // twitch on re-render.
  const rng = seededRng(`${input.symbol}|${timeframe}|${utcDayKey()}`);

  // ── RSI from multi-horizon momentum (mirrors the edge fn) ──
  const avgChange = (change24h + change7d / 7) / 2;
  let rsi = 50 + avgChange * 3 + (rng() - 0.5) * 8;
  rsi = Math.max(5, Math.min(95, rsi));

  // ── MACD proxy ──
  const macdTrend: "bullish" | "bearish" =
    change24h - change7d * 0.5 / 7 > 0 ? "bullish" : "bearish";

  // ── Moving-average trend proxy ──
  const maTrend: "bullish" | "bearish" | "neutral" =
    change7d > 1 ? "bullish" : change7d < -1 ? "bearish" : "neutral";

  // ── Bias scoring (same shape as the edge function) ──
  let score = 0;
  if (rsi < 30) score += 2;
  else if (rsi < 45) score += 1;
  else if (rsi > 70) score -= 2;
  else if (rsi > 55) score -= 1;

  if (macdTrend === "bullish") score += 2; else score -= 2;
  if (maTrend === "bullish") score += 2; else if (maTrend === "bearish") score -= 2;
  if (change24h > 0) score += 1; else score -= 1;
  if (change7d > 0) score += 1; else score -= 1;

  const bias: "bullish" | "bearish" | "neutral" =
    score >= 4 ? "bullish" : score <= -4 ? "bearish" : "neutral";

  const confidence = Math.min(92, 45 + Math.abs(score) * 4 + Math.round(rng() * 8));
  const probabilityBullish =
    bias === "bullish" ? confidence : bias === "bearish" ? 100 - confidence : Math.round(50 + score * 2);

  // ── Risk from volatility ──
  const actualVol = price > 0 ? (high24h - low24h) / price : vol;
  const volatility = Math.abs(change24h) + actualVol * 100;
  const riskLevel: LocalSignal["riskLevel"] =
    volatility < 3 ? "low" : volatility < 7 ? "medium" : volatility < 15 ? "high" : "extreme";

  // ── Trade levels (frozen-style, same math as the edge fn) ──
  const tfScale = timeframe === "daily" ? 1 : timeframe === "weekly" ? 2.5 : 5;
  const volMult = Math.max(actualVol, 0.01);
  const entryBuffer = volMult * 0.5 * tfScale;
  const slBuffer = volMult * 0.75 * tfScale;
  const tpBase = volMult * tfScale;

  // For a bearish lean the targets sit below price and the stop above.
  const dir = bias === "bearish" ? -1 : 1;
  const entryLow = price * (1 - entryBuffer);
  const entryHigh = price;
  const stopLoss = dir > 0
    ? Math.min(low24h * 0.99, price * (1 - slBuffer))
    : Math.max(high24h * 1.01, price * (1 + slBuffer));
  const tp1 = price * (1 + tpBase * dir);
  const tp2 = price * (1 + tpBase * 2 * dir);
  const tp3 = price * (1 + tpBase * 3 * dir);

  return {
    bias,
    confidence,
    probabilityBullish: Math.round(probabilityBullish),
    probabilityBearish: Math.round(100 - probabilityBullish),
    rsi: Math.round(rsi * 10) / 10,
    riskLevel,
    entryLow,
    entryHigh,
    stopLoss,
    tp1,
    tp2,
    tp3,
    macdTrend,
  };
}
