import { Layout } from "@/components/layout/Layout";
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function CryptoChart({ price, isPositive }: { price: number; isPositive: boolean }) {
  // Generate sample data based on current price with some variation
  const data = Array.from({ length: 7 }, (_, i) => ({
    time: `${i}D`,
    price: price * (0.95 + Math.random() * 0.1),
  }));
  data[data.length - 1].price = price; // Current price as last point

  return (
    <ResponsiveContainer width="100%" height={120}>
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
  
  const topCoins = marketData?.topCoins?.slice(0, 3) || [];
  const global = marketData?.global;
  
  // Get AI forecast for market sentiment
  const { data: aiData } = useAIForecast(
    topCoins.length > 0 ? topCoins : null,
    "market_sentiment",
    topCoins.length > 0
  );

  const isLoading = pricesLoading || marketLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold">
            <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">DASHBOARD</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Real-time AI predictions and market analysis • Live Data
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-display">Loading live market data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Market Cap", value: global ? formatNumber(global.totalMarketCap) : "...", icon: BarChart3, change: global ? `${global.marketCapChange24h >= 0 ? "+" : ""}${global.marketCapChange24h.toFixed(1)}%` : "" },
                { label: "24h Volume", value: global ? formatNumber(global.totalVolume24h) : "...", icon: Activity, change: "" },
                { label: "Active Coins", value: global ? global.activeCryptocurrencies.toLocaleString() : "...", icon: Zap, change: "" },
                { label: "BTC Dominance", value: global ? `${global.btcDominance.toFixed(1)}%` : "...", icon: TrendingUp, change: "" },
              ].map((stat) => (
                <div key={stat.label} className="holo-card p-4 text-center">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground font-display uppercase">{stat.label}</div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  {stat.change && <div className={cn("text-xs", stat.change.startsWith("+") ? "text-success" : "text-danger")}>{stat.change}</div>}
                </div>
              ))}
            </div>

            {/* Coin Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCoins.map((coin) => {
                const trend = coin.change24h >= 2 ? "BULLISH" : coin.change24h <= -2 ? "BEARISH" : "NEUTRAL";
                const strength = Math.abs(coin.change24h) >= 5 ? "Strong" : Math.abs(coin.change24h) >= 2 ? "Moderate" : "Weak";
                
                return (
                  <div key={coin.symbol} className="holo-card p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-primary">{coin.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{coin.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className={cn(
                          "flex items-center gap-1 text-sm font-medium justify-end",
                          coin.change24h >= 0 ? "text-success" : "text-danger"
                        )}>
                          {coin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    <CryptoChart price={coin.price} isPositive={coin.change24h >= 0} />

                    {/* Predictions */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground font-display">TREND</div>
                        <div className={cn(
                          "text-sm font-bold",
                          trend === "BULLISH" ? "text-success" : trend === "BEARISH" ? "text-danger" : "text-warning"
                        )}>
                          {trend}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground font-display">STRENGTH</div>
                        <div className="text-sm font-bold text-foreground">{strength}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground font-display">24H</div>
                        <div className={cn(
                          "text-sm font-bold",
                          coin.change24h >= 0 ? "text-success" : "text-danger"
                        )}>
                          {coin.change24h >= 0 ? "UP" : "DOWN"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Heat Map Section */}
            <div className="mt-12">
              <h2 className="font-display text-2xl font-bold mb-6 text-center">
                MARKET <span className="glow-text">HEAT MAP</span>
              </h2>
              <div className="holo-card p-6">
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {(marketData?.topCoins?.slice(0, 16) || []).map((coin) => {
                    const heat = 50 + coin.change24h * 5; // Map change to heat
                    return (
                      <div
                        key={coin.symbol}
                        className="aspect-square rounded-lg flex items-center justify-center font-display font-bold text-sm transition-transform hover:scale-110 cursor-pointer"
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
                        {coin.symbol}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-danger/60" />
                    <span className="text-muted-foreground">Cold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-warning/60" />
                    <span className="text-muted-foreground">Warm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success/80" />
                    <span className="text-muted-foreground">Hot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {aiData?.forecast && (
              <div className="mt-12">
                <h2 className="font-display text-2xl font-bold mb-6 text-center">
                  AI <span className="glow-text">INSIGHTS</span>
                </h2>
                <div className="holo-card p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground font-display">OVERALL SENTIMENT</div>
                      <div className={cn(
                        "text-2xl font-bold font-display mt-2",
                        aiData.forecast.overallSentiment === "bullish" ? "text-success" :
                        aiData.forecast.overallSentiment === "bearish" ? "text-danger" : "text-warning"
                      )}>
                        {aiData.forecast.overallSentiment?.toUpperCase() || "ANALYZING..."}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground font-display">CONFIDENCE</div>
                      <div className="text-2xl font-bold text-primary mt-2">
                        {aiData.forecast.confidence || 0}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground font-display">RISK LEVEL</div>
                      <div className={cn(
                        "text-2xl font-bold font-display mt-2",
                        aiData.forecast.riskLevel === "low" ? "text-success" :
                        aiData.forecast.riskLevel === "high" ? "text-danger" : "text-warning"
                      )}>
                        {aiData.forecast.riskLevel?.toUpperCase() || "MEDIUM"}
                      </div>
                    </div>
                  </div>
                  {aiData.forecast.shortTermOutlook && (
                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground">{aiData.forecast.shortTermOutlook}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
