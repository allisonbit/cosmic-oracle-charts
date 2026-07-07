import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import {
  TrendingUp, TrendingDown, ChevronRight, ArrowRight,
  BarChart3, Activity, AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialShare } from "@/components/ui/social-share";
import { AdsterraNative } from "@/components/ads/AdsterraNative";
import { AdUnit } from "@/components/ads/AdUnit";
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";
import { AdsterraBanner300 } from "@/components/ads/AdsterraBanner300";
import { AdsterraBanner320 } from "@/components/ads/AdsterraBanner320";
import { AdsterraSmartlink } from "@/components/ads/AdsterraSmartlink";
import { useMarketData } from "@/hooks/useMarketData";
import type { TopCoin } from "@/hooks/useMarketData";

export default function MarketRecap() {
  const { data: market, isLoading, error } = useMarketData();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const title = `Crypto Market Recap — ${today} | Oracle Bull`;
  const description = `Daily crypto market summary for ${today}. Total market cap, BTC dominance, top gainers & losers, Fear & Greed Index, and AI-powered analysis.`;

  const gainers = market?.topCoins
    ?.slice()
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 5) ?? [];
  const losers = market?.topCoins
    ?.slice()
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 5) ?? [];

  const bullishCount = market?.topCoins?.filter((c) => c.change24h > 0).length ?? 0;
  const totalCoins = market?.topCoins?.length ?? 0;
  const breadth = totalCoins > 0 ? bullishCount / totalCoins : 0.5;
  const marketMood = breadth > 0.65 ? "bullish" : breadth < 0.35 ? "bearish" : "mixed";

  const fgLabel = (n: number) =>
    n >= 75 ? "Extreme Greed" : n >= 55 ? "Greed" : n >= 45 ? "Neutral" : n >= 25 ? "Fear" : "Extreme Fear";

  const faq = [
    {
      q: "How is the crypto market today?",
      a: market
        ? `The total crypto market cap is $${fmtLargeNum(market.global.totalMarketCap)} with $${fmtLargeNum(market.global.totalVolume24h)} in 24-hour volume. BTC dominance is ${market.global.btcDominance.toFixed(1)}% and the Fear & Greed Index reads ${market.fearGreedIndex} (${fgLabel(market.fearGreedIndex)}).`
        : "Loading market data...",
    },
    {
      q: "What are the top crypto gainers today?",
      a: gainers.length > 0
        ? `Today's top gainers include ${gainers.slice(0, 3).map((c) => `${c.name} (${c.symbol.toUpperCase()}) at ${pct(c.change24h)}`).join(", ")}.`
        : "Loading...",
    },
    {
      q: "Is the crypto market bullish or bearish?",
      a: market
        ? `Market breadth shows ${bullishCount} of ${totalCoins} tracked coins are positive today, indicating a ${marketMood} environment. The Fear & Greed Index at ${market.fearGreedIndex} confirms this reading.`
        : "Loading...",
    },
    {
      q: "How accurate is the Fear & Greed Index?",
      a: "The Fear & Greed Index aggregates volatility, momentum, social media, surveys, dominance, and trends. It's a sentiment gauge, not a prediction — extreme readings often precede reversals but timing is uncertain.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO
        title={title}
        description={description}
        keywords="crypto market today, crypto market recap, bitcoin today, crypto gainers, crypto losers, fear and greed index, crypto daily update"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: `Crypto Market Recap — ${today}`,
            datePublished: new Date().toISOString().split("T")[0],
            dateModified: new Date().toISOString(),
            author: { "@type": "Organization", name: "Oracle Bull", url: "https://oraclebull.com" },
            publisher: { "@type": "Organization", name: "Oracle Bull", url: "https://oraclebull.com" },
            description,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <header>
        <Navbar />
      </header>

      <main className="flex-1 container mx-auto px-4 py-24 md:py-32">
        <AdUnit format="horizontal" className="my-2 max-w-5xl mx-auto" />
        <AdsterraSmartlink variant="banner" className="my-3 max-w-5xl mx-auto" />
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Market Recap</span>
          </nav>

          {/* Hero */}
          <section className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <Activity className="w-3 h-3 mr-1" />
              Daily Market Recap
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="glow-text">Crypto Market Recap — {today}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A daily summary of the cryptocurrency market including total market cap, top gainers and losers,
              Fear & Greed Index, and AI-powered market analysis.
            </p>
          </section>

          {/* Loading */}
          {isLoading && (
            <div className="holo-card p-6 mb-8 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {error && !isLoading && (
            <div className="holo-card p-6 mb-8 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground">Unable to load market data. Please try again later.</p>
            </div>
          )}

          {market && (
            <>
              {/* Global Stats */}
              <section className="holo-card p-6 md:p-8 mb-8">
                <h2 className="text-lg font-display font-bold mb-4">Market Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total Market Cap</div>
                    <div className="font-mono font-bold">${fmtLargeNum(market.global.totalMarketCap)}</div>
                    <div className={`text-xs ${market.global.marketCapChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {pct(market.global.marketCapChange24h)} 24h
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
                    <div className="font-mono font-bold">${fmtLargeNum(market.global.totalVolume24h)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">BTC Dominance</div>
                    <div className="font-mono font-bold">{market.global.btcDominance.toFixed(1)}%</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Fear & Greed</div>
                    <div className="font-mono font-bold">{market.fearGreedIndex}</div>
                    <div className="text-xs text-muted-foreground">{fgLabel(market.fearGreedIndex)}</div>
                  </div>
                </div>

                {/* Narrative */}
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
                  <p>
                    The total cryptocurrency market cap stands at ${fmtLargeNum(market.global.totalMarketCap)},
                    {market.global.marketCapChange24h >= 0
                      ? ` up ${pct(market.global.marketCapChange24h)} over the past 24 hours. `
                      : ` down ${pct(market.global.marketCapChange24h)} over the past 24 hours. `
                    }
                    24-hour trading volume reached ${fmtLargeNum(market.global.totalVolume24h)}.
                    Bitcoin dominance is at {market.global.btcDominance.toFixed(1)}%
                    {market.global.btcDominance > 55
                      ? ", indicating capital concentration in BTC — a risk-off signal that often precedes altcoin weakness."
                      : market.global.btcDominance < 45
                      ? ", suggesting capital is rotating into altcoins — historically a sign of an advancing altseason."
                      : ", sitting in the middle of its typical range — no strong rotation signal in either direction."
                    }
                  </p>
                  <p>
                    The Fear & Greed Index reads {market.fearGreedIndex} ({fgLabel(market.fearGreedIndex)}).
                    {market.fearGreedIndex >= 75
                      ? " Extreme greed readings have historically preceded short-term pullbacks. Euphoria-driven buying tends to fade, and traders should be cautious about chasing momentum."
                      : market.fearGreedIndex >= 55
                      ? " Greedy conditions typically fuel trend continuation, though profit-taking can accelerate at these levels."
                      : market.fearGreedIndex >= 45
                      ? " Neutral sentiment means the market lacks conviction in either direction. This often resolves with a catalyst-driven move."
                      : market.fearGreedIndex >= 25
                      ? " Fear is elevated, which historically creates buying opportunities for long-term investors willing to enter against the crowd."
                      : " Extreme fear is contrarian-bullish — the deepest fear readings have historically coincided with local bottoms."
                    }
                  </p>
                  <p>
                    Market breadth: {bullishCount} of {totalCoins} tracked coins are positive today ({(breadth * 100).toFixed(0)}% green).
                    {breadth > 0.7
                      ? " Broad participation suggests genuine risk appetite rather than a narrow rally."
                      : breadth > 0.5
                      ? " Slightly positive breadth indicates selective buying — check which sectors are leading."
                      : breadth > 0.3
                      ? " More losers than gainers today, suggesting defensive positioning across the market."
                      : " Very weak breadth points to broad selling pressure — only a handful of coins are holding gains."
                    }
                  </p>
                </div>
              </section>

              {/* Gainers & Losers */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <section className="holo-card p-6">
                  <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" /> Top Gainers
                  </h2>
                  <div className="space-y-3">
                    {gainers.map((c) => (
                      <CoinRow key={c.symbol} coin={c} />
                    ))}
                  </div>
                </section>
                <section className="holo-card p-6">
                  <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-400" /> Top Losers
                  </h2>
                  <div className="space-y-3">
                    {losers.map((c) => (
                      <CoinRow key={c.symbol} coin={c} />
                    ))}
                  </div>
                </section>
              </div>

              {/* Trending */}
              {market.trending.length > 0 && (
                <section className="holo-card p-6 md:p-8 mb-8">
                  <h2 className="text-lg font-display font-bold mb-4">Trending Coins</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {market.trending.map((t) => (
                      <div key={t.symbol} className="bg-muted/30 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm">{t.symbol.toUpperCase()}</div>
                          <div className="text-xs text-muted-foreground">{t.name}</div>
                        </div>
                        <div className={`text-sm font-mono ${t.priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {pct(t.priceChange)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Market Analysis */}
              <section className="holo-card p-6 md:p-8 mb-8">
                <h2 className="text-lg font-display font-bold mb-4">Market Analysis — {today}</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
                  <p>
                    {marketMood === "bullish"
                      ? `Today's market session is broadly bullish with ${bullishCount} of ${totalCoins} coins in the green. The overall market cap increased ${pct(market.global.marketCapChange24h)}, driven by strong volume of $${fmtLargeNum(market.global.totalVolume24h)}. This kind of broad participation typically signals genuine risk appetite rather than a narrow, unsustainable rally.`
                      : marketMood === "bearish"
                      ? `The market is under pressure today with only ${bullishCount} of ${totalCoins} tracked coins in positive territory. Total market cap moved ${pct(market.global.marketCapChange24h)} as sellers dominated the session. Weak breadth like this often precedes further downside unless volume spikes on a reversal candle.`
                      : `Mixed signals dominate today's session. Market breadth is nearly split with ${bullishCount} of ${totalCoins} coins gaining. The total market cap changed ${pct(market.global.marketCapChange24h)}, and volume at $${fmtLargeNum(market.global.totalVolume24h)} is moderate. In consolidation environments like this, the next strong move — either direction — tends to be decisive.`
                    }
                  </p>
                  {gainers.length > 0 && (
                    <p>
                      Leading the gainers is {gainers[0].name} ({gainers[0].symbol.toUpperCase()}) with a {pct(gainers[0].change24h)} move.
                      {gainers.length > 1 && (
                        <> {gainers[1].name} follows at {pct(gainers[1].change24h)}</>
                      )}
                      {gainers.length > 2 && (
                        <>, and {gainers[2].name} rounds out the top three at {pct(gainers[2].change24h)}</>
                      )}.
                      {gainers[0].change24h > 10
                        ? " Double-digit moves like this often attract momentum traders — but they also carry reversal risk."
                        : " Gains are measured, suggesting controlled accumulation rather than a speculative spike."
                      }
                    </p>
                  )}
                  {losers.length > 0 && losers[0].change24h < 0 && (
                    <p>
                      On the downside, {losers[0].name} ({losers[0].symbol.toUpperCase()}) dropped {pct(losers[0].change24h)}
                      {losers.length > 1 && losers[1].change24h < 0 && (
                        <>, followed by {losers[1].name} at {pct(losers[1].change24h)}</>
                      )}.
                      {losers[0].change24h < -10
                        ? " Sharp declines of this magnitude can signal capitulation — which paradoxically creates the conditions for a snapback rally."
                        : " Moderate losses suggest orderly selling rather than panic."
                      }
                    </p>
                  )}
                  <p>
                    Traders should monitor the{" "}
                    <Link to="/sentiment" className="text-primary hover:underline">market sentiment dashboard</Link> for real-time
                    shifts and the{" "}
                    <Link to="/crypto-strength-meter" className="text-primary hover:underline">crypto strength meter</Link> to identify
                    relative leaders and laggards. For individual coin forecasts, explore the{" "}
                    <Link to="/predictions" className="text-primary hover:underline">AI predictions hub</Link>.
                  </p>
                </div>
              </section>

              {/* Share */}
              <div className="mb-8">
                <SocialShare
                  title={`Crypto Market Recap — ${today}`}
                  description={`Market cap: $${fmtLargeNum(market.global.totalMarketCap)} (${pct(market.global.marketCapChange24h)}). Fear & Greed: ${market.fearGreedIndex}. Top gainer: ${gainers[0]?.name ?? "N/A"} ${pct(gainers[0]?.change24h)}.`}
                  url="https://oraclebull.com/market-recap"
                />
              </div>
            </>
          )}

          {/* Quick Links */}
          <section className="holo-card p-6 mb-8">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Quick Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Link to="/today/bitcoin" className="text-primary hover:underline flex items-center gap-1">
                Bitcoin Today <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/today/ethereum" className="text-primary hover:underline flex items-center gap-1">
                Ethereum Today <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/today/solana" className="text-primary hover:underline flex items-center gap-1">
                Solana Today <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/predictions" className="text-primary hover:underline flex items-center gap-1">
                AI Predictions Hub <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/sentiment" className="text-primary hover:underline flex items-center gap-1">
                Market Sentiment <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/crypto-strength-meter" className="text-primary hover:underline flex items-center gap-1">
                Crypto Strength Meter <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/bitcoin-liquidation-heatmap" className="text-primary hover:underline flex items-center gap-1">
                Liquidation Heatmap <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/compare" className="text-primary hover:underline flex items-center gap-1">
                Compare Coins <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="holo-card p-6 mb-8">
            <h2 className="font-display text-xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faq.map((f) => (
                <details key={f.q} className="group border border-border/30 rounded-lg">
                  <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-sm hover:text-primary transition-colors">
                    {f.q}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <p className="text-xs text-muted-foreground/60 italic">
            Not financial advice. Cryptocurrency markets are volatile and you can lose your entire investment.
            See our <Link to="/risk-disclaimer" className="underline">Risk Disclaimer</Link>.
          </p>
        </div>
      </main>

      <AdsterraNative className="my-4 max-w-5xl mx-auto px-4" />
      <AdsterraBanner className="my-4" />
      <AdsterraBanner300 className="my-4" />
      <AdsterraBanner320 className="my-4" />
      <AdsterraSmartlink variant="button" className="my-4" />
      <AdUnit format="horizontal" className="mt-6 mb-2 max-w-5xl mx-auto px-4" />
      <Footer />
      <MobileBottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}

function CoinRow({ coin }: { coin: TopCoin }) {
  const id = coin.id || coin.symbol.toLowerCase();
  const linkTo = coin.id ? `/today/${id}` : `/price-prediction/${id}`;
  return (
    <Link to={linkTo} className="flex items-center justify-between py-2 group">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-6">#{coin.rank}</span>
        <div>
          <span className="font-medium text-sm group-hover:text-primary transition-colors">
            {coin.symbol.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground ml-2">{coin.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm">${fmtPrice(coin.price)}</span>
        <span className={`font-mono text-sm w-20 text-right ${coin.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
          {pct(coin.change24h)}
        </span>
      </div>
    </Link>
  );
}

function pct(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  return n.toPrecision(4);
}

function fmtLargeNum(n: number): string {
  if (!n || !Number.isFinite(n)) return "—";
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return n.toFixed(0);
}
