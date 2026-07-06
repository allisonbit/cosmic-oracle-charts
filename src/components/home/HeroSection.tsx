import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, Activity, ChevronRight, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { CoinImage } from "@/components/ui/CoinImage";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { cn } from "@/lib/utils";

// Format price nicely
function fmt(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toPrecision(4)}`;
}

// ── Lean editorial masthead ────────────────────────────────────────────────
// TechCrunch-style: identity is compact, content leads. No full-screen hero,
// no cards. Just a live status line, a tight value line, prominent search and
// live price chips — then the newsroom below takes over.
export function HeroSection() {
  const { data } = useCryptoPrices();
  const topCoins = data?.prices?.slice(0, 8) || [];
  const chipCoins = ["BTC", "ETH", "SOL", "BNB", "XRP"]
    .map((s) => topCoins.find((c) => c.symbol === s))
    .filter(Boolean)
    .slice(0, 5);

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
        {/* Live status line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-success">
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE
          </span>
          <span className="text-muted-foreground font-mono">
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC
          </span>
          <span className="text-border">·</span>
          <Link to="/predictions" className="inline-flex items-center gap-1 text-primary hover:underline">
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
              Live predictions, whale tracking and sentiment for{" "}
              <strong className="text-foreground">1,000+ tokens</strong> across 8 chains —{" "}
              <span className="text-primary font-semibold">free, no signup</span>.
            </p>
          </div>

          {/* CTAs */}
          <nav className="flex gap-2 shrink-0" aria-label="Primary actions">
            <Button asChild size="lg" className="h-11 px-5 text-sm font-semibold rounded-lg">
              <Link to="/dashboard">
                <Activity className="w-4 h-4 mr-2" aria-hidden="true" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5 text-sm font-semibold rounded-lg">
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
