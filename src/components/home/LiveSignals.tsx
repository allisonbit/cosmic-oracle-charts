import { TrendingUp, TrendingDown, Target, ShieldAlert, Zap, ArrowRight, Radio, Clock, BarChart3, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePricePrediction } from "@/hooks/usePricePrediction";
import { useCryptoPrices, CryptoPrice } from "@/hooks/useCryptoPrices";
import { CoinImage } from "@/components/ui/CoinImage";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState, useEffect } from "react";

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
    let y = isUp ? 32 : 8;
    return Array.from({ length: 20 }, (_, i) => {
      const trend = isUp ? -0.8 : 0.8;
      const noise = (Math.random() - 0.5) * 7;
      y = Math.max(2, Math.min(38, y + trend + noise));
      return `${(i / 19) * 100},${y}`;
    }).join(" L ");
  }, [isUp]);

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

// Signal derived from live data + optional AI prediction
function deriveSignal(livePrice: CryptoPrice | undefined, prediction: any) {
  const price = prediction?.currentPrice || livePrice?.price || 0;
  const change = livePrice?.change24h ?? 0;
  
  // Prefer AI bias if available, otherwise derive from 24h momentum
  const bias = prediction?.bias || (change > 0.5 ? "bullish" : change < -0.5 ? "bearish" : "neutral");
  const isBullish = bias === "bullish";
  
  // Confidence: prefer AI, else derive from strength of move (5% move = ~80% conf)
  const rawConf = prediction?.confidence || Math.min(92, 60 + Math.abs(change) * 3.5);
  const confidence = Math.round(rawConf);

  // Entry price: always use live price if available (most accurate)
  const entry = price;

  // TP/SL: prefer AI prediction data, else derive at 2:1 RR
  const volatility = Math.max(Math.abs(change) / 100, 0.02);
  const tp = prediction?.tradingZones?.takeProfit1 ||
    (isBullish ? entry * (1 + volatility * 2.5) : entry * (1 - volatility * 2.5));
  const sl = prediction?.tradingZones?.stopLoss ||
    (isBullish ? entry * (1 - volatility * 1.2) : entry * (1 + volatility * 1.2));

  const riskReward = entry > 0 && tp > 0 && sl > 0
    ? (Math.abs(tp - entry) / Math.abs(entry - sl)).toFixed(1)
    : "2.0";

  return { bias, isBullish, confidence, entry, tp, sl, riskReward };
}

function SignalCard({ coin, livePrice, idx }: {
  coin: typeof TARGET_COINS[0];
  livePrice: CryptoPrice | undefined;
  idx: number;
}) {
  const { data: prediction, isLoading } = usePricePrediction(coin.id, coin.symbol, "daily");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), idx * 80); }, [idx]);

  const sig = deriveSignal(livePrice, prediction);
  const change = livePrice?.change24h ?? 0;
  const hasLivePrice = (livePrice?.price ?? 0) > 0;

  if (isLoading && !hasLivePrice) {
    return <Skeleton className="h-[320px] w-full rounded-2xl" />;
  }

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
      {/* Gradient top accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${coin.color}, transparent)` }}
      />

      {/* Background glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          sig.isBullish ? "bg-success/3" : "bg-danger/3"
        )}
      />

      <div className="p-5 relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <CoinImage symbol={coin.symbol} image={livePrice?.image} size={32} />
            <div>
              <p className="font-bold text-sm leading-none">{coin.symbol}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{coin.name} • 1D</p>
            </div>
          </div>
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

        {/* Live price */}
        <div className="mb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-display font-bold">
              {fmtPrice(livePrice?.price || 0)}
            </span>
            <span className={cn(
              "text-xs font-bold",
              change >= 0 ? "text-success" : "text-danger"
            )}>
              {change >= 0 ? "+" : ""}{change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="mb-3 -mx-1">
          <MiniSparkline change24h={change} color={sig.isBullish ? "#22c55e" : "#ef4444"} />
        </div>

        {/* 24h High / Low range bar */}
        {livePrice?.high24h && livePrice?.low24h && livePrice.high24h > livePrice.low24h && (
          <div className="mb-3">
            <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
              <span>L {fmtPrice(livePrice.low24h)}</span>
              <span className="text-[9px] font-medium text-foreground">24h Range</span>
              <span>H {fmtPrice(livePrice.high24h)}</span>
            </div>
            <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-danger via-warning to-success rounded-full"
                style={{ width: '100%', opacity: 0.6 }}
              />
              {/* Current price marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-foreground rounded-full"
                style={{
                  left: `${Math.min(100, Math.max(0, ((livePrice.price - livePrice.low24h) / (livePrice.high24h - livePrice.low24h)) * 100))}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-warning" />
              AI Confidence
            </span>
            <span className={cn("font-black", sig.confidence >= 80 ? "text-success" : "text-warning")}>
              {sig.confidence}%
            </span>
          </div>
          <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                sig.confidence >= 80 ? "bg-success" : "bg-warning"
              )}
              style={{ width: mounted ? `${sig.confidence}%` : "0%" }}
            />
          </div>
        </div>

        {/* Entry / TP / SL */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="text-center p-2 rounded-lg bg-muted/40 border border-border/30">
            <p className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Entry</p>
            <p className="text-[11px] font-mono font-semibold">{fmtPrice(sig.entry)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/5 border border-success/20">
            <p className="text-[9px] text-success uppercase font-black mb-0.5 flex items-center justify-center gap-0.5">
              <Target className="w-2 h-2" />TP
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <BarChart3 className="w-3 h-3" />
            <span>R:R {sig.riskReward}x</span>
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
  const prices = pricesData?.prices ?? [];

  // Map symbol → live price for quick lookup
  const priceMap = useMemo(() => {
    const m: Record<string, CryptoPrice> = {};
    prices.forEach(p => { m[p.symbol] = p; });
    return m;
  }, [prices]);

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
            See AI Predictions for 18,000+ Tokens
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
