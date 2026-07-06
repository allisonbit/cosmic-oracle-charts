import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { LiquidationHeatmap } from "@/components/dashboard/LiquidationHeatmap";
import { SITE_URL } from "@/lib/siteConfig";
import { Flame, TrendingUp, AlertTriangle, Activity, BarChart3 } from "lucide-react";

export default function BitcoinLiquidationHeatmap() {
  const url = `${SITE_URL}/liquidations/bitcoin-heatmap`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a Bitcoin liquidation heatmap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A Bitcoin liquidation heatmap visualizes the price levels where leveraged long and short positions are likely to be force-closed. Clusters of liquidations act as magnets for price because market makers and large traders often push toward these zones to trigger cascading liquidations and harvest liquidity.",
        },
      },
      {
        "@type": "Question",
        name: "How do I read a Bitcoin liquidation heatmap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Brighter or larger clusters indicate higher concentrations of leveraged positions at that price. Long-heavy zones below price are downside liquidity targets; short-heavy zones above price are upside liquidity targets. A balanced level signals consolidation.",
        },
      },
      {
        "@type": "Question",
        name: "Why does Bitcoin price move toward liquidation clusters?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "When leveraged traders are stopped out, their forced market orders create one-sided pressure that accelerates price. Sophisticated participants often anticipate these zones, making liquidation maps a useful tool for spotting potential reversal points and high-volatility breakouts.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Bitcoin liquidation heatmap real-time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Our heatmap pulls live open interest, price, and funding data from major futures exchanges and refreshes every 20 seconds so you can monitor leverage build-up around Bitcoin in real time.",
        },
      },
    ],
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bitcoin Liquidation Heatmap",
    applicationCategory: "FinanceApplication",
    url,
    description:
      "Free real-time Bitcoin liquidation heatmap. Visualize BTC liquidity clusters, leverage zones, long/short liquidation levels, and high-probability reversal areas.",
    provider: { "@type": "Organization", name: "Oracle Bull", url: SITE_URL },
  };

  return (
    <Layout>
      <Helmet>
        <title>Bitcoin Liquidation Heatmap | Live BTC Liquidity Levels | Oracle Bull</title>
        <meta
          name="description"
          content="Free real-time Bitcoin liquidation heatmap. Track BTC long and short liquidation clusters, leverage zones, and price levels where cascading liquidations are likely to trigger reversals."
        />
        
        
        
        
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Flame className="w-3.5 h-3.5 text-warning" />
            <span>Live Futures Data · Updates every 20s</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
            Bitcoin Liquidation Heatmap
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Real-time map of Bitcoin liquidity clusters and leverage-driven price levels. Identify
            where cascading long and short liquidations are most likely to drive BTC price reversals
            and breakouts.
          </p>
        </header>

        <section aria-label="Live Bitcoin liquidation heatmap" className="mb-10">
          <LiquidationHeatmap />
        </section>

        <section className="prose prose-neutral dark:prose-invert max-w-none mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> How the Bitcoin Liquidation Heatmap Works
          </h2>
          <p className="text-muted-foreground mb-4">
            The Bitcoin liquidation heatmap aggregates open interest, funding rates, and price data
            from major BTC futures venues to estimate where leveraged positions will be forcibly
            closed. Each cluster represents an accumulation of stop-loss-style triggers at common
            leverage tiers (5x, 10x, 25x, 50x, 100x). When Bitcoin price approaches a dense
            cluster, cascading liquidations frequently accelerate the move — making these zones
            high-probability reversal or breakout areas.
          </p>
          <p className="text-muted-foreground mb-4">
            Traders use the heatmap to anticipate liquidity sweeps: price often probes a heavy
            cluster, triggers a wave of forced market orders, then reverses sharply once the
            liquidity has been harvested. This is the same logic behind classic stop-hunt patterns,
            now made visible across the entire BTC derivatives stack.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-success" /> How to Read BTC Liquidation Clusters
          </h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-6">
            <li>
              <strong className="text-foreground">Long-heavy zones below price:</strong> downside
              liquidity targets. A flush into this level can mark a local bottom once leveraged
              longs are wiped.
            </li>
            <li>
              <strong className="text-foreground">Short-heavy zones above price:</strong> upside
              liquidity targets. A squeeze through these levels often fuels short-driven rallies.
            </li>
            <li>
              <strong className="text-foreground">Balanced zones:</strong> consolidation areas with
              no clear bias — typically chop until one side dominates.
            </li>
            <li>
              <strong className="text-foreground">Cluster size:</strong> larger clusters carry more
              gravitational pull. Watch the biggest concentrations as primary magnets for price.
            </li>
            <li>
              <strong className="text-foreground">Distance from price:</strong> closer clusters are
              more actionable in the short term; distant clusters define swing-trade targets.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Using the Heatmap for Reversal Signals
          </h2>
          <p className="text-muted-foreground mb-4">
            The strongest reversal setups occur when Bitcoin price taps a major long or short
            liquidation cluster and immediately rejects with rising volume. Combine the heatmap
            with funding rates, open interest changes, and our{" "}
            <a href="/strength-meter" className="text-primary hover:underline">Crypto Strength Meter</a>{" "}
            to confirm momentum shifts. For broader market context, see live{" "}
            <a href="/sentiment" className="text-primary hover:underline">crypto sentiment</a> and{" "}
            <a href="/dashboard" className="text-primary hover:underline">market dashboard</a>.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-warning" /> Risk Notes
          </h2>
          <p className="text-muted-foreground">
            Liquidation estimates are derived from public futures data and represent probable, not
            guaranteed, trigger zones. Bitcoin can wick through clusters intraday before reversing,
            and exchange-specific liquidations may differ from aggregated views. Use the heatmap as
            one input alongside structure, volume, and risk management — never as a standalone
            trade signal. This is not financial advice.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((q: any) => (
              <details key={q.name} className="holo-card p-4 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between">
                  {q.name}
                </summary>
                <p className="mt-3 text-muted-foreground">{q.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="holo-card p-6">
          <h2 className="text-xl font-bold mb-3">Related Bitcoin Tools</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <li><a href="/price-prediction/bitcoin/daily" className="text-primary hover:underline">Bitcoin Price Prediction</a></li>
            <li><a href="/market/bitcoin" className="text-primary hover:underline">Bitcoin Market Overview</a></li>
            <li><a href="/sentiment" className="text-primary hover:underline">Crypto Sentiment Tracker</a></li>
            <li><a href="/strength-meter" className="text-primary hover:underline">Crypto Strength Meter</a></li>
            <li><a href="/dashboard" className="text-primary hover:underline">Live Crypto Dashboard</a></li>
            <li><a href="/scanner" className="text-primary hover:underline">Crypto Scanner</a></li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}