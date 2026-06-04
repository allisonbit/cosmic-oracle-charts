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
import { DashboardSchema, DashboardSEOContent, HowToReadDashboard, WhatMakesUsDifferent, RelatedMarketInsights, DashboardHowItWorks } from "@/components/seo/index";

import { SortableCryptoTable } from "@/components/dashboard/SortableCryptoTable";
import { DashboardTopCryptos } from "@/components/dashboard/DashboardTopCryptos";
import { DashboardHeatMap } from "@/components/dashboard/DashboardHeatMap";
import { DashboardStatsRow } from "@/components/dashboard/DashboardStatsRow";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LiveSignals } from "@/components/home/LiveSignals";

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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <DashboardHeader lastUpdate={lastUpdate} />

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-display text-xs sm:text-sm">Loading live market data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="mb-4 sm:mb-6">
              <EnhancedQuickActions />
            </div>

            {/* Stats Row */}
            <DashboardStatsRow global={global} />

            {/* ── Fear & Greed — Prominent Full-Width Card ───────────────────── */}
            {fearGreedIndex !== null && (
              <Link
                to="/sentiment"
                className="holo-card p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 group hover:border-primary/40 transition-all"
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
              <LiveSignals />
            </div>

            {/* Global Metrics Summary */}
            <GlobalMetricsSummary />

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">

                  {/* Fear & Greed - Clickable */}
                  <Link to="/sentiment" className="holo-card p-3 sm:p-4 md:p-6 card-touch group">
                    <h3 className="font-display text-xs sm:text-sm md:text-base font-bold mb-3 sm:mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="truncate">FEAR & GREED</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </h3>
                    {fearGreedIndex !== null ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" stroke="hsl(230, 20%, 15%)" strokeWidth="8" fill="none" />
                          <circle 
                            cx="50" cy="50" r="42" 
                            stroke={fearGreedIndex >= 60 ? "hsl(160, 84%, 39%)" : fearGreedIndex >= 40 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)"} 
                            strokeWidth="8" 
                            fill="none" 
                            strokeDasharray={`${fearGreedIndex * 2.64} 264`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={cn(
                            "text-lg sm:text-xl md:text-2xl font-display font-bold",
                            fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                          )}>
                            {fearGreedIndex}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className={cn(
                          "text-sm sm:text-base md:text-xl font-display font-bold mb-0.5 sm:mb-1 truncate",
                          fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                        )}>
                          {fearGreedIndex >= 80 ? "Extreme Greed" : fearGreedIndex >= 60 ? "Greed" : fearGreedIndex >= 40 ? "Neutral" : fearGreedIndex >= 20 ? "Fear" : "Extreme Fear"}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Click for deep analysis</p>
                      </div>
                    </div>
                    ) : (
                      <div className="flex items-center justify-center h-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </Link>

                  {/* AI Insights */}
                  <div className="holo-card p-3 sm:p-4 md:p-6">
                    <h3 className="font-display text-xs sm:text-sm md:text-base font-bold mb-3 sm:mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      AI INSIGHTS
                    </h3>
                    {aiData?.forecast ? (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
                            <div className="text-[8px] sm:text-[10px] text-muted-foreground font-display">SENTIMENT</div>
                            <div className={cn(
                              "text-[10px] sm:text-xs md:text-sm font-bold truncate",
                              aiData.forecast.overallSentiment === "bullish" ? "text-success" : aiData.forecast.overallSentiment === "bearish" ? "text-danger" : "text-warning"
                            )}>
                              {aiData.forecast.overallSentiment?.toUpperCase() || "NEUTRAL"}
                            </div>
                          </div>
                          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
                            <div className="text-[8px] sm:text-[10px] text-muted-foreground font-display">CONFIDENCE</div>
                            <div className="text-[10px] sm:text-xs md:text-sm font-bold text-primary">{aiData.forecast.confidence || 65}%</div>
                          </div>
                          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
                            <div className="text-[8px] sm:text-[10px] text-muted-foreground font-display">RISK</div>
                            <div className={cn(
                              "text-[10px] sm:text-xs md:text-sm font-bold truncate",
                              aiData.forecast.riskLevel === "low" ? "text-success" : aiData.forecast.riskLevel === "high" ? "text-danger" : "text-warning"
                            )}>
                              {aiData.forecast.riskLevel?.toUpperCase() || "MEDIUM"}
                            </div>
                          </div>
                        </div>
                        {aiData.forecast.shortTermOutlook && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{aiData.forecast.shortTermOutlook}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-16 sm:h-20">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                <EnhancedMarketMomentum />
                <EnhancedMarketInsightsPanel />
                
                {/* Order Book and Funding Rates */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <OrderBookPanel />
                  <FundingRatesPanel />
                </div>
                
                {/* Correlation Matrix */}
                <CorrelationMatrix />
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                <EnhancedTrendingAlerts />
                <EnhancedTopPerformers onCoinClick={(coin: any) => navigate(`/price-prediction/${coin.name?.toLowerCase() || coin.symbol?.toLowerCase()}/daily`)} />
                <MarketRegimeIndicator />
                {/* Sidebar ad */}
                <SidebarAd />
              </div>
            </div>

            {/* Sector Performance & Live Trades */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <SectorPerformancePanel />
              <RecentTradesPanel />
            </div>
            
            {/* In-article ad between major sections */}
            <InArticleAd className="mb-4 sm:mb-6" />
            
            {/* Advanced Analytics Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <LiquidationHeatmap />
              <WhaleActivityPanel />
              <OptionsFlowPanel />
            </div>
            
            {/* Custom Alerts */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <CustomAlertsPanel />
              <div className="holo-card p-4 sm:p-6">
                <h3 className="font-display text-sm sm:text-base font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  ADVANCED ANALYTICS
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Access professional-grade market analysis tools including order book depth, funding rates, 
                  correlation matrices, and liquidation heatmaps to make informed trading decisions.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg sm:text-xl font-bold text-primary">8+</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Analytics Tools</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg sm:text-xl font-bold text-success">24/7</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Live Updates</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strength Meter & Crypto Factory Widgets */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <StrengthMeterWidget />
              <CryptoFactoryWidget />
            </div>
            
            {/* Full Sortable Crypto Table */}
            <SortableCryptoTable coins={allCoins} />
            
            {/* SEO Content Block */}
            <DashboardSEOContent />
            
            {/* How to Read the Dashboard - SEO friendly explanations */}
            <HowToReadDashboard />

            {/* Volume & Dominance with explanatory text */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <EnhancedVolumeLeaders />
                <p className="text-xs text-muted-foreground mt-2 p-3 bg-muted/10 rounded-lg">
                  <strong className="text-foreground">Volume Leaders:</strong> Cryptocurrencies with the highest 24-hour trading activity. High volume confirms price movements and indicates strong market interest.
                </p>
              </div>
              <div>
                <EnhancedDominanceChart />
                <p className="text-xs text-muted-foreground mt-2 p-3 bg-muted/10 rounded-lg">
                  <strong className="text-foreground">Market Dominance:</strong> Shows percentage of total market cap held by each cryptocurrency. BTC dominance above 50% typically indicates a risk-off environment.
                </p>
              </div>
            </div>

            {/* Coin Cards - Clickable */}
            <DashboardTopCryptos topCoins={topCoins} />

            {/* Heat Map - Clickable */}
            <DashboardHeatMap topCoins={topCoins} />
            
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
