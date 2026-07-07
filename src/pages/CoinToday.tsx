import { useParams, Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import {
  TrendingUp, TrendingDown, Minus, ChevronRight, Target,
  Shield, BarChart3, ArrowRight, Activity, AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialShare } from "@/components/ui/social-share";
import { ShareablePredictionCard } from "@/components/predictions/ShareablePredictionCard";
import { AdsterraNative } from "@/components/ads/AdsterraNative";
import { AdUnit } from "@/components/ads/AdUnit";
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";
import { usePricePrediction, TOP_CRYPTOS, ALL_CRYPTOS } from "@/hooks/usePricePrediction";
import { useCanonicalSetup } from "@/hooks/useCanonicalSetup";

const COIN_LOOKUP: Record<string, { name: string; symbol: string }> = Object.fromEntries(
  ALL_CRYPTOS.map((c) => [c.id, { name: c.name, symbol: c.symbol }])
);

export default function CoinToday() {
  const { coinId = "" } = useParams<{ coinId: string }>();
  const coin = COIN_LOOKUP[coinId];

  const { data: prediction, isLoading, error } = usePricePrediction(
    coinId,
    coin?.symbol ?? "",
    "daily",
    Boolean(coin)
  );
  const setup = useCanonicalSetup(coinId, coin?.symbol ?? "", "daily");

  if (!coin) return <Navigate to="/predictions" replace />;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  const pct = (n: number | undefined) =>
    n == null || !Number.isFinite(n) ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

  const ticker = coin.symbol.toUpperCase();
  const title = `What Happened to ${coin.name} Today — ${today} | Oracle Bull`;
  const description = `Live ${coin.name} (${ticker}) daily update for ${today}. AI price prediction, support & resistance, trading setup, and market analysis.`;

  const md = prediction?.marketData;

  const faq = prediction
    ? [
        {
          q: `What is ${coin.name}'s price today?`,
          a: `${coin.name} (${ticker}) is trading at ${formatPrice(prediction.currentPrice)} as of ${today}. The 24-hour range spans ${md?.low24h ? formatPrice(md.low24h) : "N/A"} to ${md?.high24h ? formatPrice(md.high24h) : "N/A"}.`,
        },
        {
          q: `Is ${coin.name} going up or down today?`,
          a: `Our AI model rates ${coin.name} as ${prediction.bias} today with ${prediction.confidence}% confidence. The bull target is ${formatPrice(prediction.bullScenario.target)} (${prediction.bullScenario.probability}% probability) and the bear target is ${formatPrice(prediction.bearScenario.target)} (${prediction.bearScenario.probability}% probability).`,
        },
        {
          q: `Should I buy ${coin.name} today?`,
          a: prediction.bias === "bullish"
            ? `${coin.name} shows bullish signals today with ${prediction.confidence}% confidence. The AI suggests an entry zone between ${formatPrice(setup.entryLow)} and ${formatPrice(setup.entryHigh)} with a stop-loss at ${formatPrice(setup.stopLoss)}. This is not financial advice.`
            : prediction.bias === "bearish"
            ? `Caution is advised — ${coin.name} is rated bearish today with ${prediction.confidence}% confidence. Consider waiting for improved conditions before entering. This is not financial advice.`
            : `${coin.name} is neutral today. Mixed signals suggest waiting for a confirmed breakout above ${formatPrice(prediction.resistanceLevels[0])} or a bounce from ${formatPrice(prediction.supportLevels[0])}. This is not financial advice.`,
        },
        {
          q: `Where can I buy ${coin.name}?`,
          a: `${coin.name} (${ticker}) is available on major exchanges including Coinbase, Binance, and Kraken. See our step-by-step How to Buy ${coin.name} guide for details.`,
        },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO
        title={title}
        description={description}
        keywords={`${coin.name} today, ${ticker} price today, ${coin.name} daily update, ${ticker} prediction today, what happened to ${coin.name}`}
      />
      <Helmet>
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
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/predictions" className="hover:text-primary">Predictions</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/price-prediction/${coinId}`} className="hover:text-primary capitalize">{coin.name}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Today</span>
          </nav>

          {/* Hero */}
          <section className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <Activity className="w-3 h-3 mr-1" />
              Daily Update — {today}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="glow-text">What Happened to {coin.name} Today</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Live {coin.name} ({ticker}) price, AI prediction, key levels, and market analysis for {today}.
            </p>
          </section>

          {/* Loading / Error */}
          {isLoading && (
            <div className="holo-card p-6 mb-8 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {error && !isLoading && (
            <div className="holo-card p-6 mb-8 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground">Unable to load today's data. Please try again later.</p>
            </div>
          )}

          {prediction && (
            <>
              {/* Price Summary Card */}
              <section className="holo-card p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-1">
                      {coin.name} ({ticker})
                    </h2>
                    <p className="text-muted-foreground">Today's Price & Outlook</p>
                  </div>
                  <Badge
                    variant={prediction.bias === "bullish" ? "default" : prediction.bias === "bearish" ? "destructive" : "secondary"}
                    className={`text-lg px-4 py-2 ${
                      prediction.bias === "bullish" ? "bg-green-600/20 text-green-400 border-green-600/30"
                      : prediction.bias === "bearish" ? "bg-red-600/20 text-red-400 border-red-600/30" : ""
                    }`}
                  >
                    {prediction.bias === "bullish" ? <TrendingUp className="w-4 h-4 mr-2" />
                      : prediction.bias === "bearish" ? <TrendingDown className="w-4 h-4 mr-2" />
                      : <Minus className="w-4 h-4 mr-2" />}
                    {prediction.confidence}% {prediction.bias.charAt(0).toUpperCase() + prediction.bias.slice(1)}
                  </Badge>
                </div>

                <div className="text-4xl font-bold font-mono mb-4">
                  {formatPrice(prediction.currentPrice)}
                </div>

                {/* 24h stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {md?.high24h != null && (
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">24h High</div>
                      <div className="font-mono font-bold text-green-400">{formatPrice(md.high24h)}</div>
                    </div>
                  )}
                  {md?.low24h != null && (
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">24h Low</div>
                      <div className="font-mono font-bold text-red-400">{formatPrice(md.low24h)}</div>
                    </div>
                  )}
                  {md?.volume24h != null && (
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
                      <div className="font-mono font-bold">{fmtLargeNum(md.volume24h)}</div>
                    </div>
                  )}
                  {md?.marketCap != null && (
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
                      <div className="font-mono font-bold">{fmtLargeNum(md.marketCap)}</div>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">{prediction.summary}</p>
              </section>

              {/* AI Prediction Breakdown */}
              <section className="holo-card p-6 md:p-8 mb-8">
                <h2 className="text-lg font-display font-bold mb-4">
                  {coin.name} AI Prediction — {today}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Bull Target</div>
                    <div className="font-mono font-bold text-green-400">{formatPrice(prediction.bullScenario.target)}</div>
                    <div className="text-xs text-muted-foreground">{prediction.bullScenario.probability}% probability</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Bear Target</div>
                    <div className="font-mono font-bold text-red-400">{formatPrice(prediction.bearScenario.target)}</div>
                    <div className="text-xs text-muted-foreground">{prediction.bearScenario.probability}% probability</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Support</div>
                    <div className="font-mono font-bold">{formatPrice(prediction.supportLevels[0])}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Resistance</div>
                    <div className="font-mono font-bold">{formatPrice(prediction.resistanceLevels[0])}</div>
                  </div>
                </div>

                {/* Trading Setup */}
                <h3 className="font-display font-bold mb-3">Trading Setup</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-medium">Entry Zone</span>
                    </div>
                    <div className="font-mono text-sm">
                      {formatPrice(setup.entryLow)} – {formatPrice(setup.entryHigh)}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="font-medium">Stop Loss</span>
                    </div>
                    <div className="font-mono text-sm text-red-400">{formatPrice(setup.stopLoss)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      <span className="font-medium">Take Profit</span>
                    </div>
                    <div className="font-mono text-sm text-green-400">{formatPrice(setup.tp1)}</div>
                  </div>
                </div>

                {/* Key Factors */}
                {prediction.keyFactors.length > 0 && (
                  <>
                    <h3 className="font-display font-bold mb-3">Key Factors</h3>
                    <ul className="space-y-2 mb-6">
                      {prediction.keyFactors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>

              {/* Technical Snapshot */}
              <section className="holo-card p-6 md:p-8 mb-8">
                <h2 className="text-lg font-display font-bold mb-4">
                  {coin.name} Technical Snapshot
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
                  <p>
                    The RSI for {ticker} sits at {prediction.technicalIndicators.rsi.toFixed(1)} ({prediction.technicalIndicators.rsiSignal}),
                    {prediction.technicalIndicators.rsi > 70
                      ? ` placing it in overbought territory. Historically, readings above 70 precede short-term pullbacks, though in strong trends the RSI can stay elevated.`
                      : prediction.technicalIndicators.rsi < 30
                      ? ` indicating oversold conditions. Levels below 30 have historically attracted dip buyers and preceded short-term relief rallies.`
                      : prediction.technicalIndicators.rsi > 55
                      ? ` reflecting moderate bullish momentum. The RSI is above the 50 midline, consistent with buyers maintaining control.`
                      : prediction.technicalIndicators.rsi < 45
                      ? ` showing mild bearish pressure. Sub-45 readings suggest sellers have a slight edge in the current session.`
                      : ` sitting in neutral territory where neither side has a decisive advantage.`
                    }
                    {" "}The MACD is trending {prediction.technicalIndicators.macd.trend}, and Bollinger Bands place {ticker} in
                    the {prediction.technicalIndicators.bollingerBands.position} zone.
                  </p>

                  <p>
                    Moving averages show a {prediction.technicalIndicators.movingAverages.trend} configuration.
                    {prediction.technicalIndicators.movingAverages.trend === "bullish"
                      ? ` The short-term MA sits above the long-term MA, a classic bullish alignment that supports the upside thesis.`
                      : prediction.technicalIndicators.movingAverages.trend === "bearish"
                      ? ` The short-term MA is below the long-term MA, signalling a bearish trend structure that would need a crossover to reverse.`
                      : ` Moving averages are intertwined, reflecting a trendless market that may resolve with a volume-driven breakout.`
                    }
                    {" "}Volume analysis shows a {prediction.technicalIndicators.volumeAnalysis.trend} trend with
                    strength at {prediction.technicalIndicators.volumeAnalysis.strength}/100.
                  </p>

                  {md?.change7d != null && md?.change30d != null && (
                    <p>
                      Beyond today's session, {coin.name} is {md.change7d >= 0 ? "up" : "down"} {pct(md.change7d)} over the
                      past 7 days and {md.change30d >= 0 ? "up" : "down"} {pct(md.change30d)} over 30 days.
                      {md.change7d > 0 && md.change30d > 0
                        ? " Both timeframes are positive, indicating sustained buying pressure."
                        : md.change7d < 0 && md.change30d < 0
                        ? " Both timeframes are negative, suggesting a downtrend that has not yet found a floor."
                        : " The divergence between the two timeframes points to a trend transition underway."
                      }
                      {md.ath != null && md.ath > 0 && (
                        <> {coin.name}'s all-time high is {formatPrice(md.ath)}, which is {((1 - prediction.currentPrice / md.ath) * 100).toFixed(0)}% above the current price.</>
                      )}
                    </p>
                  )}
                </div>
              </section>

              {/* Should You Buy Today? */}
              <section className="holo-card p-6 md:p-8 mb-8">
                <h2 className="text-lg font-display font-bold mb-4">
                  Should You Buy {coin.name} Today?
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
                  <p>
                    {prediction.bias === "bullish"
                      ? `Our AI model rates ${coin.name} as bullish today with ${prediction.confidence}% confidence. The trading setup identifies an entry zone between ${formatPrice(setup.entryLow)} and ${formatPrice(setup.entryHigh)}, with a stop-loss at ${formatPrice(setup.stopLoss)} and take-profit at ${formatPrice(setup.tp1)}. `
                      : prediction.bias === "bearish"
                      ? `${coin.name} is rated bearish today with ${prediction.confidence}% confidence. The downside target is ${formatPrice(prediction.bearScenario.target)}, and our AI suggests caution. `
                      : `${coin.name} is neutral today with mixed signals. The market is range-bound between ${formatPrice(prediction.supportLevels[0])} support and ${formatPrice(prediction.resistanceLevels[0])} resistance. `
                    }
                    {prediction.confidence >= 70
                      ? `High-confidence signals like this have historically shown stronger follow-through within the daily timeframe.`
                      : prediction.confidence >= 50
                      ? `Moderate confidence means the direction is probable but a reversal catalyst could invalidate the setup.`
                      : `Low confidence readings suggest the market is undecided — consider waiting for a clearer signal or reducing position size.`
                    }
                  </p>
                  <p>
                    Risk level is rated <strong>{prediction.riskLevel}</strong> with a volatility index of {prediction.volatilityIndex}/100.
                    {prediction.riskLevel === "extreme"
                      ? " Extreme risk environments amplify both gains and losses — use tight stops and small positions."
                      : prediction.riskLevel === "high"
                      ? " Elevated risk calls for disciplined position sizing and strict adherence to stop-loss levels."
                      : prediction.riskLevel === "medium"
                      ? " Medium risk is typical for normal trading conditions — standard position sizing applies."
                      : " Low risk environments are favourable for swing trades with wider stop-loss levels."
                    }
                  </p>
                  <p>
                    This analysis is not financial advice.{" "}
                    <Link to="/risk-disclaimer" className="text-primary hover:underline">Read our risk disclaimer</Link> before trading.
                    Verify with our{" "}
                    <Link to="/accuracy" className="text-primary hover:underline">prediction accuracy dashboard</Link>.
                  </p>
                </div>
              </section>

              {/* Share */}
              <div className="mb-8 space-y-4">
                <h3 className="font-display text-lg font-bold">Share This Prediction</h3>
                <ShareablePredictionCard
                  coinName={coin.name}
                  ticker={ticker}
                  currentPrice={formatPrice(prediction.currentPrice)}
                  bias={prediction.bias}
                  confidence={prediction.confidence}
                  bullTarget={formatPrice(prediction.bullScenario.target)}
                  bearTarget={formatPrice(prediction.bearScenario.target)}
                  keyFactor={prediction.keyFactors?.[0]}
                  pageUrl={`https://oraclebull.com/today/${coinId}`}
                />
                <SocialShare
                  title={`${coin.name} (${ticker}) is ${prediction.bias} today — ${prediction.confidence}% confidence`}
                  description={`${coin.name} AI prediction for ${today}: ${prediction.bias} with targets at ${formatPrice(prediction.bullScenario.target)} (bull) and ${formatPrice(prediction.bearScenario.target)} (bear).`}
                  url={`https://oraclebull.com/today/${coinId}`}
                />
              </div>
            </>
          )}

          {/* Internal Links */}
          <section className="holo-card p-6 mb-8">
            <h2 className="font-display text-lg font-bold mb-4">
              Explore More {coin.name} Analysis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Link to={`/price-prediction/${coinId}/daily`} className="text-primary hover:underline flex items-center gap-1">
                {coin.name} Daily Prediction <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={`/price-prediction/${coinId}/weekly`} className="text-primary hover:underline flex items-center gap-1">
                {coin.name} Weekly Forecast <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={`/price-prediction/${coinId}/monthly`} className="text-primary hover:underline flex items-center gap-1">
                {coin.name} Monthly Outlook <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={`/how-to-buy/${coinId}`} className="text-primary hover:underline flex items-center gap-1">
                How to Buy {coin.name} <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={`/vs/${coinId}/${coinId === "bitcoin" ? "ethereum" : "bitcoin"}`} className="text-primary hover:underline flex items-center gap-1">
                {coin.name} vs {coinId === "bitcoin" ? "Ethereum" : "Bitcoin"} <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={`/q/will-${coinId}-go-up-today`} className="text-primary hover:underline flex items-center gap-1">
                Will {coin.name} Go Up Today? <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/sentiment" className="text-primary hover:underline flex items-center gap-1">
                Market Sentiment <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/crypto-strength-meter" className="text-primary hover:underline flex items-center gap-1">
                Crypto Strength Meter <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* More Coins */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold mb-4">More Daily Updates</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TOP_CRYPTOS.slice(0, 10)
                .filter((c) => c.id !== coinId)
                .map((c) => (
                  <Link
                    key={c.id}
                    to={`/today/${c.id}`}
                    className="holo-card p-3 text-center transition-all group"
                  >
                    <div className="font-display font-bold text-sm group-hover:text-primary transition-colors">
                      {c.symbol.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">{c.name} Today</div>
                  </Link>
                ))}
            </div>
          </section>

          {/* FAQ */}
          {faq.length > 0 && (
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
          )}

          <p className="text-xs text-muted-foreground/60 italic">
            Not financial advice. Cryptocurrency investments carry significant risk.
            See our <Link to="/risk-disclaimer" className="underline">Risk Disclaimer</Link>.
          </p>
        </div>
      </main>

      <AdsterraNative className="my-4 max-w-5xl mx-auto px-4" />
      <AdsterraBanner className="my-4" />
      <AdUnit format="horizontal" className="mt-6 mb-2 max-w-5xl mx-auto px-4" />
      <Footer />
      <MobileBottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}

function fmtLargeNum(n: number): string {
  if (!n || !Number.isFinite(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}
