import { Layout } from "@/components/layout/Layout";
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3, Loader2, Brain, Flame, Globe, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { useMemo, useState, useEffect } from "react";
import { MarketMomentum } from "@/components/dashboard/MarketMomentum";
import { TrendingAlerts } from "@/components/dashboard/TrendingAlerts";
import { VolumeLeaders } from "@/components/dashboard/VolumeLeaders";
import { DominanceChart } from "@/components/dashboard/DominanceChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CoinDetailModal } from "@/components/dashboard/CoinDetailModal";
import { MarketInsightsPanel } from "@/components/dashboard/MarketInsightsPanel";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { Link } from "react-router-dom";

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

const Dashboard = () => {
  const { data: pricesData, isLoading: pricesLoading } = useCryptoPrices();
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  
  const topCoins = useMemo(() => marketData?.topCoins?.slice(0, 8) || [], [marketData]);
  const global = marketData?.global;
  const fearGreedIndex = marketData?.fearGreedIndex || 50;
  
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
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">DASHBOARD</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground font-display">LIVE DATA</span>
            </div>
            <Link 
              to="/chain/ethereum"
              className="text-xs text-primary hover:text-primary/80 font-display flex items-center gap-1"
            >
              Advanced Analysis <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-display text-sm">Loading live market data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="mb-6">
              <QuickActions />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              {[
                { label: "Total Market Cap", value: global ? formatNumber(global.totalMarketCap) : "$3.2T", icon: Globe, change: global?.marketCapChange24h, link: "/sentiment" },
                { label: "24h Volume", value: global ? formatNumber(global.totalVolume24h) : "$120B", icon: Activity, link: "/dashboard" },
                { label: "Active Coins", value: global ? global.activeCryptocurrencies.toLocaleString() : "14,500", icon: Zap, link: "/explorer" },
                { label: "BTC Dominance", value: global ? `${global.btcDominance.toFixed(1)}%` : "55%", icon: TrendingUp, link: "/chain/bitcoin" },
              ].map((stat) => (
                <Link 
                  key={stat.label} 
                  to={stat.link}
                  className="holo-card p-3 md:p-4 hover:scale-[1.02] transition-transform group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] md:text-xs text-muted-foreground font-display uppercase">{stat.label}</span>
                    <ArrowRight className="w-3 h-3 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</div>
                  {stat.change !== undefined && (
                    <div className={cn(
                      "text-[10px] md:text-xs flex items-center gap-1 mt-1",
                      stat.change >= 0 ? "text-success" : "text-danger"
                    )}>
                      {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change >= 0 ? "+" : ""}{stat.change.toFixed(1)}% 24h
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Fear & Greed + AI */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Fear & Greed - Clickable */}
                  <Link to="/sentiment" className="holo-card p-4 md:p-6 hover:scale-[1.02] transition-transform group">
                    <h3 className="font-display text-sm md:text-base font-bold mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      FEAR & GREED INDEX
                      <ArrowRight className="w-4 h-4 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
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
                            "text-2xl font-display font-bold",
                            fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                          )}>
                            {fearGreedIndex}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className={cn(
                          "text-xl font-display font-bold mb-1",
                          fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                        )}>
                          {fearGreedIndex >= 80 ? "Extreme Greed" : fearGreedIndex >= 60 ? "Greed" : fearGreedIndex >= 40 ? "Neutral" : fearGreedIndex >= 20 ? "Fear" : "Extreme Fear"}
                        </div>
                        <p className="text-xs text-muted-foreground">Click for deep sentiment analysis</p>
                      </div>
                    </div>
                  </Link>

                  {/* AI Insights */}
                  <div className="holo-card p-4 md:p-6">
                    <h3 className="font-display text-sm md:text-base font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      AI INSIGHTS
                    </h3>
                    {aiData?.forecast ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <div className="text-[10px] text-muted-foreground font-display">SENTIMENT</div>
                            <div className={cn(
                              "text-sm font-bold",
                              aiData.forecast.overallSentiment === "bullish" ? "text-success" : aiData.forecast.overallSentiment === "bearish" ? "text-danger" : "text-warning"
                            )}>
                              {aiData.forecast.overallSentiment?.toUpperCase() || "NEUTRAL"}
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <div className="text-[10px] text-muted-foreground font-display">CONFIDENCE</div>
                            <div className="text-sm font-bold text-primary">{aiData.forecast.confidence || 65}%</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <div className="text-[10px] text-muted-foreground font-display">RISK</div>
                            <div className={cn(
                              "text-sm font-bold",
                              aiData.forecast.riskLevel === "low" ? "text-success" : aiData.forecast.riskLevel === "high" ? "text-danger" : "text-warning"
                            )}>
                              {aiData.forecast.riskLevel?.toUpperCase() || "MEDIUM"}
                            </div>
                          </div>
                        </div>
                        {aiData.forecast.shortTermOutlook && (
                          <p className="text-xs text-muted-foreground">{aiData.forecast.shortTermOutlook}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                <MarketMomentum />
                <MarketInsightsPanel />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <TrendingAlerts />
                <TopPerformers onCoinClick={setSelectedCoin} />
              </div>
            </div>

            {/* Volume & Dominance */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <VolumeLeaders />
              <DominanceChart />
            </div>

            {/* Coin Cards - Clickable */}
            <div className="mb-6">
              <h2 className="font-display text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-warning" />
                TOP CRYPTOCURRENCIES
                <span className="ml-auto text-xs text-muted-foreground font-normal">Click for details</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topCoins.map((coin) => {
                  const trend = coin.change24h >= 2 ? "BULLISH" : coin.change24h <= -2 ? "BEARISH" : "NEUTRAL";
                  
                  return (
                    <button 
                      key={coin.symbol} 
                      onClick={() => setSelectedCoin(coin)}
                      className="holo-card p-4 space-y-3 hover:scale-[1.02] transition-transform text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-display font-bold text-primary text-xs">{coin.symbol[0]}</span>
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-primary">{coin.symbol}</h3>
                            <p className="text-[10px] text-muted-foreground">{coin.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Math.abs(coin.change24h) > 5 && <Flame className="w-4 h-4 text-warning" />}
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-lg font-bold">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          <div className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            coin.change24h >= 0 ? "text-success" : "text-danger"
                          )}>
                            {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </div>
                        </div>
                        <span className={cn(
                          "text-[10px] font-display font-bold px-2 py-1 rounded",
                          trend === "BULLISH" ? "text-success bg-success/20" : trend === "BEARISH" ? "text-danger bg-danger/20" : "text-warning bg-warning/20"
                        )}>
                          {trend}
                        </span>
                      </div>

                      <CryptoChart price={coin.price} isPositive={coin.change24h >= 0} />

                      <div className="flex justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                        <span>Vol: {formatNumber(coin.volume)}</span>
                        <span>MCap: {formatNumber(coin.marketCap)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heat Map - Clickable */}
            <div className="holo-card p-4 md:p-6">
              <h2 className="font-display text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                MARKET HEAT MAP
                <span className="ml-auto text-xs text-muted-foreground font-normal">Click any coin for details</span>
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {(marketData?.topCoins?.slice(0, 16) || []).map((coin) => {
                  const heat = 50 + coin.change24h * 5;
                  return (
                    <button
                      key={coin.symbol}
                      onClick={() => setSelectedCoin(coin)}
                      className="aspect-square rounded-lg flex flex-col items-center justify-center font-display font-bold text-xs transition-all hover:scale-110 cursor-pointer p-1"
                      style={{
                        background: heat > 70
                          ? `hsl(160 84% ${20 + heat * 0.3}% / 0.8)`
                          : heat > 40
                            ? `hsl(38 92% ${30 + heat * 0.2}% / 0.6)`
                            : `hsl(0 84% ${25 + heat * 0.2}% / 0.6)`,
                        boxShadow: heat > 70
                          ? "0 0 15px hsl(160 84% 39% / 0.5)"
                          : "none",
                      }}
                    >
                      <span>{coin.symbol}</span>
                      <span className="text-[8px] opacity-80">{coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(1)}%</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-danger/60" />
                  <span className="text-muted-foreground">Bearish</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-warning/60" />
                  <span className="text-muted-foreground">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-success/80" />
                  <span className="text-muted-foreground">Bullish</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Coin Detail Modal */}
      <CoinDetailModal
        coin={selectedCoin}
        open={!!selectedCoin}
        onOpenChange={(open) => !open && setSelectedCoin(null)}
      />
    </Layout>
  );
};

export default Dashboard;
