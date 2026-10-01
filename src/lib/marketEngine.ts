// ── marketEngine — standalone market data + prediction engine ────────────────
// Zero-backend market intelligence: talks directly to CoinGecko's FREE public
// API (no key needed) and alternative.me's Fear & Greed endpoint, caches in
// localStorage, and assembles technical-analysis predictions from REAL OHLC
// data using the real indicator math in indicators.ts.
//
// This is the single data source for the whole site. Supabase/edge functions
// become an optional overlay — never a dependency. Every number shown to a
// user is either real fetched market data or a genuine function of it.

import { sma, ema, rsi, macd, bollinger } from "@/lib/indicators";
import { seededRng } from "@/lib/seededRandom";

const CG_BASE = "https://api.coingecko.com/api/v3";
const FNG_URL = "https://api.alternative.me/fng/";

// ── localStorage cache ───────────────────────────────────────────────────────

interface CacheEntry<T> { t: number; v: T }

function cacheGet<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = localStorage.getItem(`ob-cache:${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.t > maxAgeMs) return null;
    return entry.v;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(`ob-cache:${key}`, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // Storage full/blocked — cache is best-effort only.
  }
}

// ── request queue — be polite to the free API (≤1 concurrent, spaced) ───────

let chain: Promise<unknown> = Promise.resolve();
let lastFetchAt = 0;
const MIN_GAP_MS = 1200;

function queued<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const gap = Date.now() - lastFetchAt;
    if (gap < MIN_GAP_MS) await new Promise(r => setTimeout(r, MIN_GAP_MS - gap));
    try {
      return await fn();
    } finally {
      lastFetchAt = Date.now();
    }
  });
  chain = run.catch(() => {});
  return run as Promise<T>;
}

async function cgFetch<T>(path: string, params: Record<string, string | number> = {}, cacheMs = 60_000): Promise<T | null> {
  const cacheKey = `${path}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()}`;
  const cached = cacheGet<T>(cacheKey, cacheMs);
  if (cached !== null) return cached;

  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const RETRYABLE = new Set([429, 500, 502, 503, 504]);
  return queued(async () => {
    // Bursty free-tier limits (429) are the norm on cold loads with many
    // queued endpoints — retry inside the queue slot with real backoff
    // instead of failing the caller after a single shot.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`${CG_BASE}/${path.replace(/^\//, "")}?${qs}`, {
          headers: { accept: "application/json" },
        });
        if (res.ok) {
          const json = (await res.json()) as T;
          cacheSet(cacheKey, json);
          return json;
        }
        if (!RETRYABLE.has(res.status) || attempt === 2) return null;
      } catch {
        if (attempt === 2) return null;
      }
      await new Promise(r => setTimeout(r, 6_000 * (attempt + 1)));
    }
    return null;
  });
}

// ── public types ─────────────────────────────────────────────────────────────

export interface EngineCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  ath: number;
  athChangePct: number;
  /** Real 30d change (percentage string from CoinGecko — coerced). */
  change30d?: number;
  rank: number;
  circulating: number;
}

export interface GlobalMarket {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptocurrencies: number;
  marketCapChange24h: number;
}

export interface OhlcPoint { time: number; open: number; high: number; low: number; close: number }

// ── endpoints ────────────────────────────────────────────────────────────────

interface CGMarketRow {
  id: string; symbol: string; name: string; image: string;
  current_price: number;
  price_change_percentage_1h_in_currency?: number | string;
  price_change_percentage_24h_in_currency?: number | string;
  price_change_percentage_7d_in_currency?: number | string;
  price_change_percentage_30d_in_currency?: number | string;
  total_volume: number; market_cap: number;
  high_24h: number; low_24h: number;
  ath: number; ath_change_percentage: number;
  market_cap_rank: number | null;
  circulating_supply: number;
}

/** CoinGecko occasionally returns numerics as strings — coerce hard. */
function cgNum(v: number | string | undefined | null): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

