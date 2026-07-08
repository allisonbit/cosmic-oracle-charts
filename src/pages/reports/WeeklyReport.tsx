import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import { SocialShare } from "@/components/ui/social-share";
import { AdBreak } from "@/components/ads/AdBreak";
import { AdsterraStickyBanner } from "@/components/ads/AdsterraStickyBanner";
import { LazyAd } from "@/components/ads/LazyAd";
import { AdsterraNative } from "@/components/ads/AdsterraNative";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp, TrendingDown, BarChart3, Calendar, ArrowRight,
  Shield, Activity, Target
} from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { useStrengthMeter } from "@/hooks/useStrengthMeter";
import { supabase } from "@/integrations/supabase/client";

function getWeekSlug(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-w${String(week).padStart(2, "0")}`;
}

function fmtLargeNum(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  return n.toLocaleString();
}

function pct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function fgLabel(n: number): string {
  if (n >= 75) return "Extreme Greed";
  if (n >= 55) return "Greed";
  if (n >= 45) return "Neutral";
  if (n >= 25) return "Fear";
  return "Extreme Fear";
}

export default function WeeklyReport() {
  const { slug } = useParams<{ slug: string }>();
  const currentSlug = slug || getWeekSlug();

  const { data: stored } = useQuery({
    queryKey: ["weekly-report", currentSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_reports")
        .select("*")
        .eq("slug", currentSlug)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    retry: 1,
    staleTime: 60_000 * 30,
  });

  const { data: market, isLoading: marketLoading } = useMarketData();
  const { data: strength } = useStrengthMeter("24h");

  const isLoading = marketLoading;
  const weekLabel = currentSlug.replace("-w", " Week ");

  const gainers = market?.topCoins
    ?.slice()
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 10) ?? [];
  const losers = market?.topCoins
    ?.slice()
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 10) ?? [];

  const bullishCount = market?.topCoins?.filter(c => c.change24h > 0).length ?? 0;
  const totalCoins = market?.topCoins?.length ?? 0;
  const breadth = totalCoins > 0 ? bullishCount / totalCoins : 0.5;
  const marketMood = breadth > 0.65 ? "bullish" : breadth < 0.35 ? "bearish" : "mixed";

  const topStrength = strength?.assets?.slice(0, 5) ?? [];
  const weakest = strength?.assets?.slice(-5).reverse() ?? [];

  const title = `State of Crypto — ${weekLabel} | Oracle Bull`;
  const description = `Weekly crypto market report for ${weekLabel}. Top gainers, losers, sentiment analysis, strongest assets, and AI prediction accuracy review.`;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: `State of Crypto — ${weekLabel}`,
    description,
    datePublished: new Date().toISOString(),
    publisher: {
      "@type": "Organization",
      name: "Oracle Bull",
      url: "https://oraclebull.com",
    },
    about: {
      "@type": "Thing",
      name: "Cryptocurrency Market",
    },
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO />
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://oraclebull.com/reports/${currentSlug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span>Reports</span>
            <span>/</span>
            <span className="text-foreground">{weekLabel}</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{today}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            State of Crypto — {weekLabel}
          </h1>
          <p className="text-muted-foreground text-lg">
            Weekly market intelligence report covering price action, sentiment, top movers, and asset strength analysis.
          </p>

          <SocialShare
            title={`State of Crypto — ${weekLabel}`}
            description={description}
            url={`https://oraclebull.com/reports/${currentSlug}`}
            className="mt-3"
          />
        </div>

        <LazyAd>
          <AdBreak />
        </LazyAd>

        {/* Market Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Market Overview
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : market ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl p-4 border">
                <div className="text-xs text-muted-foreground mb-1">Total Market Cap</div>
                <div className="text-xl font-bold">${fmtLargeNum(market.global.totalMarketCap)}</div>
                <div className={`text-sm font-medium ${market.global.marketCapChange24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {pct(market.global.marketCapChange24h)}
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border">
                <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                <div className="text-xl font-bold">${fmtLargeNum(market.global.totalVolume24h)}</div>
              </div>
              <div className="bg-card rounded-xl p-4 border">
                <div className="text-xs text-muted-foreground mb-1">BTC Dominance</div>
                <div className="text-xl font-bold">{market.global.btcDominance.toFixed(1)}%</div>
              </div>
              <div className="bg-card rounded-xl p-4 border">
                <div className="text-xs text-muted-foreground mb-1">Fear & Greed</div>
                <div className="text-xl font-bold">{market.fearGreedIndex}</div>
                <div className="text-sm text-muted-foreground">{fgLabel(market.fearGreedIndex)}</div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Market Mood Narrative */}
        {market && (
          <section className="mb-8 bg-card rounded-xl p-6 border">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Market Mood
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The crypto market is currently in a <strong className={marketMood === "bullish" ? "text-green-500" : marketMood === "bearish" ? "text-red-500" : "text-yellow-500"}>{marketMood}</strong> state
              with {bullishCount} of {totalCoins} tracked assets in the green.
              Total market capitalization sits at <strong>${fmtLargeNum(market.global.totalMarketCap)}</strong>,
              {market.global.marketCapChange24h >= 0 ? " up " : " down "}
              <strong>{Math.abs(market.global.marketCapChange24h).toFixed(2)}%</strong> over the past 24 hours.
              The Fear & Greed Index reads <strong>{market.fearGreedIndex}</strong> ({fgLabel(market.fearGreedIndex)}),
              with Bitcoin commanding <strong>{market.global.btcDominance.toFixed(1)}%</strong> market dominance.
            </p>
            {breadth > 0.7 && (
              <p className="text-muted-foreground mt-2 text-sm">
                ⚠️ With over 70% of assets in the green, the market may be overextended. Watch for potential profit-taking.
              </p>
            )}
            {breadth < 0.3 && (
              <p className="text-muted-foreground mt-2 text-sm">
                ⚠️ With less than 30% of assets positive, the market shows significant weakness. This could signal capitulation or a buying opportunity.
              </p>
            )}
          </section>
        )}

        {/* Top Gainers & Losers */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Gainers
            </h2>
            <div className="bg-card rounded-xl border divide-y">
              {isLoading ? (
                [1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 mx-4 my-2" />)
              ) : gainers.map((coin, i) => (
                <Link
                  key={coin.symbol}
                  to={`/price-prediction/${coin.id || coin.symbol.toLowerCase()}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    {coin.image && <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />}
                    <div>
                      <div className="font-medium text-sm">{coin.name}</div>
                      <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 font-mono">
                    {pct(coin.change24h)}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Top Losers
            </h2>
            <div className="bg-card rounded-xl border divide-y">
              {isLoading ? (
                [1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 mx-4 my-2" />)
              ) : losers.map((coin, i) => (
                <Link
                  key={coin.symbol}
                  to={`/price-prediction/${coin.id || coin.symbol.toLowerCase()}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    {coin.image && <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />}
                    <div>
                      <div className="font-medium text-sm">{coin.name}</div>
                      <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-red-500/10 text-red-500 font-mono">
                    {pct(coin.change24h)}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <LazyAd>
          <AdsterraNative />
        </LazyAd>

        {/* Strength Analysis */}
        {topStrength.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Strength Analysis
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Strongest Assets</h3>
                <div className="bg-card rounded-xl border divide-y">
                  {topStrength.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{asset.name}</span>
                        <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${asset.strengthScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-green-500">{asset.strengthScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Weakest Assets</h3>
                <div className="bg-card rounded-xl border divide-y">
                  {weakest.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{asset.name}</span>
                        <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${asset.strengthScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-red-500">{asset.strengthScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Key Takeaways */}
        {market && (
          <section className="mb-8 bg-card rounded-xl p-6 border">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Key Takeaways
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  {gainers[0]?.name ?? "Top gainer"} led the market with a{" "}
                  <strong className="text-green-500">{pct(gainers[0]?.change24h ?? 0)}</strong> move,
                  {gainers[0]?.change24h > 10 ? " a standout breakout worth monitoring for continuation." :
                   gainers[0]?.change24h > 5 ? " showing strong momentum." : " a steady upward trend."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  {losers[0]?.name ?? "Biggest loser"} dropped{" "}
                  <strong className="text-red-500">{pct(losers[0]?.change24h ?? 0)}</strong>,
                  {losers[0]?.change24h < -10 ? " a sharp decline that could present a buying opportunity if support holds." :
                   " underperforming the broader market this period."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  Market sentiment at <strong>{market.fearGreedIndex}</strong> ({fgLabel(market.fearGreedIndex)}) suggests
                  {market.fearGreedIndex > 70 ? " potential overheating — consider taking partial profits on extended positions." :
                   market.fearGreedIndex < 30 ? " elevated fear — historically a better entry point for long-term positions." :
                   " balanced conditions — suitable for selective position building."}
                </span>
              </li>
              {topStrength[0] && (
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>{topStrength[0].name}</strong> ranks as the strongest asset with a score of{" "}
                    <strong className="text-green-500">{topStrength[0].strengthScore}/100</strong>,
                    outperforming BTC by <strong>{topStrength[0].relativeStrengthVsBTC.toFixed(1)}%</strong>.
                  </span>
                </li>
              )}
            </ul>
          </section>
        )}

        <LazyAd>
          <AdBreak />
        </LazyAd>

        {/* Internal Links */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Explore More</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to: "/predictions", label: "AI Predictions", icon: "🎯" },
              { to: "/crypto-strength-meter", label: "Strength Meter", icon: "💪" },
              { to: "/dashboard", label: "Live Dashboard", icon: "📊" },
              { to: "/accuracy", label: "Accuracy Record", icon: "✅" },
              { to: "/sentiment", label: "Sentiment Analysis", icon: "🧠" },
              { to: "/news", label: "Crypto News", icon: "📰" },
              { to: "/compare", label: "Compare Coins", icon: "⚖️" },
              { to: "/market-recap", label: "Daily Recap", icon: "📋" },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="bg-card rounded-xl border p-3 text-center hover:bg-accent/50 transition-colors"
              >
                <div className="text-xl mb-1">{link.icon}</div>
                <div className="text-xs font-medium">{link.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-8 text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 border">
          <strong>Disclaimer:</strong> This report is auto-generated from live market data and is for informational purposes only. It does not constitute financial advice. Cryptocurrency investments carry substantial risk. Always do your own research (DYOR) before making investment decisions.
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
      <AdsterraStickyBanner />
    </div>
  );
}
