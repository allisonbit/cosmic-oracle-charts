import { Layout } from "@/components/layout/Layout";
import { TrendingUp, TrendingDown, Activity, Loader2, Brain, BarChart3, Table2, LayoutGrid, ArrowRight, Target, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EnhancedMarketMomentum } from "@/components/dashboard/EnhancedMarketMomentum";
import { EnhancedTrendingAlerts } from "@/components/dashboard/EnhancedTrendingAlerts";
import { EnhancedVolumeLeaders } from "@/components/dashboard/EnhancedVolumeLeaders";
import { EnhancedDominanceChart } from "@/components/dashboard/EnhancedDominanceChart";
import { EnhancedQuickActions } from "@/components/dashboard/EnhancedQuickActions";
import { EnhancedTopPerformers } from "@/components/dashboard/EnhancedTopPerformers";
import { MarketRegimeIndicator } from "@/components/dashboard/MarketRegimeIndicator";
import { GlobalMetricsSummary } from "@/components/dashboard/GlobalMetricsSummary";
import { SortableCryptoTable } from "@/components/dashboard/SortableCryptoTable";
import { DashboardTopCryptos } from "@/components/dashboard/DashboardTopCryptos";
import { DashboardHeatMap } from "@/components/dashboard/DashboardHeatMap";
import { DashboardStatsRow } from "@/components/dashboard/DashboardStatsRow";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LiveSignals } from "@/components/home/LiveSignals";
import { LiveAlphaFeed } from "@/components/dashboard/LiveAlphaFeed";
import { WidgetErrorBoundary } from "@/components/system/RouteErrorBoundary";
import { DashboardSchema, DashboardItemListSchema } from "@/components/seo/index";

