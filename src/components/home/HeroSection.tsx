import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Users, TrendingUp, TrendingDown, CheckCircle, Activity, Zap, ChevronRight, Radio, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import cosmicOracle from "@/assets/oracle-bull-logo.jpg";
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

export function HeroSection() {
  const { data } = useCryptoPrices();
  const topCoins = data?.prices?.slice(0, 5) || [];
  const btc = topCoins.find(c => c.symbol === "BTC") || topCoins[0];
  const eth = topCoins.find(c => c.symbol === "ETH") || topCoins[1];
  const sol = topCoins.find(c => c.symbol === "SOL") || topCoins[2];

  // Live clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Preload LCP image
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = cosmicOracle;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  const topMover = topCoins.length > 0
    ? topCoins.reduce((a, b) => Math.abs(a.change24h) > Math.abs(b.change24h) ? a : b)
    : null;

  const livePriceCoins = [btc, eth, sol].filter(Boolean);

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden pt-8 pb-10 md:pt-14 md:pb-12"
      aria-labelledby="hero-heading"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-background" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" aria-hidden="true" />
      {/* Blur orbs — static (no animation) for smooth 60fps on all devices */}
      <div className="blur-orb absolute top-0 right-0 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-primary/6 rounded-full blur-[80px] md:blur-[110px] translate-x-1/3 -translate-y-1/4" aria-hidden="true" />
      <div className="blur-orb absolute bottom-0 left-0 w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-secondary/8 rounded-full blur-[60px] md:blur-[90px] -translate-x-1/4 translate-y-1/4" aria-hidden="true" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-6 items-center">

          {/* ═══ LEFT: TEXT + CTA ═══ */}
          <article className="text-center lg:text-left space-y-6 animate-fade-in flex flex-col items-center lg:items-start">

            {/* Live Market Status Bar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
                <Radio className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
              <span className="text-xs text-muted-foreground">
                {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC
              </span>
              <Link to="/predictions" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Sparkles className="w-3 h-3" />
                AI Predictions Updating
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Live Price Chips — shows real data from API */}
            {livePriceCoins.length > 0 && (
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {livePriceCoins.map((coin) => {
                  if (!coin) return null;
                  const up = coin.change24h >= 0;
                  return (
                    <Link
                      key={coin.symbol}
                      to={`/price-prediction/${coin.symbol.toLowerCase()}/daily`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40 hover:border-primary/40 hover:bg-muted transition-all group"
                    >
                      <CoinImage symbol={coin.symbol} image={coin.image} size={18} />
                      <span className="text-xs font-bold text-foreground">{coin.symbol}</span>
                      <span className="text-xs font-mono text-foreground">{fmt(coin.price)}</span>
                      <span className={cn("text-[11px] font-semibold flex items-center gap-0.5", up ? "text-success" : "text-danger")}>
                        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {up ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Headline — matches the prerendered/indexed H1 for crawler/user parity */}
            <h1 id="hero-heading" className="text-[clamp(2.2rem,5vw,4rem)] font-display font-extrabold leading-[1.07] tracking-tight text-foreground">
              Free AI Crypto{" "}
              <span className="text-gradient-cosmic">Price Predictions</span>
              <br className="hidden sm:block" />
              {" "}& Market Intelligence
            </h1>

            <p className="text-[clamp(0.95rem,2vw,1.2rem)] text-muted-foreground max-w-xl leading-relaxed">
              Real-time price predictions, on-chain intelligence, whale tracking and sentiment analysis for{" "}
              <strong className="text-foreground">Bitcoin, Ethereum, Solana and 1,000+ tokens</strong> across 8 blockchains —{" "}
              <span className="text-primary font-semibold">completely free, no signup</span>.
            </p>

            {/* Prominent search — CoinGecko-style primary discovery anchor */}
            <div className="w-full max-w-xl">
              <GlobalSearch />
            </div>

            {/* CTA Buttons */}
            <nav className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto" aria-label="Primary actions">
              <Button asChild size="lg" className="h-13 px-7 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_hsl(var(--primary))] transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/dashboard">
                  <Activity className="w-4 h-4 mr-2" aria-hidden="true" />
                  Launch Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-13 px-7 text-sm font-semibold rounded-xl border-border/50 bg-background/50 backdrop-blur-md hover:bg-accent transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/predictions">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                  AI Predictions
                </Link>
              </Button>
            </nav>

            {/* Trust Badges — only honest, verifiable claims */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              {[
                { icon: Shield, label: "No signup needed" },
                { icon: CheckCircle, label: "Free forever" },
                { icon: Users, label: "1,000+ tokens tracked" },
                { icon: BarChart3, label: "8 blockchains" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </article>

          {/* ═══ RIGHT: MASCOT + LIVE DATA WIDGETS ═══ */}
          <figure className="relative flex flex-col items-center mt-8 lg:mt-0 lg:ml-auto w-full max-w-[480px] lg:max-w-none">

            {/* Orb + mascot */}
            <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] flex items-center justify-center">

              {/* Orbital rings */}
              <div className="absolute inset-0 rounded-full border border-primary/10 animate-[spin_22s_linear_infinite]" />
              <div className="absolute inset-6 rounded-full border border-secondary/10 animate-[spin_16s_linear_infinite_reverse]" />
              <div className="absolute inset-14 rounded-full border border-primary/5 animate-[spin_30s_linear_infinite]" />

              {/* Mascot */}
              <div className="relative w-[72%] h-[72%] rounded-full overflow-hidden shadow-[0_0_80px_-20px_hsl(var(--primary))] border border-primary/20 z-10 float">
                <img
                  src={cosmicOracle}
                  alt="OracleBull AI"
                  className="w-full h-full object-cover scale-[1.02]"
                  loading="eager"
                  decoding="async"
                  {...({ fetchpriority: "high" } as any)}
                  width={448}
                  height={448}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" aria-hidden="true" />
              </div>

              {/* Floating widget 1 — Live BTC price (real data) */}
              {btc && (
                <Link
                  to="/price-prediction/bitcoin/daily"
                  className="absolute top-2 left-0 sm:-left-2 z-20 glass-panel p-3 rounded-xl border border-border/50 shadow-xl float animate-fade-in hover:border-primary/40 transition-colors"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-medium">BTC/USD Live</span>
                  </div>
                  <div className="text-base font-bold text-foreground">{fmt(btc.price)}</div>
                  <div className={cn("text-[11px] font-semibold flex items-center gap-0.5 mt-0.5", btc.change24h >= 0 ? "text-success" : "text-danger")}>
                    {btc.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {btc.change24h >= 0 ? "+" : ""}{btc.change24h.toFixed(2)}% 24h
                  </div>
                </Link>
              )}

              {/* Floating widget 2 — Top mover signal (real data) */}
              {topMover && (
                <Link
                  to={`/price-prediction/${topMover.symbol.toLowerCase()}/daily`}
                  className="absolute bottom-10 right-0 sm:-right-2 z-20 glass-panel p-3 rounded-xl border border-border/50 shadow-xl float-delayed animate-fade-in hover:border-primary/40 transition-colors"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground font-medium">Top Mover 24h</span>
                  </div>
                  <div className="text-sm font-bold text-foreground">{topMover.symbol}</div>
                  <div className={cn("text-[11px] font-bold flex items-center gap-0.5 mt-0.5", topMover.change24h >= 0 ? "text-success" : "text-danger")}>
                    {topMover.change24h >= 0 ? "+" : ""}{topMover.change24h.toFixed(2)}%
                  </div>
                </Link>
              )}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
