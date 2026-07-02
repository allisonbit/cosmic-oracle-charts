import { Layout } from "@/components/layout/Layout";
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3, Loader2, Brain, Flame, Globe, Clock, ArrowRight, Gauge, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { useMemo, useState, useEffect, useCallback } from "react";
import { EnhancedMarketMomentum } from "@/components/dashboard/EnhancedMarketMomentum";
import { EnhancedTrendingAlerts } from "@/components/dashboard/EnhancedTrendingAlerts";
import { EnhancedVolumeLeaders } from "@/components/dashboard/EnhancedVolumeLeaders";
import { EnhancedDominanceChart } from "@/components/dashboard/EnhancedDominanceChart";
import { EnhancedQuickActions } from "@/components/dashboard/EnhancedQuickActions";
import { EnhancedMarketInsightsPanel } from "@/components/dashboard/EnhancedMarketInsightsPanel";
import { EnhancedTopPerformers } from "@/components/dashboard/EnhancedTopPerformers";
import { StrengthMeterWidget } from "@/components/dashboard/StrengthMeterWidget";
import { CryptoFactoryWidget } from "@/components/dashboard/CryptoFactoryWidget";
import { OrderBookPanel } from "@/components/dashboard/OrderBookPanel";
import { FundingRatesPanel } from "@/components/dashboard/FundingRatesPanel";
import { CorrelationMatrix } from "@/components/dashboard/CorrelationMatrix";
import { LiquidationHeatmap } from "@/components/dashboard/LiquidationHeatmap";
import { MarketRegimeIndicator } from "@/components/dashboard/MarketRegimeIndicator";
import { WhaleActivityPanel } from "@/components/dashboard/WhaleActivityPanel";
import { OptionsFlowPanel } from "@/components/dashboard/OptionsFlowPanel";
import { CustomAlertsPanel } from "@/components/dashboard/CustomAlertsPanel";
import { GlobalMetricsSummary } from "@/components/dashboard/GlobalMetricsSummary";
import { SectorPerformancePanel } from "@/components/dashboard/SectorPerformancePanel";
import { RecentTradesPanel } from "@/components/dashboard/RecentTradesPanel";
import { Link, useNavigate } from "react-router-dom";
import { SidebarAd, InArticleAd } from "@/components/ads";
import { CoinDetailModal } from "@/components/dashboard/CoinDetailModal";
import { DashboardSchema, DashboardSEOContent, HowToReadDashboard, WhatMakesUsDifferent, RelatedMarketInsights, DashboardHowItWorks, DashboardItemListSchema } from "@/components/seo/index";