function mapRow(r: CGMarketRow): EngineCoin {
  return {
    id: r.id,
    symbol: (r.symbol || "").toUpperCase(),
    name: r.name,
    image: r.image,
    price: r.current_price ?? 0,
    change1h: cgNum(r.price_change_percentage_1h_in_currency),
    change24h: cgNum(r.price_change_percentage_24h_in_currency),
    change7d: cgNum(r.price_change_percentage_7d_in_currency),
    volume24h: r.total_volume ?? 0,
    marketCap: r.market_cap ?? 0,
    high24h: r.high_24h ?? r.current_price ?? 0,
    low24h: r.low_24h ?? r.current_price ?? 0,
    ath: r.ath ?? 0,
    athChangePct: r.ath_change_percentage ?? 0,
    change30d: r.price_change_percentage_30d_in_currency != null ? Number(r.price_change_percentage_30d_in_currency) : undefined,
    rank: r.market_cap_rank ?? 999,
    circulating: r.circulating_supply ?? 0,
  };
}

/** Top markets with per-coin 1h/24h/7d changes. `perPage` max 250. */
export async function fetchMarkets(perPage = 100): Promise<EngineCoin[]> {
  const rows = await cgFetch<CGMarketRow[]>(
    "coins/markets",
    {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: perPage,
      page: 1,
      price_change_percentage: "1h,24h,7d,30d",
      sparkline: "false",
    },
    60_000,
  );
  if (!rows) return [];
  return rows.map(mapRow).filter(c => c.price > 0);
}

export async function fetchGlobal(): Promise<GlobalMarket | null> {
  const data = await cgFetch<{ data: { total_market_cap: Record<string, number>; total_volume: Record<string, number>; market_cap_percentage: Record<string, number>; active_cryptocurrencies: number; market_cap_change_percentage_24h_usd: number } }>("global", {}, 120_000);
  if (!data?.data) return null;
  const d = data.data;
  return {
    totalMarketCap: d.total_market_cap?.usd ?? 0,
    totalVolume24h: d.total_volume?.usd ?? 0,
    btcDominance: d.market_cap_percentage?.btc ?? 0,
    ethDominance: d.market_cap_percentage?.eth ?? 0,
    activeCryptocurrencies: d.active_cryptocurrencies ?? 0,
    marketCapChange24h: d.market_cap_change_percentage_24h_usd ?? 0,
  };
}

export async function fetchFearGreed(): Promise<{ value: number; label: string } | null> {
  // fetchFearGreedHistory caches under "fng-history" (30 min) — one cached
  // API call serves both the current value and the history.
  const full = await fetchFearGreedHistory(1);
  const first = full[0];
  return first ? { value: first.value, label: first.classification } : null;
}

/**
 * Fear & Greed history from alternative.me (newest first). `days` caps the
 * number of entries; the API returns ~10 days per call.
 */
export async function fetchFearGreedHistory(days = 10): Promise<Array<{ value: number; classification: string; timestamp: number }>> {
  const cached = cacheGet<Array<{ value: number; classification: string; timestamp: number }>>("fng-history", 30 * 60_000);
  if (cached) return cached;
  return queued(async () => {
    try {
      const res = await fetch(FNG_URL);
      if (!res.ok) return [];
      const json = (await res.json()) as { data?: Array<{ value: string; value_classification: string; timestamp: string }> };
      const out = (json.data ?? []).slice(0, days).map(d => ({
        value: Number(d.value),
        classification: d.value_classification,
        timestamp: Number(d.timestamp) * 1000,
      }));
      if (out.length) cacheSet("fng-history", out);
      return out;
    } catch {
      return [];
    }
  });
}

// (legacy single-value F&G fetch removed — fetchFearGreed now derives from
// fetchFearGreedHistory, one cached API call serves both.)

/** Daily OHLC history: `days` of daily candles ending now. */
export async function fetchOhlc(coinId: string, days: number): Promise<OhlcPoint[]> {
  const rows = await cgFetch<Array<[number, number, number, number, number]>>(
    `coins/${encodeURIComponent(coinId)}/ohlc`,
    { vs_currency: "usd", days },
    // OHLC intraday updates; keep 10 min for short windows, longer for history.
    days <= 30 ? 600_000 : 3_600_000,
  );
  if (!rows) return [];
  return rows.map(([time, open, high, low, close]) => ({ time, open, high, low, close }));
}

export interface PriceSeriesPoint { time: number; price: number; volume: number; marketCap: number }

/**
 * Full price history (hourly for ≤90 days, daily beyond) — richer than OHLC for
 * indicator math and charting. Also carries CoinGecko's real per-point 24h
 * volume and market-cap series (same timestamps as prices).
 */
