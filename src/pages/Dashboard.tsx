import { Layout } from "@/components/layout/Layout";
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3, Loader2, Brain, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { useMemo } from "react";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function CryptoChart({ price, isPositive }: { price: number; isPositive: boolean }) {
  const data = useMemo(() => {
    const points = Array.from({ length: 7 }, (_, i) => ({
      time: `${i}D`,
      price: price * (0.95 + Math.random() * 0.1),
    }));
    points[points.length - 1].price = price;
    return points;
  }, [price]);

  return (
    <ResponsiveContainer width="100%" height={100}>
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
  
  const topCoins = useMemo(() => marketData?.topCoins?.slice(0, 6) || [], [marketData]);
  const global = marketData?.global;
  const fearGreedIndex = marketData?.fearGreedIndex || 50;
  
  const { data: aiData } = useAIForecast(
    topCoins.length > 0 ? topCoins : null,
    "market_sentiment",
    topCoins.length > 0
  );

  const isLoading = pricesLoading || marketLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10 space-y-2 md:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold">
            <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">DASHBOARD</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-lg max-w-2xl mx-auto">
            Real-time AI predictions and market analysis • Live Data
          </p>
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
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              {[
                { label: "Total Market Cap", value: global ? formatNumber(global.totalMarketCap) : "$3.2T", icon: BarChart3, change: global ? `${global.marketCapChange24h >= 0 ? "+" : ""}${global.marketCapChange24h.toFixed(1)}%` : "" },
                { label: "24h Volume", value: global ? formatNumber(global.totalVolume24h) : "$120B", icon: Activity, change: "" },
                { label: "Active Coins", value: global ? global.activeCryptocurrencies.toLocaleString() : "14,500", icon: Zap, change: "" },
                { label: "BTC Dominance", value: global ? `${global.btcDominance.toFixed(1)}%` : "55%", icon: TrendingUp, change: "" },
              ].map((stat) => (
                <div key={stat.label} className="holo-card p-3 md:p-4 text-center">
                  <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto mb-1 md:mb-2" />
                  <div className="text-[10px] md:text-xs text-muted-foreground font-display uppercase">{stat.label}</div>
                  <div className="text-base md:text-xl font-bold text-foreground">{stat.value}</div>
                  {stat.change && <div className={cn("text-[10px] md:text-xs", stat.change.startsWith("+") ? "text-success" : "text-danger")}>{stat.change}</div>}
                </div>
              ))}
            </div>

            {/* Fear & Greed + AI Insights Row */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Fear & Greed */}
              <div className="holo-card p-4 md:p-6">
                <h3 className="font-display text-sm md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  FEAR & GREED INDEX
                </h3>
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="relative w-20 h-20 md:w-28 md:h-28 flex-shrink-0">
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
                        "text-xl md:text-3xl font-display font-bold",
                        fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                      )}>
                        {fearGreedIndex}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className={cn(
                      "text-lg md:text-2xl font-display font-bold mb-1",
                      fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                    )}>
                      {fearGreedIndex >= 80 ? "Extreme Greed" : fearGreedIndex >= 60 ? "Greed" : fearGreedIndex >= 40 ? "Neutral" : fearGreedIndex >= 20 ? "Fear" : "Extreme Fear"}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">Market sentiment indicator based on volatility, momentum, and social metrics.</p>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="holo-card p-4 md:p-6">
                <h3 className="font-display text-sm md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  AI MARKET INSIGHTS
                </h3>
                {aiData?.forecast ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      <div className="text-center">
                        <div className="text-[10px] md:text-xs text-muted-foreground font-display">SENTIMENT</div>
                        <div className={cn(
                          "text-sm md:text-lg font-bold",
                          aiData.forecast.overallSentiment === "bullish" ? "text-success" : aiData.forecast.overallSentiment === "bearish" ? "text-danger" : "text-warning"
                        )}>
                          {aiData.forecast.overallSentiment?.toUpperCase() || "NEUTRAL"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] md:text-xs text-muted-foreground font-display">CONFIDENCE</div>
                        <div className="text-sm md:text-lg font-bold text-primary">{aiData.forecast.confidence || 65}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] md:text-xs text-muted-foreground font-display">RISK</div>
                        <div className={cn(
                          "text-sm md:text-lg font-bold",
                          aiData.forecast.riskLevel === "low" ? "text-success" : aiData.forecast.riskLevel === "high" ? "text-danger" : "text-warning"
                        )}>
                          {aiData.forecast.riskLevel?.toUpperCase() || "MEDIUM"}
                        </div>
                      </div>
                    </div>
                    {aiData.forecast.shortTermOutlook && (
                      <p className="text-xs md:text-sm text-muted-foreground">{aiData.forecast.shortTermOutlook}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Coin Cards */}
            <div className="mb-6 md:mb-8">
              <h2 className="font-display text-lg md:text-2xl font-bold mb-4 md:mb-6 text-center">
                TOP <span className="glow-text">CRYPTOCURRENCIES</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {topCoins.map((coin) => {
                  const trend = coin.change24h >= 2 ? "BULLISH" : coin.change24h <= -2 ? "BEARISH" : "NEUTRAL";
                  const strength = Math.abs(coin.change24h) >= 5 ? "Strong" : Math.abs(coin.change24h) >= 2 ? "Moderate" : "Weak";
                  
                  return (
                    <div key={coin.symbol} className="holo-card p-4 md:p-6 space-y-3 md:space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-display font-bold text-primary text-xs md:text-sm">{coin.symbol[0]}</span>
                          </div>
                          <div>
                            <h3 className="font-display text-sm md:text-lg font-bold text-primary">{coin.symbol}</h3>
                            <p className="text-xs text-muted-foreground">{coin.name}</p>
                          </div>
                        </div>
                        {Math.abs(coin.change24h) > 5 && <Flame className="w-4 h-4 text-warning" />}
                      </div>

                      {/* Price */}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-lg md:text-2xl font-bold">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          <div className={cn(
                            "flex items-center gap-1 text-xs md:text-sm font-medium",
                            coin.change24h >= 0 ? "text-success" : "text-danger"
                          )}>
                            {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Vol: {formatNumber(coin.volume)}</div>
                          <div>MCap: {formatNumber(coin.marketCap)}</div>
                        </div>
                      </div>

                      {/* Chart */}
                      <CryptoChart price={coin.price} isPositive={coin.change24h >= 0} />

                      {/* Predictions */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                        <div className="text-center">
                          <div className="text-[10px] md:text-xs text-muted-foreground font-display">TREND</div>
                          <div className={cn(
                            "text-xs md:text-sm font-bold",
                            trend === "BULLISH" ? "text-success" : trend === "BEARISH" ? "text-danger" : "text-warning"
                          )}>
                            {trend}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] md:text-xs text-muted-foreground font-display">STRENGTH</div>
                          <div className="text-xs md:text-sm font-bold text-foreground">{strength}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] md:text-xs text-muted-foreground font-display">24H</div>
                          <div className={cn(
                            "text-xs md:text-sm font-bold",
                            coin.change24h >= 0 ? "text-success" : "text-danger"
                          )}>
                            {coin.change24h >= 0 ? "↑ UP" : "↓ DOWN"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Heat Map Section */}
            <div className="holo-card p-4 md:p-6">
              <h2 className="font-display text-lg md:text-xl font-bold mb-4 md:mb-6 text-center">
                MARKET <span className="glow-text">HEAT MAP</span>
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 md:gap-3">
                {(marketData?.topCoins?.slice(0, 16) || []).map((coin) => {
                  const heat = 50 + coin.change24h * 5;
                  return (
                    <div
                      key={coin.symbol}
                      className="aspect-square rounded-lg flex flex-col items-center justify-center font-display font-bold text-xs md:text-sm transition-transform hover:scale-105 cursor-pointer p-1"
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
                      <span className="text-[8px] md:text-[10px] opacity-80">{coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 md:gap-6 mt-4 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-danger/60" />
                  <span className="text-muted-foreground">Bearish</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-warning/60" />
                  <span className="text-muted-foreground">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-success/80" />
                  <span className="text-muted-foreground">Bullish</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