function SectionHeading({ icon: Icon, label, title, gradient, action }: { icon: typeof Activity; label: string; title: string; gradient: string; action?: { to: string; text: string } }) {
  return (
    <div className="section-header mb-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-3.5 h-3.5 text-primary" />
          <span className="section-label">{label}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-display font-bold">
          {title} {gradient && <span className="text-gradient-cosmic">{gradient}</span>}
        </h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0 group"
        >
          {action.text}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { data: pricesData, isLoading: pricesLoading } = useCryptoPrices();
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const topCoins = useMemo(() => marketData?.topCoins?.slice(0, 8) || [], [marketData]);
  const allCoins = useMemo(() => marketData?.topCoins || [], [marketData]);
  const global = marketData?.global;
  const fearGreedIndex = marketData?.fearGreedIndex ?? null;

  useEffect(() => {
    if (marketData) setLastUpdate(new Date());
  }, [marketData]);

  const isLoading = pricesLoading || marketLoading;

  return (
    <Layout>
      <DashboardSchema marketCap={global ? `$${(global.totalMarketCap / 1e12).toFixed(2)}T` : undefined} fearGreedIndex={fearGreedIndex ?? 50} />
      <DashboardItemListSchema coins={allCoins} />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <DashboardHeader lastUpdate={lastUpdate} />

        {isLoading ? (
          // Reserve roughly the real dashboard's vertical footprint so the
          // footer doesn't jump when content swaps in. Tuned to keep CLS in the
          // "Good" (<0.1) band on first load.
          <div className="flex justify-center items-start pt-32 min-h-[120vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-display text-xs sm:text-sm">Loading live market data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Quick access ─────────────────────────────────────────────── */}
            <div className="mb-4 sm:mb-6">
              <WidgetErrorBoundary><EnhancedQuickActions /></WidgetErrorBoundary>
            </div>

            {/* ── Global stats band ────────────────────────────────────────── */}
            <WidgetErrorBoundary><DashboardStatsRow global={global} /></WidgetErrorBoundary>

            {/* ═══ 1. LIVE PULSE — alpha feed + regime, the real-time story ═══ */}
            <section className="border-t border-border/30 pt-5 mt-6" aria-label="Live market pulse">
              <SectionHeading
                icon={Activity}
                label="Live Pulse"
                title="What's Moving"
                gradient="Right Now"
                action={{ to: "/sentiment", text: "Sentiment Hub" }}
              />
              <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
                <div className="lg:col-span-3">
                  <WidgetErrorBoundary><LiveAlphaFeed /></WidgetErrorBoundary>
                </div>
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <WidgetErrorBoundary><MarketRegimeIndicator /></WidgetErrorBoundary>
                  <WidgetErrorBoundary><EnhancedMarketMomentum /></WidgetErrorBoundary>
                </div>
              </div>
            </section>

            {/* ═══ 2. FEAR & GREED — full-width sentiment gauge ═══ */}
            {fearGreedIndex !== null && (
              <Link
                to="/sentiment"
                className="border-b border-border/30 py-5 my-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 group hover:bg-muted/20 transition-colors"
              >
                {/* Gauge */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                    <circle
                      cx="50" cy="50" r="42"
                      stroke={fearGreedIndex >= 60 ? "hsl(var(--success))" : fearGreedIndex >= 40 ? "hsl(var(--warning))" : "hsl(var(--danger))"}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${fearGreedIndex * 2.64} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn(
                      "text-2xl sm:text-3xl font-display font-bold",
                      fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                    )}>{fearGreedIndex}</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">/100</span>
                  </div>
                </div>

                {/* Label + context */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fear &amp; Greed Index</span>
                    <ArrowRight className="w-4 h-4 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className={cn(
                    "text-2xl sm:text-3xl font-display font-bold mb-1",
                    fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                  )}>
                    {fearGreedIndex >= 80 ? "Extreme Greed" : fearGreedIndex >= 60 ? "Greed" : fearGreedIndex >= 40 ? "Neutral" : fearGreedIndex >= 20 ? "Fear" : "Extreme Fear"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {fearGreedIndex >= 70
                      ? "Market is euphoric — consider taking profits. Historically signals elevated risk."
                      : fearGreedIndex >= 50
                      ? "Markets leaning bullish but not overheated. Moderate risk environment."
                      : fearGreedIndex >= 30
                      ? "Cautious sentiment prevails. Historically presents buying opportunities."
                      : "Extreme fear in the market — historically a strong buy signal for long-term holders."}
                  </p>
                </div>

                {/* 5-zone scale */}
                <div className="hidden md:flex flex-col gap-1 text-xs shrink-0">
                  {[["0-20","Extreme Fear","text-danger"],["20-40","Fear","text-orange-400"],["40-60","Neutral","text-warning"],["60-80","Greed","text-success"],["80-100","Extreme Greed","text-success"]].map(([range, label, color]) => (
                    <div key={range} className={cn("flex items-center gap-2 font-medium", color)}>
                      <span className="w-10 text-right text-muted-foreground font-normal">{range}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </Link>
            )}

            {/* ═══ 3. AI TRADE SIGNALS — engine-read setups ═══ */}
            <section className="border-t border-border/30 pt-5 my-6" aria-label="AI trade signals">
              <SectionHeading
                icon={Target}
                label="AI Signals"
                title="High-Conviction"
                gradient="Trade Setups"
                action={{ to: "/predictions", text: "All Predictions" }}
              />
              <WidgetErrorBoundary><LiveSignals /></WidgetErrorBoundary>
            </section>

            {/* ═══ 4. MARKET PULSE — gainers, losers, volume, dominance ═══ */}
            <section className="border-t border-border/30 pt-5 my-6" aria-label="Market movers and leaders">
              <SectionHeading
                icon={BarChart3}
                label="Market Movers"
                title="Today's"
                gradient="Leaders & Laggards"
                action={{ to: "/explorer", text: "Token Explorer" }}
              />
              <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <WidgetErrorBoundary><EnhancedTrendingAlerts /></WidgetErrorBoundary>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <WidgetErrorBoundary><EnhancedVolumeLeaders /></WidgetErrorBoundary>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <WidgetErrorBoundary><EnhancedDominanceChart /></WidgetErrorBoundary>
                  <WidgetErrorBoundary><EnhancedTopPerformers onCoinClick={(coin: any) => window.location.assign(`/price-prediction/${coin.name?.toLowerCase() || coin.symbol?.toLowerCase()}/daily`)} /></WidgetErrorBoundary>
                </div>
              </div>
            </section>

            {/* ═══ 5. FULL MARKET TABLE — every coin, sortable ═══ */}
            <section className="border-t border-border/30 pt-5 my-6" aria-label="Full market table">
              <SectionHeading
                icon={Table2}
                label="Full Market"
                title="All Tracked"
                gradient="Cryptocurrencies"
              />
              <WidgetErrorBoundary><GlobalMetricsSummary /></WidgetErrorBoundary>
              <div className="mt-4">
                <WidgetErrorBoundary><SortableCryptoTable coins={allCoins} /></WidgetErrorBoundary>
              </div>
            </section>

            {/* ═══ 6. VISUAL MARKET — cards + heat map ═══ */}
            <section className="border-t border-border/30 pt-5 my-6" aria-label="Market overview visuals">
              <SectionHeading
                icon={LayoutGrid}
                label="Visual Market"
                title="Prices at a"
                gradient="Glance"
              />
              <WidgetErrorBoundary><DashboardTopCryptos topCoins={topCoins} /></WidgetErrorBoundary>
              <div className="mt-4">
                <WidgetErrorBoundary><DashboardHeatMap topCoins={topCoins} /></WidgetErrorBoundary>
              </div>
            </section>

            {/* ═══ Dashboard FAQ ═══ */}
            <section className="border-t border-border/30 pt-8 mt-8 mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Dashboard FAQ</h2>
              <div className="space-y-3 max-w-3xl">
                <details className="group border border-border/30 rounded-lg">
                  <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                    What does the crypto dashboard show?
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    The Oracle Bull dashboard provides a real-time overview of the entire cryptocurrency market: live prices, 24-hour changes, gainers and losers, volume leaders, market dominance, the Fear &amp; Greed Index, AI momentum signals, and a fully sortable table of every tracked token. For deeper analysis, visit our{" "}
                    <Link to="/explorer" className="text-primary hover:underline">Token Explorer</Link> or the{" "}
                    <Link to="/predictions" className="text-primary hover:underline">AI Predictions</Link> pages.
                  </div>
                </details>

                <details className="group border border-border/30 rounded-lg">
                  <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                    How often is dashboard data updated?
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    Prices, volumes, and market-cap figures refresh roughly every 1–2 minutes from CoinGecko's live feeds. AI{" "}
                    <Link to="/predictions" className="text-primary hover:underline">price predictions</Link> are recomputed from the latest 90-day history on each visit, and the{" "}
                    <Link to="/sentiment" className="text-primary hover:underline">Fear &amp; Greed Index</Link> updates daily at its source.
                  </div>
                </details>

                <details className="group border border-border/30 rounded-lg">
                  <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                    What is the Fear &amp; Greed Index?
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    The Fear &amp; Greed Index is a composite score from 0 to 100 that measures overall crypto market sentiment. It factors in volatility, trading volume, social media activity, Bitcoin dominance, and Google Trends data. Scores below 25 indicate "Extreme Fear" (historically a buying opportunity), while scores above 75 indicate "Extreme Greed" (a signal to consider taking profits). Explore the full breakdown on our{" "}
                    <Link to="/sentiment" className="text-primary hover:underline">Sentiment Analysis page</Link>.
                  </div>
                </details>

                <details className="group border border-border/30 rounded-lg">
                  <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                    How do I read the market momentum indicator?
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    The market momentum indicator shows whether the majority of top cryptocurrencies are trending up (bullish) or down (bearish) over the last 24 hours. A "BULLISH" reading means more coins are gaining than losing, while "BEARISH" indicates broader selling pressure. Combine this with individual{" "}
                    <Link to="/predictions" className="text-primary hover:underline">AI predictions</Link> for directional guidance on specific tokens.
                  </div>
                </details>

                <details className="group border border-border/30 rounded-lg">
                  <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                    Is the dashboard free to use?
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    Yes, the Oracle Bull dashboard and all of its tools are 100% free with no registration required. There are no premium tiers or paywalled features. You can access the full dashboard, live{" "}
                    <Link to="/predictions" className="text-primary hover:underline">AI predictions</Link>,{" "}
                    <Link to="/sentiment" className="text-primary hover:underline">sentiment analysis</Link>,{" "}
                    <Link to="/explorer" className="text-primary hover:underline">token explorer</Link>, and all other tools without creating an account.
                  </div>
                </details>
              </div>
            </section>
          </>
        )}
      </div>

    </Layout>
  );
};

export default Dashboard;
