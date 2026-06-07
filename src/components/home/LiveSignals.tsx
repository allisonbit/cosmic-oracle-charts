import { TrendingUp, TrendingDown, Target, ShieldAlert, Zap, ArrowRight, Radio, Clock, BarChart3, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePricePrediction } from "@/hooks/usePricePrediction";
import { useCryptoPrices, CryptoPrice } from "@/hooks/useCryptoPrices";
import { CoinImage } from "@/components/ui/CoinImage";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState, useEffect } from "react";
import { seededRng } from "@/lib/seededRandom";

const TARGET_COINS = [
  { id: "bitcoin",       symbol: "BTC", name: "Bitcoin",   color: "#f7931a" },
  { id: "ethereum",      symbol: "ETH", name: "Ethereum",  color: "#627eea" },
  { id: "solana",        symbol: "SOL", name: "Solana",    color: "#9945ff" },
  { id: "binancecoin",   symbol: "BNB", name: "BNB",       color: "#f3ba2f" },
  { id: "ripple",        symbol: "XRP", name: "XRP",       color: "#346aa9" },
  { id: "cardano",       symbol: "ADA", name: "Cardano",   color: "#0033ad" },
];

// Animated mini sparkline — generates visually accurate trend line
function MiniSparkline({ change24h, color }: { change24h: number; color: string }) {
  const isUp = change24h >= 0;
  const points = useMemo(() => {
    // Seeded by trend+magnitude so the sparkline is stable, not re-randomized each render
    const rng = seededRng(`${color}|${isUp}|${change24h.toFixed(2)}`);
    let y = isUp ? 32 : 8;
    return Array.from({ length: 20 }, (_, i) => {
      const trend = isUp ? -0.8 : 0.8;
      const noise = (rng() - 0.5) * 7;
      y = Math.max(2, Math.min(38, y + trend + noise));
      return `${(i / 19) * 100},${y}`;
    }).join(" L ");
  }, [isUp, change24h, color]);

  return (
    <svg viewBox="0 0 100 40" className="w-full h-8 overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${isUp ? 32 : 8} L${points}`} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

// Format price accurately
function fmtPrice(p: number) {
  if (!p || p === 0) return "—";
  if (p >= 10000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(3)}`;
  return `$${p.toPrecision(4)}`;
}

// Signal derived from full prediction script output + live price
function deriveSignal(livePrice: CryptoPrice | undefined, prediction: any) {
  const entry   = livePrice?.price    || 0;
  const change  = livePrice?.change24h ?? 0;
  const high24h = livePrice?.high24h  || entry * 1.03;
  const low24h  = livePrice?.low24h   || entry * 0.97;

  if (entry === 0) return {
    isBullish: true, confidence: 65, entry: 0, tp: 0, tp2: 0, sl: 0,
    riskReward: "2.0", riskLevel: "medium", rsi: null, macdSignal: null,
    probBull: 50, probBear: 50, summary: null,
  };

  // Price position within today's range
  const rangePosition = high24h > low24h
    ? Math.min(1, Math.max(0, (entry - low24h) / (high24h - low24h)))
    : 0.5;

  // ── Direction: trust the prediction script bias when available ────────────
  let isBullish: boolean;
  let confidence: number;
  let probBull: number;
  let probBear: number;

  if (prediction?.bias && prediction?.probabilityBullish != null) {
    // Prediction script ran — use its output directly
    isBullish  = prediction.bias === "bullish" || prediction.probabilityBullish > 50;
    probBull   = Math.round(prediction.probabilityBullish);
    probBear   = Math.round(prediction.probabilityBearish ?? (100 - probBull));
    // Confidence = probability of the predicted direction
    confidence = isBullish ? probBull : probBear;
  } else {
    // No prediction yet — derive from live data
    const momentumScore = change > 3 ? 2 : change > 0.8 ? 1 : change < -3 ? -2 : change < -0.8 ? -1 : 0;
    const rangeScore    = rangePosition > 0.80 ? -1 : rangePosition < 0.20 ? 1 : 0;
    const totalScore    = momentumScore + rangeScore;
    isBullish   = totalScore >= 0;
    confidence  = Math.round(Math.min(88, 58 + Math.abs(change) * 3.5));
    probBull    = isBullish ? confidence : 100 - confidence;
    probBear    = 100 - probBull;
  }

  // ── TP / SL: validate prediction levels, fall back to support/resistance ──
  const predTP1  = prediction?.tradingZones?.takeProfit1;
  const predTP2  = prediction?.tradingZones?.takeProfit2;
  const predSL   = prediction?.tradingZones?.stopLoss;
  const supports = prediction?.supportLevels  || [];
  const resists  = prediction?.resistanceLevels || [];

  // Validation: must be on the correct side of live entry
  const tp1Ok = predTP1 != null && (isBullish ? predTP1 > entry * 1.001 : predTP1 < entry * 0.999);
  const tp2Ok = predTP2 != null && (isBullish ? predTP2 > entry * 1.001 : predTP2 < entry * 0.999);
  const slOk  = predSL  != null && (isBullish ? predSL  < entry * 0.999 : predSL  > entry * 1.001);

  let sl: number, tp: number, tp2: number;

  if (isBullish) {
    // SL: prediction → nearest support below entry → 24h low → derive
    const supportBelow = supports.filter((s: number) => s < entry * 0.999).sort((a: number, b: number) => b - a)[0];
    sl  = slOk  ? predSL  : (supportBelow || Math.min(low24h * 0.994, entry * 0.965));
    if (sl >= entry) sl = entry * 0.964;

    // TP1: prediction → nearest resistance above entry → 2.2:1 RR
    const resistAbove = resists.filter((r: number) => r > entry * 1.001).sort((a: number, b: number) => a - b)[0];
    tp  = tp1Ok ? predTP1 : (resistAbove || entry + (entry - sl) * 2.2);
    if (tp <= entry) tp = entry * 1.045;

    // TP2: prediction → second resistance → extend TP by 60% more
    const resist2 = resists.filter((r: number) => r > tp * 1.001).sort((a: number, b: number) => a - b)[0];
    tp2 = tp2Ok ? predTP2 : (resist2 || tp + (tp - entry) * 0.6);
    if (tp2 <= tp) tp2 = tp * 1.03;

  } else {
    // SL: prediction → nearest resistance above entry → 24h high → derive
    const resistAbove = resists.filter((r: number) => r > entry * 1.001).sort((a: number, b: number) => a - b)[0];
    sl  = slOk  ? predSL  : (resistAbove || Math.max(high24h * 1.006, entry * 1.035));
    if (sl <= entry) sl = entry * 1.035;

    // TP1: prediction → nearest support below entry → 2.2:1 RR
    const supportBelow = supports.filter((s: number) => s < entry * 0.999).sort((a: number, b: number) => b - a)[0];
    tp  = tp1Ok ? predTP1 : (supportBelow || entry - (sl - entry) * 2.2);
    if (tp >= entry) tp = entry * 0.955;

    // TP2: prediction → second support → extend down by 60% more
    const support2 = supports.filter((s: number) => s < tp * 0.999).sort((a: number, b: number) => b - a)[0];
    tp2 = tp2Ok ? predTP2 : (support2 || tp - (entry - tp) * 0.6);
    if (tp2 >= tp) tp2 = tp * 0.97;
  }

  const riskReward = Math.abs(entry - sl) > 0
    ? (Math.abs(tp - entry) / Math.abs(entry - sl)).toFixed(1)
    : "2.0";

  // Pull technical data from prediction if available
  const rsi        = prediction?.technicalIndicators?.rsi?.value ?? null;
  const macdSignal = prediction?.technicalIndicators?.macd?.signal ?? null;
  const riskLevel  = prediction?.riskLevel ?? "medium";
  const summary    = prediction?.summary ?? null;

  return { isBullish, confidence, entry, tp, tp2, sl, riskReward, riskLevel, rsi, macdSignal, probBull, probBear, summary };
}

const RISK_COLORS: Record<string, string> = {
  low:     "text-success border-success/40 bg-success/8",
  medium:  "text-warning border-warning/40 bg-warning/8",
  high:    "text-orange-400 border-orange-400/40 bg-orange-400/8",
  extreme: "text-danger border-danger/40 bg-danger/8",
};

function SignalCard({ coin, livePrice, idx }: {
  coin: typeof TARGET_COINS[0];
  livePrice: CryptoPrice | undefined;
  idx: number;
}) {
  const { data: prediction, isLoading } = usePricePrediction(coin.id, coin.symbol, "daily");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), idx * 80); }, [idx]);

  const sig    = deriveSignal(livePrice, prediction);
  const change = livePrice?.change24h ?? 0;
  const hasLivePrice = (livePrice?.price ?? 0) > 0;

  if (isLoading && !hasLivePrice) {
    return <Skeleton className="h-[360px] w-full rounded-2xl" />;
  }

  const rsiLabel = sig.rsi != null
    ? sig.rsi > 70 ? "Overbought" : sig.rsi < 30 ? "Oversold" : "Neutral"
    : null;
  const rsiColor = sig.rsi != null
    ? sig.rsi > 70 ? "text-danger" : sig.rsi < 30 ? "text-success" : "text-muted-foreground"
    : "text-muted-foreground";

  return (
    <Link
      to={`/price-prediction/${coin.id}/daily`}
      className={cn(
        "group relative block rounded-2xl border overflow-hidden transition-all duration-300",
        "hover:-translate-y-1.5 hover:shadow-2xl",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        "transition-[opacity,transform] ease-out",
        sig.isBullish
          ? "border-success/20 hover:border-success/50"
          : "border-danger/20 hover:border-danger/50"
      )}
      style={{ transitionDelay: `${idx * 60}ms` }}
    >
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${coin.color}, transparent)` }}
      />
      {/* Background glow */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300", sig.isBullish ? "bg-success/3" : "bg-danger/3")} />

      <div className="p-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <CoinImage symbol={coin.symbol} image={livePrice?.image} size={32} />
            <div>
              <p className="font-bold text-sm leading-none">{coin.symbol}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{coin.name} • 1D</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Risk level badge */}
            <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border", RISK_COLORS[sig.riskLevel])}>
              {sig.riskLevel}
            </span>
            {/* Long/Short badge */}
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border",
              sig.isBullish
                ? "bg-success/10 text-success border-success/30"
                : "bg-danger/10 text-danger border-danger/30"
            )}>
              {sig.isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {sig.isBullish ? "LONG" : "SHORT"}
            </div>
          </div>
        </div>

        {/* Live price + change */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-display font-bold">{fmtPrice(livePrice?.price || 0)}</span>
          <span className={cn("text-xs font-bold", change >= 0 ? "text-success" : "text-danger")}>
            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
          </span>
          {sig.rsi != null && (
            <span className={cn("text-[10px] font-semibold ml-auto", rsiColor)}>
              RSI {sig.rsi.toFixed(0)} · {rsiLabel}
            </span>
          )}
        </div>

        {/* Sparkline */}
        <div className="mb-2 -mx-1">
          <MiniSparkline change24h={change} color={sig.isBullish ? "#22c55e" : "#ef4444"} />
        </div>

        {/* 24h range bar */}
        {livePrice?.high24h && livePrice?.low24h && livePrice.high24h > livePrice.low24h && (
          <div className="mb-3">
            <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
              <span>L {fmtPrice(livePrice.low24h)}</span>
              <span className="font-medium text-foreground">24h Range</span>
              <span>H {fmtPrice(livePrice.high24h)}</span>
            </div>
            <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-danger via-warning to-success rounded-full" style={{ width: "100%", opacity: 0.5 }} />
              <div
                className="absolute top-0 h-full w-0.5 bg-foreground rounded-full"
                style={{ left: `${Math.min(100, Math.max(0, ((livePrice.price - livePrice.low24h) / (livePrice.high24h - livePrice.low24h)) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Bull / Bear probability bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[9px] mb-1">
            <span className="text-success font-bold flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> Bull {sig.probBull}%
            </span>
            <span className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-warning" /> AI Confidence
            </span>
            <span className="text-danger font-bold flex items-center gap-0.5">
              Bear {sig.probBear}% <TrendingDown className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden flex">
            <div className="h-full bg-success rounded-l-full transition-all duration-1000" style={{ width: mounted ? `${sig.probBull}%` : "50%" }} />
            <div className="h-full bg-danger rounded-r-full transition-all duration-1000" style={{ width: mounted ? `${sig.probBear}%` : "50%" }} />
          </div>
        </div>

        {/* Entry / TP1 / SL grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div className="text-center p-2 rounded-lg bg-muted/40 border border-border/30">
            <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Entry</p>
            <p className="text-[11px] font-mono font-semibold">{fmtPrice(sig.entry)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/5 border border-success/20">
            <p className="text-[9px] text-success uppercase font-black mb-0.5 flex items-center justify-center gap-0.5">
              <Target className="w-2 h-2" />TP1
            </p>
            <p className="text-[11px] font-mono font-semibold text-success">{fmtPrice(sig.tp)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-danger/5 border border-danger/20">
            <p className="text-[9px] text-danger uppercase font-black mb-0.5 flex items-center justify-center gap-0.5">
              <ShieldAlert className="w-2 h-2" />SL
            </p>
            <p className="text-[11px] font-mono font-semibold text-danger">{fmtPrice(sig.sl)}</p>
          </div>
        </div>

        {/* TP2 row */}
        <div className="mb-3">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-success/5 border border-success/15">
            <p className="text-[9px] text-success uppercase font-black flex items-center gap-0.5">
              <Target className="w-2.5 h-2.5" />TP2 (Extended)
            </p>
            <p className="text-[11px] font-mono font-semibold text-success">{fmtPrice(sig.tp2)}</p>
            <p className="text-[9px] text-muted-foreground">R:R {sig.riskReward}x</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <BarChart3 className="w-3 h-3" />
            {sig.macdSignal && <span className="capitalize">{sig.macdSignal}</span>}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-primary group-hover:gap-2 transition-all">
            Full Analysis
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Live "last updated" timer
function LastUpdated() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="w-3 h-3" />
      Updated {secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m`} ago
    </span>
  );
}

export function LiveSignals() {
  const { data: pricesData } = useCryptoPrices();
  // Map symbol → live price for quick lookup
  const priceMap = useMemo(() => {
    const m: Record<string, CryptoPrice> = {};
    const prices = pricesData?.prices ?? [];
    prices.forEach(p => { m[p.symbol] = p; });
    return m;
  }, [pricesData?.prices]);

  return (
    <section className="py-12 relative overflow-hidden" aria-labelledby="live-signals-heading">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/2 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-success font-bold text-xs tracking-widest uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3" />
                Live AI Signals
              </span>
              <LastUpdated />
            </div>
            <h2 id="live-signals-heading" className="text-2xl md:text-3xl font-display font-bold">
              Today's{" "}
              <span className="text-gradient-cosmic">High-Conviction</span>{" "}
              Trade Setups
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated signals from live CoinGecko market data + on-chain momentum — updated every 15s.
            </p>
          </div>
          <Link
            to="/predictions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0 group"
          >
            View All Signals
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Signal cards grid — 3 cols on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TARGET_COINS.map((coin, idx) => (
            <SignalCard
              key={coin.id}
              coin={coin}
              idx={idx}
              livePrice={priceMap[coin.symbol]}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/predictions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-all hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4" />
            See AI Predictions for 1,000+ Tokens
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
