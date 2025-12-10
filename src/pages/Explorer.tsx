import { Layout } from "@/components/layout/Layout";
import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, Activity, BarChart3, Shield, Zap, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toLocaleString()}`;
}

const ExplorerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: marketData, isLoading } = useMarketData();
  
  const allCoins = useMemo(() => marketData?.topCoins || [], [marketData]);
  
  // Real-time search filtering
  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return allCoins;
    const query = searchQuery.toLowerCase().trim();
    return allCoins.filter(
      c => c.symbol.toLowerCase().includes(query) || 
           c.name.toLowerCase().includes(query)
    );
  }, [allCoins, searchQuery]);

  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  
  const selectedToken = useMemo(() => {
    return allCoins.find(c => c.symbol === selectedSymbol) || allCoins[0];
  }, [allCoins, selectedSymbol]);

  const { data: aiData, isLoading: aiLoading } = useAIForecast(
    selectedToken ? { 
      symbol: selectedToken.symbol, 
      price: selectedToken.price, 
      change24h: selectedToken.change24h,
      volume: selectedToken.volume 
    } : null,
    "coin_forecast",
    !!selectedToken
  );

  const forecast = aiData?.forecast;

  // Generate chart data based on current price
  const chartData = useMemo(() => {
    if (!selectedToken) return [];
    return Array.from({ length: 7 }, (_, i) => ({
      time: `${i + 1}D`,
      price: selectedToken.price * (0.97 + Math.random() * 0.06),
    })).map((item, i, arr) => {
      if (i === arr.length - 1) return { ...item, price: selectedToken.price };
      return item;
    });
  }, [selectedToken]);

  const popularTokens = useMemo(() => {
    return allCoins.slice(0, 8).map(c => ({ symbol: c.symbol, name: c.name }));
  }, [allCoins]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-display text-sm md:text-base">Loading token data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-6 md:mb-10 space-y-2 md:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold">
            <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">EXPLORER</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-lg max-w-2xl mx-auto px-4">
            Search any token by name or symbol • Real-time Live Data
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6 md:mb-8">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search token name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 md:pl-12 h-12 md:h-14 text-sm md:text-lg bg-muted/50 border-primary/30 focus:border-primary"
            />
          </div>
          
          {/* Quick Select Tokens */}
          <div className="flex flex-wrap gap-2 mt-3 md:mt-4 justify-center">
            {popularTokens.map((token) => (
              <Button
                key={token.symbol}
                variant={selectedSymbol === token.symbol ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedSymbol(token.symbol);
                  setSearchQuery("");
                }}
                className="text-xs md:text-sm"
              >
                {token.symbol}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results - Real-time */}
        {searchQuery && (
          <div className="max-w-4xl mx-auto mb-6 md:mb-8">
            <div className="holo-card p-4 md:p-6">
              <h3 className="font-display text-sm md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Search Results ({filteredCoins.length})
              </h3>
              {filteredCoins.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCoins.slice(0, 12).map((coin) => (
                    <button
                      key={coin.symbol}
                      onClick={() => {
                        setSelectedSymbol(coin.symbol);
                        setSearchQuery("");
                      }}
                      className="p-3 md:p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-display font-bold text-primary text-sm md:text-base">{coin.symbol}</span>
                          <p className="text-xs text-muted-foreground truncate">{coin.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          <p className={cn(
                            "text-xs",
                            coin.change24h >= 0 ? "text-success" : "text-danger"
                          )}>
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No tokens found matching "{searchQuery}"</p>
              )}
            </div>
          </div>
        )}

        {/* Selected Token Details */}
        {selectedToken && !searchQuery && (
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Header Card */}
              <div className="holo-card p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-display font-bold text-primary text-sm md:text-base">{selectedToken.symbol[0]}</span>
                    </div>
                    <div>
                      <h2 className="font-display text-lg md:text-2xl font-bold">{selectedToken.name}</h2>
                      <span className="text-muted-foreground text-sm">{selectedToken.symbol} • Rank #{selectedToken.rank}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl md:text-3xl font-bold">${selectedToken.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={cn(
                      "flex items-center gap-1 sm:justify-end",
                      selectedToken.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {selectedToken.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-medium">{selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}% (24h)</span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-48 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="hsl(200, 30%, 60%)" fontSize={12} />
                      <YAxis stroke="hsl(200, 30%, 60%)" fontSize={10} domain={["dataMin - 500", "dataMax + 500"]} tickFormatter={(v) => `$${v.toLocaleString()}`} />
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
                        stroke="hsl(190, 100%, 50%)"
                        strokeWidth={2}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "24h Volume", value: formatNumber(selectedToken.volume), icon: BarChart3 },
                  { label: "Market Cap", value: formatNumber(selectedToken.marketCap), icon: Activity },
                  { label: "Rank", value: `#${selectedToken.rank}`, icon: TrendingUp },
                  { label: "Volatility", value: Math.abs(selectedToken.change24h) > 5 ? "High" : Math.abs(selectedToken.change24h) > 2 ? "Medium" : "Low", icon: Zap },
                ].map((stat) => (
                  <div key={stat.label} className="holo-card p-3 md:p-4 text-center">
                    <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto mb-1 md:mb-2" />
                    <div className="text-xs text-muted-foreground font-display">{stat.label}</div>
                    <div className="text-sm md:text-lg font-bold text-foreground">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* All Tokens Table */}
              <div className="holo-card p-4 md:p-6">
                <h3 className="font-display text-sm md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  ALL TOKENS
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs font-display border-b border-border">
                        <th className="text-left py-2 px-2">#</th>
                        <th className="text-left py-2 px-2">Token</th>
                        <th className="text-right py-2 px-2">Price</th>
                        <th className="text-right py-2 px-2">24h</th>
                        <th className="text-right py-2 px-2 hidden sm:table-cell">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCoins.map((coin) => (
                        <tr 
                          key={coin.symbol}
                          onClick={() => setSelectedSymbol(coin.symbol)}
                          className={cn(
                            "border-b border-border/50 cursor-pointer transition-colors",
                            selectedSymbol === coin.symbol ? "bg-primary/10" : "hover:bg-muted/30"
                          )}
                        >
                          <td className="py-2 px-2 text-muted-foreground text-xs">{coin.rank}</td>
                          <td className="py-2 px-2">
                            <span className="font-display font-bold text-primary">{coin.symbol}</span>
                            <span className="text-muted-foreground text-xs ml-1 hidden sm:inline">{coin.name}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-medium">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className={cn(
                            "py-2 px-2 text-right font-medium",
                            coin.change24h >= 0 ? "text-success" : "text-danger"
                          )}>
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </td>
                          <td className="py-2 px-2 text-right text-muted-foreground hidden sm:table-cell">{formatNumber(coin.volume)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* AI Forecast */}
              <div className="holo-card p-4 md:p-6">
                <h3 className="font-display font-bold text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  AI FORECAST
                  {aiLoading && <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />}
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div className={cn(
                    "text-center p-3 md:p-4 rounded-lg border",
                    forecast?.trend === "bullish" ? "bg-success/10 border-success/30" :
                    forecast?.trend === "bearish" ? "bg-danger/10 border-danger/30" : 
                    selectedToken.change24h >= 0 ? "bg-success/10 border-success/30" : "bg-danger/10 border-danger/30"
                  )}>
                    <div className={cn(
                      "font-display text-xl md:text-2xl font-bold",
                      forecast?.trend === "bullish" ? "text-success" :
                      forecast?.trend === "bearish" ? "text-danger" : 
                      selectedToken.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {forecast?.trend?.toUpperCase() || (selectedToken.change24h >= 0 ? "BULLISH" : "BEARISH")}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Overall Sentiment</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground font-display">24H PREDICTION</div>
                      <div className={cn(
                        "text-sm md:text-lg font-bold",
                        selectedToken.change24h >= 0 ? "text-success" : "text-danger"
                      )}>
                        {forecast?.prediction24h === "up" ? "↑ UP" : forecast?.prediction24h === "down" ? "↓ DOWN" : selectedToken.change24h >= 0 ? "↑ UP" : "↓ DOWN"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground font-display">STRENGTH</div>
                      <div className="text-sm md:text-lg font-bold text-foreground">
                        {forecast?.strength || (Math.abs(selectedToken.change24h) > 5 ? "Strong" : "Moderate")}
                      </div>
                    </div>
                  </div>
                  {forecast?.reasoning && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-3 md:mt-4">{forecast.reasoning}</p>
                  )}
                </div>
              </div>

              {/* Support/Resistance */}
              <div className="holo-card p-4 md:p-6">
                <h3 className="font-display font-bold text-sm md:text-base mb-3 md:mb-4">TRADING RANGE</h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span className="text-muted-foreground">Resistance</span>
                      <span className="text-danger font-bold">
                        ${(forecast?.resistanceLevel || selectedToken.price * 1.05).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-2 bg-danger/30 rounded-full" />
                  </div>
                  <div className="text-center py-2">
                    <span className="text-primary font-bold text-sm md:text-base">${selectedToken.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className="text-muted-foreground text-xs ml-2">Current</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span className="text-muted-foreground">Support</span>
                      <span className="text-success font-bold">
                        ${(forecast?.supportLevel || selectedToken.price * 0.95).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-2 bg-success/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div className="holo-card p-4 md:p-6">
                <h3 className="font-display font-bold text-sm md:text-base mb-3 md:mb-4">TOKEN STATS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs md:text-sm">Market Cap</span>
                    <span className="font-bold text-xs md:text-sm">{formatNumber(selectedToken.marketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs md:text-sm">24h Volume</span>
                    <span className="font-bold text-xs md:text-sm">{formatNumber(selectedToken.volume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs md:text-sm">Global Rank</span>
                    <span className="font-bold text-xs md:text-sm text-primary">#{selectedToken.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs md:text-sm">Vol/MCap Ratio</span>
                    <span className="font-bold text-xs md:text-sm">{((selectedToken.volume / selectedToken.marketCap) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExplorerPage;
