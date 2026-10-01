import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, Activity, ChevronRight, Radio, Gamepad2, ShieldCheck, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMarketData } from "@/hooks/useMarketData";
import { CoinImage } from "@/components/ui/CoinImage";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { cn } from "@/lib/utils";

// Format price nicely
function fmt(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toPrecision(4)}`;
}

// Fear & Greed band → label + color. Real index, 0–100.
function fngBand(v: number): { label: string; cls: string } {
  if (v < 25) return { label: "Extreme Fear", cls: "text-danger" };
  if (v < 45) return { label: "Fear", cls: "text-warning" };
  if (v <= 55) return { label: "Neutral", cls: "text-muted-foreground" };
  if (v <= 75) return { label: "Greed", cls: "text-success" };
  return { label: "Extreme Greed", cls: "text-success" };
}

// ── Lean editorial masthead ────────────────────────────────────────────────
// Identity is compact, live data leads. The status line carries the real
// pulse (UTC clock, Fear & Greed, global cap); a micro-trust row replaces
// the old standalone trust strip; search and live chips stay prominent.
export function HeroSection() {
  const { data } = useCryptoPrices();
  const { data: marketData } = useMarketData();
  const topCoins = data?.prices?.slice(0, 8) || [];
  const chipCoins = ["BTC", "ETH", "SOL", "BNB", "XRP"]
    .map((s) => topCoins.find((c) => c.symbol === s))
    .filter(Boolean)
    .slice(0, 5);

  const global = marketData?.global;
  const fng = marketData?.fearGreedIndex ?? null;
  const fngInfo = fng !== null ? fngBand(fng) : null;

  // Live clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="border-b border-border/30"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Live status line — real market pulse */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-success">
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE
          </span>
          <span className="text-muted-foreground font-mono">
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" })} UTC
          </span>
          {global && (
            <>
              <span className="text-border">·</span>
              <span className="text-muted-foreground">
                Cap <strong className="text-foreground font-mono">${(global.totalMarketCap / 1e12).toFixed(2)}T</strong>
                {" "}
                <span className={cn("font-semibold", (global.marketCapChange24h ?? 0) >= 0 ? "text-success" : "text-danger")}>
                  {(global.marketCapChange24h ?? 0) >= 0 ? "+" : ""}{(global.marketCapChange24h ?? 0).toFixed(1)}%
                </span>
              </span>
            </>
          )}
          {fng !== null && fngInfo && (
            <>
              <span className="text-border">·</span>
              <Link to="/sentiment" className="inline-flex items-center gap-1 hover:underline">
                <Timer className="w-3 h-3 text-muted-foreground" />
                Fear &amp; Greed <strong className={cn("font-bold", fngInfo.cls)}>{fng}</strong>
                <span className={cn("font-semibold", fngInfo.cls)}>{fngInfo.label}</span>
              </Link>
            </>
          )}
          <span className="text-border hidden sm:inline">·</span>
          <Link to="/predictions" className="hidden sm:inline-flex items-center gap-1 text-primary hover:underline">
            <Sparkles className="w-3 h-3" />
            AI predictions updating
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Compact value line — H1 kept for SEO/crawler parity, but tight */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-3xl">
            <h1
              id="hero-heading"
              className="text-[clamp(1.6rem,3.6vw,2.6rem)] font-display font-extrabold leading-[1.1] tracking-tight text-foreground"
            >
              Free AI Crypto <span className="text-gradient-cosmic">Price Predictions</span> &amp; Market Intelligence
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Live predictions, on-chain signals and sentiment for{" "}
              <strong className="text-foreground">1,000+ tokens</strong> across 8 chains —{" "}
              <span className="text-primary font-semibold">free, no signup</span>.
            </p>
          </div>

          {/* CTAs — dashboard is the workhorse, the daily game is the hook */}
          <nav className="flex flex-wrap gap-2 shrink-0" aria-label="Primary actions">
            <Button asChild size="lg" className="h-11 px-5 text-sm font-semibold rounded-lg">
              <Link to="/dashboard">
                <Activity className="w-4 h-4 mr-2" aria-hidden="true" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5 text-sm font-semibold rounded-lg">
              <Link to="/game">
                <Gamepad2 className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                Daily Game
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-11 px-4 text-sm font-semibold rounded-lg">
              <Link to="/predictions">
                <Sparkles className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                Predictions
              </Link>
            </Button>
          </nav>
        </div>

        {/* Prominent search */}
        <div className="mt-5 w-full max-w-2xl">
          <GlobalSearch />
        </div>

        {/* Micro-trust row — the old trust strip, folded above the fold */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {[
            "No signup needed",
            "Free forever",
            "Every prediction graded publicly",
            "1,000+ tokens · 8 chains",
          ].map((item) => (
            <span key={item} className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" />
              {item}
            </span>
          ))}
        </div>

        {/* Live price chips — inline, borderless */}
        {chipCoins.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {chipCoins.map((coin) => {
              if (!coin) return null;
              const up = coin.change24h >= 0;
              return (
                <Link
                  key={coin.symbol}
                  to={`/price-prediction/${coin.symbol.toLowerCase()}/daily`}
                  className="flex items-center gap-1.5 group"
                >
                  <CoinImage symbol={coin.symbol} image={coin.image} size={18} />
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{coin.symbol}</span>
                  <span className="text-xs font-mono text-muted-foreground">{fmt(coin.price)}</span>
                  <span className={cn("text-[11px] font-semibold flex items-center gap-0.5", up ? "text-success" : "text-danger")}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {up ? "+" : ""}{coin.change24h.toFixed(2)}%
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
