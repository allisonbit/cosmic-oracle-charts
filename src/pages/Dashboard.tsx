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
import { DashboardSchema, DashboardSEOContent, HowToReadDashboard, WhatMakesUsDifferent, RelatedMarketInsights, DashboardHowItWorks } from "@/components/seo";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function CryptoChart({ price, isPositive }: { price: number; isPositive: boolean }) {
  const data = useMemo(() => {
    const points = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: price * (0.95 + Math.random() * 0.1),
    }));
    points[points.length - 1].price = price;
    return points;
  }, [price]);

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
        <Tooltip
          contentStyle={{
            background: "hsl(230, 30%, 8%)",
            border: "1px solid hsl(190, 100%, 50%, 0.3)",
            borderRadius: "8px",
            color: "hsl(200, 100%, 95%)",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Price"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={isPositive ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"}
          strokeWidth={2}
          fill={isPositive ? "url(#colorPositive)" : "url(#colorNegative)"}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
type SortKey = 'rank' | 'price' | 'change24h' | 'volume' | 'marketCap';
type SortDir = 'asc' | 'desc';

function SortableCryptoTable({ coins }: { coins: any[] }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [visibleCount, setVisibleCount] = useState(20);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
  }, [sortKey]);

  const sorted = useMemo(() => {
    const filtered = coins.filter((c: any) => c.price > 0 && !['BUIDL', 'USYC', 'FIGR_HELOC'].includes(c.symbol));
    return [...filtered].sort((a: any, b: any) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'rank': av = a.rank; bv = b.rank; break;
        case 'price': av = a.price; bv = b.price; break;
        case 'change24h': av = a.change24h; bv = b.change24h; break;
        case 'volume': av = a.volume; bv = b.volume; break;
        case 'marketCap': av = a.marketCap; bv = b.marketCap; break;
        default: av = a.rank; bv = b.rank;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [coins, sortKey, sortDir]);

  const visible = sorted.slice(0, visibleCount);

  const SortHeader = ({ label, k, className = '' }: { label: string; k: SortKey; className?: string }) => (
    <th
      className={cn("py-2 sm:py-3 px-1.5 sm:px-3 cursor-pointer select-none hover:text-primary transition-colors group", className)}
      onClick={() => handleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k ? (
          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
        )}
      </span>
    </th>
  );

  if (coins.length === 0) return null;

  return (
    <div className="holo-card p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      <h2 className="font-display text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        ALL CRYPTOCURRENCIES
        <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal">{sorted.length} coins • Click headers to sort</span>
      </h2>
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-muted-foreground text-[10px] sm:text-xs font-display border-b border-border uppercase">
              <SortHeader label="#" k="rank" className="text-left w-10" />
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 text-left">Coin</th>
              <SortHeader label="Price" k="price" className="text-right" />
              <SortHeader label="24h %" k="change24h" className="text-right" />
              <SortHeader label="Volume" k="volume" className="text-right hidden sm:table-cell" />
              <SortHeader label="Market Cap" k="marketCap" className="text-right hidden md:table-cell" />
            </tr>
          </thead>
          <tbody>
            {visible.map((coin: any) => (
              <tr
                key={coin.symbol}
                onClick={() => navigate(`/price-prediction/${coin.name?.toLowerCase() || coin.symbol?.toLowerCase()}/daily`)}
                className="border-b border-border/30 hover:bg-primary/5 cursor-pointer transition-colors"
              >
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-muted-foreground text-xs sm:text-sm">{coin.rank}</td>
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary">{coin.symbol[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-display font-bold text-xs sm:text-sm text-primary">{coin.symbol}</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs ml-1.5 hidden sm:inline">{coin.name}</span>
                    </div>
                    {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 text-warning flex-shrink-0" />}
                  </div>
                </td>
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-right font-medium text-xs sm:text-sm">
                  ${coin.price >= 1
                    ? coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : coin.price.toLocaleString(undefined, { maximumSignificantDigits: 4 })}
                </td>
                <td className={cn(
                  "py-2.5 sm:py-3 px-1.5 sm:px-3 text-right font-medium text-xs sm:text-sm",
                  coin.change24h >= 0 ? "text-success" : "text-danger"
                )}>
                  <span className="inline-flex items-center gap-0.5">
                    {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                  </span>
                </td>
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-right text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                  {formatNumber(coin.volume)}
                </td>
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-right text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
                  {formatNumber(coin.marketCap)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleCount < sorted.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount(v => Math.min(v + 20, sorted.length))}
            className="px-6 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-display hover:bg-primary/20 transition-colors"
          >
            Show More ({sorted.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 md:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold">
              <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">DASHBOARD</span>
            </h1>
            <p className="text-muted-foreground text-[10px] sm:text-xs flex items-center gap-1.5 mt-1">
              <Clock className="w-3 h-3" />
              Updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] sm:text-xs text-muted-foreground font-display">LIVE</span>
            </div>
            <Link 
              to="/chain/ethereum"
              className="text-[10px] sm:text-xs text-primary hover:text-primary/80 font-display flex items-center gap-1"
            >
              Advanced <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              {[
                { label: "Market Cap", value: global ? formatNumber(global.totalMarketCap) : null, icon: Globe, change: global?.marketCapChange24h, link: "/sentiment" },
                { label: "24h Volume", value: global ? formatNumber(global.totalVolume24h) : null, icon: Activity, link: "/dashboard" },
                { label: "Active Coins", value: global ? global.activeCryptocurrencies.toLocaleString() : null, icon: Zap, link: "/explorer" },
                { label: "BTC Dom", value: global ? `${global.btcDominance.toFixed(1)}%` : null, icon: TrendingUp, link: "/chain/bitcoin" },
              ].map((stat) => (
                <Link 
                  key={stat.label} 
                  to={stat.link}
                  className="holo-card p-2.5 sm:p-3 md:p-4 card-touch group"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground font-display uppercase truncate">{stat.label}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                    {stat.value ?? <span className="inline-block h-6 w-20 bg-muted animate-pulse rounded" />}
                  </div>
                  {stat.change !== undefined && (
                    <div className={cn(
                      "text-[9px] sm:text-[10px] md:text-xs flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1",
                      stat.change >= 0 ? "text-success" : "text-danger"
                    )}>
                      {stat.change >= 0 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      {stat.change >= 0 ? "+" : ""}{stat.change.toFixed(1)}%
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Global Metrics Summary - More data */}
            <GlobalMetricsSummary />

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Fear & Greed + AI */}
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
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
            <div className="mb-4 sm:mb-6">
              <h2 className="font-display text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                TOP CRYPTOS
                <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal hidden sm:inline">Click for details</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {topCoins.map((coin) => {
                  const trend = coin.change24h >= 2 ? "BULLISH" : coin.change24h <= -2 ? "BEARISH" : "NEUTRAL";
                  
                  return (
                    <Link 
                      key={coin.symbol} 
                      to={`/price-prediction/${coin.name?.toLowerCase() || coin.symbol?.toLowerCase()}/daily`}
                      className="holo-card p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-3 card-touch text-left group block"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="font-display font-bold text-primary text-[10px] sm:text-xs">{coin.symbol[0]}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-primary text-xs sm:text-sm truncate">{coin.symbol}</h3>
                            <p className="text-[8px] sm:text-[10px] text-muted-foreground truncate">{coin.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />}
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base md:text-lg font-bold truncate">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          <div className={cn(
                            "flex items-center gap-0.5 text-[10px] sm:text-xs font-medium",
                            coin.change24h >= 0 ? "text-success" : "text-danger"
                          )}>
                            {coin.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </div>
                        </div>
                        <span className={cn(
                          "text-[8px] sm:text-[10px] font-display font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0",
                          trend === "BULLISH" ? "text-success bg-success/20" : trend === "BEARISH" ? "text-danger bg-danger/20" : "text-warning bg-warning/20"
                        )}>
                          {trend}
                        </span>
                      </div>

                      <div className="hidden sm:block">
                        <CryptoChart price={coin.price} isPositive={coin.change24h >= 0} />
                      </div>

                      <div className="flex justify-between text-[8px] sm:text-[10px] text-muted-foreground pt-1.5 sm:pt-2 border-t border-border/50">
                        <span className="truncate">Vol: {formatNumber(coin.volume)}</span>
                        <span className="truncate ml-1">MCap: {formatNumber(coin.marketCap)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Heat Map - Clickable */}
            <div className="holo-card p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
              <h2 className="font-display text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                MARKET HEAT MAP
                <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal hidden sm:inline">Click any coin</span>
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                The heat map provides a visual overview of market performance. Green indicates positive 24-hour price changes (bullish), 
                while red indicates negative changes (bearish). Color intensity reflects the magnitude of the price movement.
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 sm:gap-2">
                {topCoins.slice(0, 16).map((coin) => (
                  <Link
                    key={coin.symbol}
                    to={`/price-prediction/${coin.symbol.toLowerCase()}/daily`}
                    className={cn(
                      "p-1.5 sm:p-2 md:p-3 rounded-lg text-center transition-all card-touch",
                      coin.change24h >= 3 ? "bg-success/30 border border-success/50" :
                      coin.change24h >= 0 ? "bg-success/20 border border-success/30" :
                      coin.change24h >= -3 ? "bg-danger/20 border border-danger/30" :
                      "bg-danger/30 border border-danger/50"
                    )}
                  >
                    <div className="font-display font-bold text-[10px] sm:text-xs truncate">{coin.symbol}</div>
                    <div className={cn(
                      "text-[9px] sm:text-[10px] md:text-xs font-medium",
                      coin.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(1)}%
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
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