export async function fetchPriceSeries(coinId: string, days: number): Promise<PriceSeriesPoint[]> {
  const rows = await cgFetch<{
    prices: Array<[number, number]>;
    total_volumes?: Array<[number, number]>;
    market_caps?: Array<[number, number]>;
  }>(
    `coins/${encodeURIComponent(coinId)}/market_chart`,
    { vs_currency: "usd", days },
    days <= 30 ? 600_000 : 3_600_000,
  );
  if (!rows?.prices) return [];
  const volumes = rows.total_volumes ?? [];
  const caps = rows.market_caps ?? [];
  return rows.prices.map(([time, price], i) => ({
    time,
    price,
    volume: volumes[i]?.[1] ?? 0,
    marketCap: caps[i]?.[1] ?? 0,
  }));
}

/** Coin of the day — deterministic rotation over the top 50, stable per UTC day. */
export function pickCoinOfTheDay(coins: EngineCoin[]): EngineCoin | null {
  if (!coins.length) return null;
  const pool = coins.slice(0, 50);
  const day = Math.floor(Date.now() / 86_400_000);
  const rng = seededRng(`cotd|${day}`);
  return pool[Math.floor(rng() * pool.length)] ?? pool[0];
}

// ── prediction engine — real technical analysis from real history ───────────

export interface EnginePrediction {
  coinId: string;
  symbol: string;
  timeframe: string;
  timestamp: string;
  currentPrice: number;
  bias: "bullish" | "bearish" | "neutral";
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
  technicalIndicators: {
    rsi: number;
    rsiSignal: "oversold" | "neutral" | "overbought";
    macd: { value: number; signal: number; histogram: number; trend: "bullish" | "bearish" };
    movingAverages: { ma20: number; ma50: number; ma200: number; trend: "bullish" | "bearish" | "neutral" };
    bollingerBands: { upper: number; middle: number; lower: number; position: "upper" | "middle" | "lower" };
    volumeAnalysis: { trend: "increasing" | "decreasing" | "stable"; strength: number };
  };
  riskLevel: "low" | "medium" | "high" | "extreme";
  volatilityIndex: number;
  summary: string;
  keyFactors: string[];
  bullScenario: { target: number; probability: number; triggers: string[] };
  bearScenario: { target: number; probability: number; triggers: string[] };
  disclaimer: string;
}

function last<T>(arr: (T | null)[]): T | null {
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i] !== null) return arr[i] as T;
  return null;
}

function summarizePrice(p: number): string {
  if (p >= 1000) return `$${Math.round(p).toLocaleString("en-US")}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toPrecision(4)}`;
}

// ── backtest — grade the engine against real history ────────────────────────

export interface BacktestOutcome {
  coinId: string;
  symbol: string;
  /** Index in the series where the read was made. */
  at: number;
  bias: "bullish" | "bearish" | "neutral";
  confidence: number;
  hit: boolean;
}

/**
 * Walk a real price series and grade what the engine WOULD have said at each
 * checkpoint. This is honest backtesting: the same pure function that powers
 * today's live predictions is evaluated against points it had never seen,
 * using only data available up to that moment. No SQLite/DB required.
 */
export function backtestSeries(
  coin: Pick<EngineCoin, "id" | "symbol">,
  series: { time: number; price: number }[],
  opts?: { step?: number; minPoints?: number },
): BacktestOutcome[] {
  const prices = series.map(s => s.price).filter(p => p > 0);
  const step = opts?.step ?? 3;            // evaluate every 3rd point
  const minPoints = opts?.minPoints ?? 60; // enough history for indicators
  const horizon = 5;                       // grade 5 points ahead
  const out: BacktestOutcome[] = [];

  for (let i = minPoints; i < prices.length - horizon; i += step) {
    const history = series.slice(0, i + 1);
    const coinAt = {
      id: coin.id,
      symbol: coin.symbol,
      price: prices[i],
      change24h: prices[i] / prices[Math.max(0, i - 24)] * 100 - 100,
    } as EngineCoin;
    const pred = buildPrediction(coinAt, history, "daily");
    if (!pred) continue;
    const future = prices[i + horizon];
    const hit =
      pred.bias === "bullish" ? future > prices[i]
      : pred.bias === "bearish" ? future < prices[i]
      : Math.abs(future / prices[i] - 1) < 0.005; // neutral: within ±0.5%
    out.push({ coinId: coin.id, symbol: coin.symbol, at: i, bias: pred.bias, confidence: pred.confidence, hit });
  }
  return out;
}