import { SortableCryptoTable } from "@/components/dashboard/SortableCryptoTable";
import { DashboardTopCryptos } from "@/components/dashboard/DashboardTopCryptos";
import { DashboardHeatMap } from "@/components/dashboard/DashboardHeatMap";
import { DashboardStatsRow } from "@/components/dashboard/DashboardStatsRow";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LiveSignals } from "@/components/home/LiveSignals";
import { LiveAlphaFeed } from "@/components/dashboard/LiveAlphaFeed";
import { MarketPulseSummary } from "@/components/dashboard/MarketPulseSummary";
import { WidgetErrorBoundary } from "@/components/system/RouteErrorBoundary";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: pricesData, isLoading: pricesLoading } = useCryptoPrices();
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  
  const topCoins = useMemo(() => marketData?.topCoins?.slice(0, 8) || [], [marketData]);
  const allCoins = useMemo(() => marketData?.topCoins || [], [marketData]);
  const global = marketData?.global;
  const fearGreedIndex = marketData?.fearGreedIndex ?? null;
  
  const { data: aiData } = useAIForecast(
    topCoins.length > 0 ? topCoins : null,
    "market_sentiment",
    topCoins.length > 0
  );

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
          <div className="flex justify-center items-start pt-32 min-h-[260vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-display text-xs sm:text-sm">Loading live market data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="mb-4 sm:mb-6">
              <WidgetErrorBoundary><EnhancedQuickActions /></WidgetErrorBoundary>
            </div>

            {/* Stats Row */}
            <WidgetErrorBoundary><DashboardStatsRow global={global} /></WidgetErrorBoundary>

            {/* ── Live Alpha Feed — the headline real-time market pulse ───────── */}
            <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
              <WidgetErrorBoundary><LiveAlphaFeed /></WidgetErrorBoundary>
            </div>

            {/* ── Fear & Greed — Prominent Full-Width Card ───────────────────── */}
            {fearGreedIndex !== null && (
              <Link
                to="/sentiment"
                className="border-b border-border/30 py-5 mb-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 group hover:bg-muted/20 transition-colors"
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

            {/* ── AI Trade Signals — First thing users see ──────────────────────────── */}
            <div className="mb-4 sm:mb-6">
              <WidgetErrorBoundary><LiveSignals /></WidgetErrorBoundary>
            </div>

            {/* Global Metrics Summary */}
            <WidgetErrorBoundary><GlobalMetricsSummary /></WidgetErrorBoundary>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <WidgetErrorBoundary><EnhancedMarketMomentum /></WidgetErrorBoundary>
                <WidgetErrorBoundary><EnhancedMarketInsightsPanel /></WidgetErrorBoundary>

                {/* Order Book and Funding Rates */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <WidgetErrorBoundary><OrderBookPanel /></WidgetErrorBoundary>
                  <WidgetErrorBoundary><FundingRatesPanel /></WidgetErrorBoundary>
                </div>

                {/* Correlation Matrix */}
                <WidgetErrorBoundary><CorrelationMatrix /></WidgetErrorBoundary>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                <WidgetErrorBoundary><EnhancedTrendingAlerts /></WidgetErrorBoundary>
                <WidgetErrorBoundary><EnhancedTopPerformers onCoinClick={(coin: any) => navigate(`/price-prediction/${coin.name?.toLowerCase() || coin.symbol?.toLowerCase()}/daily`)} /></WidgetErrorBoundary>
                <WidgetErrorBoundary><MarketRegimeIndicator /></WidgetErrorBoundary>
                {/* Sidebar ad */}
                <SidebarAd />
              </div>
            </div>

            {/* Sector Performance & Live Trades */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <WidgetErrorBoundary><SectorPerformancePanel /></WidgetErrorBoundary>
              <WidgetErrorBoundary><RecentTradesPanel /></WidgetErrorBoundary>
            </div>

            {/* In-article ad between major sections */}
            <InArticleAd className="mb-4 sm:mb-6" />

            {/* Advanced Analytics Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <WidgetErrorBoundary><LiquidationHeatmap /></WidgetErrorBoundary>
              <WidgetErrorBoundary><WhaleActivityPanel /></WidgetErrorBoundary>
              <WidgetErrorBoundary><OptionsFlowPanel /></WidgetErrorBoundary>
            </div>
            
            {/* Custom Alerts */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <WidgetErrorBoundary><CustomAlertsPanel /></WidgetErrorBoundary>
              <WidgetErrorBoundary><MarketPulseSummary /></WidgetErrorBoundary>
            </div>

            {/* Strength Meter & Crypto Factory Widgets */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <WidgetErrorBoundary><StrengthMeterWidget /></WidgetErrorBoundary>
              <WidgetErrorBoundary><CryptoFactoryWidget /></WidgetErrorBoundary>
            </div>
            
            {/* Full Sortable Crypto Table */}
            <WidgetErrorBoundary><SortableCryptoTable coins={allCoins} /></WidgetErrorBoundary>

            {/* SEO Content Block */}
            <DashboardSEOContent />

            {/* How to Read the Dashboard - SEO friendly explanations */}
            <HowToReadDashboard />

            {/* Volume & Dominance with explanatory text */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <WidgetErrorBoundary><EnhancedVolumeLeaders /></WidgetErrorBoundary>
                <p className="text-xs text-muted-foreground mt-2 border-t border-border/20 pt-2">
                  <strong className="text-foreground">Volume Leaders:</strong> Cryptocurrencies with the highest 24-hour trading activity. High volume confirms price movements and indicates strong market interest.
                </p>
              </div>
              <div>
                <WidgetErrorBoundary><EnhancedDominanceChart /></WidgetErrorBoundary>
                <p className="text-xs text-muted-foreground mt-2 border-t border-border/20 pt-2">
                  <strong className="text-foreground">Market Dominance:</strong> Shows percentage of total market cap held by each cryptocurrency. BTC dominance above 50% typically indicates a risk-off environment.
                </p>
              </div>
            </div>

            {/* Coin Cards - Clickable */}
            <WidgetErrorBoundary><DashboardTopCryptos topCoins={topCoins} /></WidgetErrorBoundary>

            {/* Heat Map - Clickable */}
            <WidgetErrorBoundary><DashboardHeatMap topCoins={topCoins} /></WidgetErrorBoundary>
            
            {/* What Makes Oracle Bull Different */}
            <WhatMakesUsDifferent />
            
            {/* Related Market Insights with internal links */}
            <RelatedMarketInsights />
            
            {/* Educational How It Works Section */}
            <DashboardHowItWorks />
          </>
        )}
      </div>

    </Layout>
  );
};

export default Dashboard;
