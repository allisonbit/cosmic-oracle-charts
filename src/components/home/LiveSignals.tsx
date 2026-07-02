import { TrendingUp, TrendingDown, Target, ShieldAlert, Zap, ArrowRight, Radio, Clock, BarChart3, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCanonicalSetup } from "@/hooks/useCanonicalSetup";
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

function MiniSparkline({ change24h, color }: { change24h: number; color: string }) {
  const isUp = change24h >= 0;
  const points = useMemo(() => {
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

function fmtPrice(p: number) {
  if (!p || p === 0) return "—";
  if (p >= 10000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(3)}`;
  return `$${p.toPrecision(4)}`;
}

function toSignal(canonical: ReturnType<typeof useCanonicalSetup>) {
  const isBullish =
    canonical.bias === "bullish" ||
    (canonical.bias === "neutral" && canonical.probabilityBullish >= 50);
  const entry = canonical.entryHigh || canonical.lastPrice || 0;
  const tp = canonical.tp1;
  const tp2 = canonical.tp2;
  const sl = canonical.stopLoss;
  const riskReward = Math.abs(entry - sl) > 0
    ? (Math.abs(tp - entry) / Math.abs(entry - sl)).toFixed(1)
    : "2.0";
  const ti = canonical.prediction?.technicalIndicators;
  return {
    isBullish,
    confidence: canonical.confidence,
    entry,
    tp,
    tp2,
    sl,
    riskReward,
    riskLevel: canonical.riskLevel,
    rsi: typeof ti?.rsi === "number" ? ti.rsi : null,
    macdSignal: ti?.macd?.trend ?? null,
    probBull: canonical.probabilityBullish,
    probBear: canonical.probabilityBearish,
  };
}

const RISK_COLORS: Record<string, string> = {
  low:     "text-success border-success/40",
  medium:  "text-warning border-warning/40",
  high:    "text-orange-400 border-orange-400/40",
  extreme: "text-danger border-danger/40",
};

function SignalCard({ coin, livePrice, idx }: {
  coin: typeof TARGET_COINS[0];
  livePrice: CryptoPrice | undefined;
  idx: number;
}) {
  const canonical = useCanonicalSetup(coin.id, coin.symbol, "daily", {
    live: livePrice ? {
      price: livePrice.price,
      change24h: livePrice.change24h,
      high24h: livePrice.high24h,
      low24h: livePrice.low24h,
      volume24h: livePrice.volume24h,
      marketCap: livePrice.marketCap,
    } : undefined,
  });
  const isLoading = canonical.isLoading;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), idx * 80); }, [idx]);

  const sig    = toSignal(canonical);
  const change = livePrice?.change24h ?? 0;
  const hasLivePrice = (livePrice?.price ?? 0) > 0;

  if (isLoading && !hasLivePrice) {
    return <Skeleton className="h-80 w-full" />;
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
        "group relative block border-t overflow-hidden transition-colors py-5",
        "hover:bg-muted/20",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        "transition-[opacity,transform,background-color] ease-out",
        sig.isBullish ? "border-success/30" : "border-danger/30"
      )}
      style={{
        transitionDelay: `${idx * 60}ms`,
        borderTopColor: coin.color + "44",
      }}
    >
      {/* Thin top accent line */}
      <div className="h-0.5 w-full absolute top-0 left-0"
        style={{ background: `linear-gradient(90deg, ${coin.color}, transparent)` }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CoinImage symbol={coin.symbol} image={livePrice?.image} size={28} />
          <div>
            <p className="font-bold text-sm leading-none">{coin.symbol}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{coin.name} · Daily</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border", RISK_COLORS[sig.riskLevel])}>
            {sig.riskLevel}
          </span>
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border",
            sig.isBullish ? "text-success border-success/30" : "text-danger border-danger/30"
          )}>
            {sig.isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {sig.isBullish ? "LONG" : "SHORT"}
          </div>
        </div>
      </div>

      {/* Live price */}
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

      {/* Bull/Bear probability bar */}
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

      {/* Entry / TP1 / SL — inline labels, no boxes */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
          <p className="section-label mb-0.5">Entry</p>
          <p className="text-[11px] font-mono font-semibold">{fmtPrice(sig.entry)}</p>
        </div>
        <div className="text-center">
          <p className="section-label mb-0.5 text-success flex items-center justify-center gap-0.5">
            <Target className="w-2 h-2" />TP1
          </p>
          <p className="text-[11px] font-mono font-semibold text-success">{fmtPrice(sig.tp)}</p>
        </div>
        <div className="text-center">
          <p className="section-label mb-0.5 text-danger flex items-center justify-center gap-0.5">
            <ShieldAlert className="w-2 h-2" />SL
          </p>
          <p className="text-[11px] font-mono font-semibold text-danger">{fmtPrice(sig.sl)}</p>
        </div>
      </div>

      {/* TP2 row */}
      <div className="mb-3 flex items-center justify-between border-t border-border/20 pt-2">
        <p className="text-[9px] text-success font-bold flex items-center gap-0.5">
          <Target className="w-2.5 h-2.5" />TP2 (Extended)
        </p>
        <p className="text-[11px] font-mono font-semibold text-success">{fmtPrice(sig.tp2)}</p>
        <p className="text-[9px] text-muted-foreground">R:R {sig.riskReward}x</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <BarChart3 className="w-3 h-3" />
          {sig.macdSignal && <span className="capitalize">{sig.macdSignal}</span>}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-primary group-hover:gap-2 transition-all">
          Full Analysis
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}

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
  const priceMap = useMemo(() => {
    const m: Record<string, CryptoPrice> = {};
    const prices = pricesData?.prices ?? [];
    prices.forEach(p => { m[p.symbol] = p; });
    return m;
  }, [pricesData?.prices]);

  return (
    <section className="py-12" aria-labelledby="live-signals-heading">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="section-header mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
            <span className="section-label flex items-center gap-1.5">
              <Radio className="w-3 h-3" />
              Live AI Signals
            </span>
            <LastUpdated />
          </div>
          <Link
            to="/predictions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0 group"
          >
            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 id="live-signals-heading" className="text-2xl md:text-3xl font-display font-bold">
              Today's <span className="text-gradient-cosmic">High-Conviction</span> Trade Setups
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              AI-generated signals from live CoinGecko market data + on-chain momentum — updated every 15s.
            </p>
          </div>
        </div>

        {/* Signal grid — 3 cols desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
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
        <div className="mt-8 pt-6 border-t border-border/30">
          <Link
            to="/predictions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline group"
          >
            <Zap className="w-4 h-4" />
            See AI Predictions for 1,000+ Tokens
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