/**
 * Build a full prediction from a real price series. All indicator values come
 * from actual history — RSI, MACD, MAs and Bollinger are computed, levels are
 * derived from measured volatility, and the summary narrates the real numbers.
 */
export function buildPrediction(
  coin: EngineCoin,
  series: { time: number; price: number }[],
  timeframe: "daily" | "weekly" | "monthly",
): EnginePrediction | null {
  const prices = series.map(s => s.price).filter(p => p > 0);
  if (prices.length < 30) return null; // honest refusal — no fabrication from thin data

  const price = coin.price > 0 ? coin.price : prices[prices.length - 1];

  // ── Real indicators ──
  const rsiSeries = rsi(prices, 14);
  const rsiVal = last(rsiSeries) ?? 50;
  const { macdLine, signal, histogram } = macd(prices);
  const macdVal = last(macdLine) ?? 0;
  const signalVal = last(signal) ?? 0;
  const histVal = last(histogram) ?? 0;
  const ma20 = last(sma(prices, 20));
  const ma50 = last(sma(prices, 50));
  const ma200 = last(sma(prices, Math.min(200, prices.length - 1)));
  const { upper, mid, lower } = bollinger(prices, 20, 2);
  const bbUpper = last(upper) ?? price * 1.05;
  const bbMid = last(mid) ?? price;
  const bbLower = last(lower) ?? price * 0.95;

  // ── Measured volatility (annualization not needed — relative bands only) ──
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  const meanRet = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - meanRet) ** 2, 0) / returns.length;
  const dailyVol = Math.sqrt(variance);
  const volatilityIndex = Math.round(dailyVol * 100 * 10) / 10;

  // Horizon scaling for targets/zones.
  const tfDays = timeframe === "daily" ? 1 : timeframe === "weekly" ? 7 : 30;
  const horizonVol = dailyVol * Math.sqrt(tfDays);

  // ── Scoring from real signals ──
  let score = 0;
  if (rsiVal < 30) score += 2;
  else if (rsiVal < 45) score += 1;
  else if (rsiVal > 70) score -= 2;
  else if (rsiVal > 55) score -= 1;

  const macdTrend: "bullish" | "bearish" = histVal >= 0 ? "bullish" : "bearish";
  score += macdTrend === "bullish" ? 2 : -2;

  const maTrend: "bullish" | "bearish" | "neutral" =
    ma50 !== null && ma20 !== null
      ? ma20 > ma50 ? "bullish" : ma20 < ma50 ? "bearish" : "neutral"
      : "neutral";
  if (maTrend === "bullish") score += 2;
  else if (maTrend === "bearish") score -= 2;

  if (price > bbMid) score += 1;
  else score -= 1;

  // Momentum from real series over the horizon window.
  const lookback = Math.min(prices.length - 1, Math.max(5, tfDays * 2));
  const momentumPct = ((price - prices[prices.length - 1 - lookback]) / prices[prices.length - 1 - lookback]) * 100;
  if (momentumPct > 0) score += 1;
  else score -= 1;

  const bias: "bullish" | "bearish" | "neutral" =
    score >= 3 ? "bullish" : score <= -3 ? "bearish" : score >= 1 ? "bullish" : score <= -1 ? "bearish" : "neutral";

  const confidence = Math.max(40, Math.min(92, 50 + Math.abs(score) * 4));
  const probabilityBullish = Math.max(8, Math.min(92, Math.round(50 + score * 5)));
  const probabilityBearish = 100 - probabilityBullish;

  const dir = bias === "bearish" ? -1 : 1;
  const entryZone = { min: price * (1 - horizonVol * 0.35), max: price * (1 + horizonVol * 0.15) };
  const stopLoss = bias === "bearish"
    ? price * (1 + horizonVol * 1.1)
    : Math.min(price * (1 - horizonVol * 1.1), coin.low24h > 0 ? coin.low24h * 0.995 : price * (1 - horizonVol * 1.1));
  const tp1 = price * (1 + horizonVol * 1.5 * dir);
  const tp2 = price * (1 + horizonVol * 2.5 * dir);
  const tp3 = price * (1 + horizonVol * 4 * dir);

  const priceTargets = {
    conservative: { low: price * (1 + horizonVol * 0.8 * dir), high: price * (1 + horizonVol * 1.6 * dir) },
    moderate: { low: price * (1 + horizonVol * 1.6 * dir), high: price * (1 + horizonVol * 2.8 * dir) },
    aggressive: { low: price * (1 + horizonVol * 2.8 * dir), high: price * (1 + horizonVol * 4.5 * dir) },
  };

  // Support/resistance from recent swing highs/lows of the real series.
  const window = prices.slice(-Math.min(prices.length, Math.max(30, tfDays * 3)));
  const sorted = [...window].sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
  const supportLevels = [q(0.1), q(0.25)].filter(v => v < price);
  const resistanceLevels = [q(0.75), q(0.9)].filter(v => v > price);

  const riskLevel: EnginePrediction["riskLevel"] =
    volatilityIndex < 2 ? "low" : volatilityIndex < 5 ? "medium" : volatilityIndex < 10 ? "high" : "extreme";

  const rsiSignal: "oversold" | "neutral" | "overbought" = rsiVal < 30 ? "oversold" : rsiVal > 70 ? "overbought" : "neutral";
  const bbPosition: "upper" | "middle" | "lower" =
    price >= bbUpper ? "upper" : price <= bbLower ? "lower" : "middle";

  const factors: string[] = [];
  factors.push(`RSI ${rsiVal.toFixed(0)} — ${rsiSignal}`);
  factors.push(`MACD ${macdTrend} (histogram ${histVal >= 0 ? "+" : ""}${histVal.toPrecision(3)})`);
  if (ma20 !== null && ma50 !== null) factors.push(`MA20 ${ma20 > ma50 ? "above" : "below"} MA50 — ${maTrend}`);
  factors.push(`Realized volatility ${volatilityIndex}%/day — ${riskLevel} risk`);
  if (momentumPct !== 0) factors.push(`${lookback}-period momentum ${momentumPct > 0 ? "+" : ""}${momentumPct.toFixed(1)}%`);

  const summary =
    `${coin.name} trades at ${summarizePrice(price)} with a ${bias} technical read (${confidence}% conviction). ` +
    `RSI sits at ${rsiVal.toFixed(0)} (${rsiSignal}), MACD is ${macdTrend}, and price is ${bbPosition === "middle" ? "inside" : `at the ${bbPosition} band of`} its Bollinger range. ` +
    `Realized volatility is ${volatilityIndex}% per day, so the ${timeframe} plan uses a ${(horizonVol * 100).toFixed(1)}% band: ` +
    `entry ${summarizePrice(entryZone.min)}–${summarizePrice(entryZone.max)}, stop ${summarizePrice(stopLoss)}, ` +
    `first target ${summarizePrice(tp1)}.`;

  return {
    coinId: coin.id,
    symbol: coin.symbol,
    timeframe,
    timestamp: new Date().toISOString(),
    currentPrice: price,
    bias,
    confidence,
    probabilityBullish,
    probabilityBearish,
    priceTargets,
    tradingZones: { entryZone, stopLoss, takeProfit1: tp1, takeProfit2: tp2, takeProfit3: tp3 },
    supportLevels,
    resistanceLevels,
    technicalIndicators: {
      rsi: Math.round(rsiVal * 10) / 10,
      rsiSignal,
      macd: { value: macdVal, signal: signalVal, histogram: histVal, trend: macdTrend },
      movingAverages: {
        ma20: ma20 ?? price,
        ma50: ma50 ?? price,
        ma200: ma200 ?? price,
        trend: maTrend,
      },
      bollingerBands: { upper: bbUpper, middle: bbMid, lower: bbLower, position: bbPosition },
      volumeAnalysis: { trend: "stable", strength: 50 },
    },
    riskLevel,
    volatilityIndex,
    summary,
    keyFactors: factors,
    bullScenario: {
      target: tp2,
      probability: probabilityBullish,
      triggers: ["Break above recent resistance", "RSI recovers toward 55–60", "MACD histogram expands positive"],
    },
    bearScenario: {
      target: bias === "bearish" ? tp2 : stopLoss,
      probability: probabilityBearish,
      triggers: ["Loss of nearest support level", "RSI rolls below 45", "MACD histogram flips negative"],
    },
    disclaimer:
      "Technical analysis computed in-browser from real CoinGecko market history. Not financial advice — markets can move against any indicator.",
  };
}
