import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Activity, BarChart3, Shield, Zap, Loader2, ExternalLink, Globe, Layers, Copy, CheckCircle, AlertTriangle, Clock, Target, Brain, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { toast } from "sonner";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toLocaleString()}`;
}

const CHAINS = [
  { id: "all", name: "All Chains", icon: Globe },
  { id: "ethereum", name: "Ethereum", icon: Layers },
  { id: "bsc", name: "BNB Chain", icon: Layers },
  { id: "solana", name: "Solana", icon: Layers },
  { id: "polygon", name: "Polygon", icon: Layers },
  { id: "arbitrum", name: "Arbitrum", icon: Layers },
  { id: "base", name: "Base", icon: Layers },
];

const ExplorerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { data: marketData, isLoading } = useMarketData();
  
  const allCoins = useMemo(() => marketData?.topCoins || [], [marketData]);
  
  // Real-time search filtering
  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return allCoins;
    const query = searchQuery.toLowerCase().trim();
    
    // Check if it's a contract address (starts with 0x)
    const isContractAddress = query.startsWith("0x") && query.length >= 10;
    
    return allCoins.filter(c => {
      if (isContractAddress) {
        // For contract addresses, we'd normally check against actual addresses
        // For now, match any coin for demo purposes
        return c.symbol.toLowerCase().includes(query.slice(2, 5)) || true;
      }
      return c.symbol.toLowerCase().includes(query) || 
             c.name.toLowerCase().includes(query);
    });
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
    const basePrice = selectedToken.price;
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: basePrice * (0.97 + Math.random() * 0.06),
      volume: selectedToken.volume * (0.5 + Math.random() * 0.5) / 24,
    })).map((item, i, arr) => {
      if (i === arr.length - 1) return { ...item, price: basePrice };
      return item;
    });
  }, [selectedToken]);

  // Mock contract address for demo
  const mockContractAddress = useMemo(() => {
    if (!selectedToken) return "";
    const hash = selectedToken.symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `0x${hash.toString(16).padStart(8, "0")}...${(hash * 2).toString(16).slice(0, 4)}`;
  }, [selectedToken]);

  const copyAddress = () => {
    navigator.clipboard.writeText(mockContractAddress);
    setCopiedAddress(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const popularTokens = useMemo(() => allCoins.slice(0, 8), [allCoins]);

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
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="glow-text">TOKEN</span> <span className="text-gradient-cosmic">EXPLORER</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Search any token by name, symbol, or contract address across all chains
          </p>
        </div>

        {/* Chain Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 justify-center">
          {CHAINS.map(chain => {
            const Icon = chain.icon;
            return (
              <Button
                key={chain.id}
                variant={selectedChain === chain.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChain(chain.id)}
                className="gap-2 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {chain.name}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, symbol, or contract address (0x...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base bg-muted/50 border-primary/30 focus:border-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Clear
              </Button>
            )}
          </div>
          
          {/* Quick Select Tokens */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {popularTokens.map((token) => (
              <Button
                key={token.symbol}
                variant={selectedSymbol === token.symbol ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedSymbol(token.symbol);
                  setSearchQuery("");
                }}
              >
                {token.symbol}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
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
                      className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-all text-left hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-display font-bold text-primary">{coin.symbol[0]}</span>
                          </div>
                          <div>
                            <span className="font-display font-bold text-primary">{coin.symbol}</span>
                            <p className="text-xs text-muted-foreground truncate">{coin.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          <p className={cn("text-xs font-bold", coin.change24h >= 0 ? "text-success" : "text-danger")}>
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No tokens found matching "{searchQuery}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Try searching by symbol (BTC, ETH) or full name</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Token Details */}
        {selectedToken && !searchQuery && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="holo-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-display font-bold text-primary text-xl">{selectedToken.symbol[0]}</span>
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold">{selectedToken.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground">{selectedToken.symbol}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Rank #{selectedToken.rank}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <div className="text-3xl font-bold">${selectedToken.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={cn("flex items-center gap-1 font-medium", selectedToken.change24h >= 0 ? "text-success" : "text-danger")}>
                      {selectedToken.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}% (24h)
                    </div>
                  </div>
                </div>

                {/* Contract Address */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-6">
                  <span className="text-xs text-muted-foreground">Contract:</span>
                  <code className="text-xs text-primary flex-1 truncate">{mockContractAddress}</code>
                  <Button variant="ghost" size="sm" onClick={copyAddress} className="gap-1">
                    {copiedAddress ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open(`https://etherscan.io`, "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                {/* Price Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="hsl(200, 30%, 60%)" fontSize={10} />
                      <YAxis stroke="hsl(200, 30%, 60%)" fontSize={10} domain={["dataMin * 0.99", "dataMax * 1.01"]} tickFormatter={(v) => `$${v.toLocaleString()}`} />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Market Cap", value: formatNumber(selectedToken.marketCap), icon: BarChart3, color: "text-primary" },
                  { label: "24h Volume", value: formatNumber(selectedToken.volume), icon: Activity, color: "text-secondary" },
                  { label: "Circulating Supply", value: `${(selectedToken.marketCap / selectedToken.price / 1e6).toFixed(1)}M`, icon: Globe, color: "text-warning" },
                  { label: "Volatility", value: Math.abs(selectedToken.change24h) > 5 ? "High" : Math.abs(selectedToken.change24h) > 2 ? "Medium" : "Low", icon: Zap, color: Math.abs(selectedToken.change24h) > 5 ? "text-danger" : "text-success" },
                ].map((stat) => (
                  <div key={stat.label} className="holo-card p-4 text-center">
                    <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                    <div className="text-xs text-muted-foreground font-display mb-1">{stat.label}</div>
                    <div className="text-lg font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Volume Chart */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  24H VOLUME DISTRIBUTION
                </h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="time" stroke="hsl(200, 30%, 60%)" fontSize={10} />
                      <YAxis stroke="hsl(200, 30%, 60%)" fontSize={10} tickFormatter={(v) => formatNumber(v)} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(230, 30%, 8%)",
                          border: "1px solid hsl(190, 100%, 50%, 0.3)",
                          borderRadius: "8px",
                          color: "hsl(200, 100%, 95%)",
                        }}
                        formatter={(value: number) => [formatNumber(value), "Volume"]}
                      />
                      <Bar dataKey="volume" fill="hsl(270, 60%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* All Tokens Table */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
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
                        <th className="text-right py-2 px-2 hidden md:table-cell">Market Cap</th>
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
                          <td className="py-3 px-2 text-muted-foreground text-xs">{coin.rank}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="font-display font-bold text-primary text-xs">{coin.symbol[0]}</span>
                              </div>
                              <div>
                                <span className="font-display font-bold text-primary">{coin.symbol}</span>
                                <span className="text-muted-foreground text-xs ml-1 hidden sm:inline">{coin.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-medium">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className={cn("py-3 px-2 text-right font-medium", coin.change24h >= 0 ? "text-success" : "text-danger")}>
                            {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </td>
                          <td className="py-3 px-2 text-right text-muted-foreground hidden sm:table-cell">{formatNumber(coin.volume)}</td>
                          <td className="py-3 px-2 text-right text-muted-foreground hidden md:table-cell">{formatNumber(coin.marketCap)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Forecast */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  AI ANALYSIS
                  {aiLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </h3>
                <div className="space-y-4">
                  <div className={cn(
                    "text-center p-4 rounded-lg border",
                    forecast?.trend === "bullish" || selectedToken.change24h >= 0 ? "bg-success/10 border-success/30" : "bg-danger/10 border-danger/30"
                  )}>
                    <div className={cn(
                      "font-display text-2xl font-bold",
                      forecast?.trend === "bullish" || selectedToken.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {forecast?.trend?.toUpperCase() || (selectedToken.change24h >= 0 ? "BULLISH" : "BEARISH")}
                    </div>
                    <div className="text-xs text-muted-foreground">AI Sentiment</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground">24H FORECAST</div>
                      <div className={cn("text-lg font-bold", selectedToken.change24h >= 0 ? "text-success" : "text-danger")}>
                        {selectedToken.change24h >= 0 ? "↑ UP" : "↓ DOWN"}
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground">CONFIDENCE</div>
                      <div className="text-lg font-bold text-primary">{forecast?.confidence || 72}%</div>
                    </div>
                  </div>
                  
                  {forecast?.reasoning && (
                    <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30">{forecast.reasoning}</p>
                  )}
                </div>
              </div>

              {/* Trading Range */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  TRADING LEVELS
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Resistance</span>
                      <span className="text-danger font-bold">
                        ${(selectedToken.price * 1.08).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-2 bg-danger/30 rounded-full" />
                  </div>
                  <div className="text-center py-3">
                    <div className="text-xs text-muted-foreground">Current Price</div>
                    <div className="text-xl font-bold text-primary">
                      ${selectedToken.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Support</span>
                      <span className="text-success font-bold">
                        ${(selectedToken.price * 0.92).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-2 bg-success/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  QUICK INSIGHTS
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">Trend Strength</span>
                    <span className={cn("font-bold text-sm", Math.abs(selectedToken.change24h) > 5 ? "text-warning" : "text-success")}>
                      {Math.abs(selectedToken.change24h) > 5 ? "Strong" : "Moderate"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">Volume Trend</span>
                    <span className="font-bold text-sm text-success">Above Avg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">Risk Level</span>
                    <span className={cn(
                      "font-bold text-sm",
                      Math.abs(selectedToken.change24h) > 10 ? "text-danger" : Math.abs(selectedToken.change24h) > 5 ? "text-warning" : "text-success"
                    )}>
                      {Math.abs(selectedToken.change24h) > 10 ? "High" : Math.abs(selectedToken.change24h) > 5 ? "Medium" : "Low"}
                    </span>
                  </div>
                </div>
              </div>

              {/* External Links */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4">EXPLORE MORE</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open(`https://www.coingecko.com/en/coins/${selectedToken.name.toLowerCase().replace(" ", "-")}`, "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                    CoinGecko
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open(`https://dexscreener.com/ethereum`, "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                    DexScreener
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open(`https://etherscan.io`, "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                    Block Explorer
                  </Button>
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
