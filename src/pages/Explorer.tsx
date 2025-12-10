import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Activity, BarChart3, Shield, Zap, Loader2, ExternalLink, Globe, Layers, Copy, CheckCircle, AlertTriangle, Clock, Target, Brain, Rocket, BadgeCheck, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { useTokenSearch, SearchToken } from "@/hooks/useTokenSearch";
import { toast } from "sonner";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  if (num === 0) return '$0';
  if (num < 0.01) return `$${num.toFixed(6)}`;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPrice(price: number): string {
  if (price === 0) return 'N/A';
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

const CHAINS = [
  { id: "ethereum", name: "Ethereum", icon: Layers, explorer: "https://etherscan.io" },
  { id: "polygon", name: "Polygon", icon: Layers, explorer: "https://polygonscan.com" },
  { id: "arbitrum", name: "Arbitrum", icon: Layers, explorer: "https://arbiscan.io" },
  { id: "base", name: "Base", icon: Layers, explorer: "https://basescan.org" },
  { id: "optimism", name: "Optimism", icon: Layers, explorer: "https://optimistic.etherscan.io" },
];

const ExplorerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SearchToken | null>(null);
  
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useTokenSearch(debouncedQuery, selectedChain);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allCoins = useMemo(() => marketData?.topCoins || [], [marketData]);
  
  const { data: aiData, isLoading: aiLoading } = useAIForecast(
    selectedToken ? { 
      symbol: selectedToken.symbol, 
      price: selectedToken.price, 
      change24h: selectedToken.change24h,
      volume: 0 
    } : null,
    "coin_forecast",
    !!selectedToken && selectedToken.price > 0
  );

  const forecast = aiData?.forecast;

  // Generate chart data based on selected token
  const chartData = useMemo(() => {
    if (!selectedToken || selectedToken.price === 0) return [];
    const basePrice = selectedToken.price;
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: basePrice * (0.97 + Math.random() * 0.06),
      volume: Math.random() * 1000000,
    })).map((item, i, arr) => {
      if (i === arr.length - 1) return { ...item, price: basePrice };
      return item;
    });
  }, [selectedToken]);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getExplorerUrl = (address: string) => {
    const chain = CHAINS.find(c => c.id === selectedChain);
    return `${chain?.explorer || 'https://etherscan.io'}/token/${address}`;
  };

  const popularTokens = useMemo(() => allCoins.slice(0, 8), [allCoins]);
  const isSearching = searchQuery.length >= 2;
  const hasResults = searchResults?.tokens && searchResults.tokens.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="glow-text">TOKEN</span> <span className="text-gradient-cosmic">EXPLORER</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Search any token by name, symbol, or contract address using Alchemy
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
                onClick={() => {
                  setSelectedChain(chain.id);
                  setSelectedToken(null);
                }}
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
              placeholder="Search any token: name, symbol, or contract address (0x...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base bg-muted/50 border-primary/30 focus:border-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedToken(null);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Clear
              </Button>
            )}
          </div>
          
          {/* Quick Select Popular Tokens */}
          {!isSearching && !selectedToken && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="text-xs text-muted-foreground mr-2">Popular:</span>
              {popularTokens.map((token) => (
                <Button
                  key={token.symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(token.symbol)}
                >
                  {token.symbol}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                {searchLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching {selectedChain}...
                  </span>
                ) : (
                  `Search Results (${searchResults?.tokens?.length || 0})`
                )}
              </h3>
              
              {searchError && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-3" />
                  <p className="text-danger">Search failed. Please try again.</p>
                </div>
              )}
              
              {!searchLoading && hasResults && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.tokens.map((token, idx) => (
                    <button
                      key={`${token.contractAddress || token.symbol}-${idx}`}
                      onClick={() => {
                        setSelectedToken(token);
                        setSearchQuery("");
                      }}
                      className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-all text-left hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {token.logo ? (
                            <img 
                              src={token.logo} 
                              alt={token.symbol} 
                              className="w-10 h-10 rounded-full bg-muted"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="font-display font-bold text-primary">{token.symbol[0]}</span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-display font-bold text-primary">{token.symbol}</span>
                              {token.verified && <BadgeCheck className="w-3 h-3 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{token.name}</p>
                            {token.contractAddress && (
                              <p className="text-[10px] text-muted-foreground/60 font-mono truncate max-w-[120px]">
                                {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatPrice(token.price)}</p>
                          {token.change24h !== 0 && (
                            <p className={cn("text-xs font-bold", token.change24h >= 0 ? "text-success" : "text-danger")}>
                              {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                            </p>
                          )}
                          {token.rank && (
                            <p className="text-[10px] text-muted-foreground">Rank #{token.rank}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {!searchLoading && !hasResults && debouncedQuery.length >= 2 && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No tokens found for "{debouncedQuery}" on {selectedChain}</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different chain or check the contract address</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Token Details */}
        {selectedToken && !isSearching && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="holo-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {selectedToken.logo ? (
                      <img 
                        src={selectedToken.logo} 
                        alt={selectedToken.symbol}
                        className="w-14 h-14 rounded-full bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-display font-bold text-primary text-xl">{selectedToken.symbol[0]}</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-2xl font-bold">{selectedToken.name}</h2>
                        {selectedToken.verified && <BadgeCheck className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground">{selectedToken.symbol}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">{selectedToken.chain}</span>
                        {selectedToken.rank && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Rank #{selectedToken.rank}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <div className="text-3xl font-bold">{formatPrice(selectedToken.price)}</div>
                    {selectedToken.change24h !== 0 && (
                      <div className={cn("flex items-center gap-1 font-medium", selectedToken.change24h >= 0 ? "text-success" : "text-danger")}>
                        {selectedToken.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}% (24h)
                      </div>
                    )}
                  </div>
                </div>

                {/* Contract Address */}
                {selectedToken.contractAddress && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-6">
                    <span className="text-xs text-muted-foreground">Contract:</span>
                    <code className="text-xs text-primary flex-1 truncate font-mono">{selectedToken.contractAddress}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyAddress(selectedToken.contractAddress)} className="gap-1">
                      {copiedAddress ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.open(getExplorerUrl(selectedToken.contractAddress), "_blank")}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Price Chart */}
                {chartData.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={["dataMin * 0.99", "dataMax * 1.01"]} tickFormatter={(v) => formatPrice(v)} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                          formatter={(value: number) => [formatPrice(value), "Price"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {selectedToken.price === 0 && (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Price data not available for this token</p>
                      <p className="text-xs mt-1">Try searching on a different chain</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Token Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Chain", value: selectedToken.chain.charAt(0).toUpperCase() + selectedToken.chain.slice(1), icon: Layers, color: "text-primary" },
                  { label: "Decimals", value: selectedToken.decimals.toString(), icon: Activity, color: "text-secondary" },
                  { label: "Verified", value: selectedToken.verified ? "Yes" : "No", icon: Shield, color: selectedToken.verified ? "text-success" : "text-warning" },
                  { label: "Type", value: selectedToken.contractAddress ? "ERC-20" : "Native", icon: Zap, color: "text-primary" },
                ].map((stat) => (
                  <div key={stat.label} className="holo-card p-4 text-center">
                    <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                    <div className="text-xs text-muted-foreground font-display mb-1">{stat.label}</div>
                    <div className="text-lg font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* External Links */}
              {selectedToken.contractAddress && (
                <div className="holo-card p-6">
                  <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    EXTERNAL LINKS
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Block Explorer", url: getExplorerUrl(selectedToken.contractAddress) },
                      { name: "DexScreener", url: `https://dexscreener.com/${selectedChain}/${selectedToken.contractAddress}` },
                      { name: "DexTools", url: `https://www.dextools.io/app/en/${selectedChain}/pair-explorer/${selectedToken.contractAddress}` },
                      { name: "CoinGecko", url: selectedToken.coingeckoId ? `https://www.coingecko.com/en/coins/${selectedToken.coingeckoId}` : `https://www.coingecko.com/en/search?query=${selectedToken.symbol}` },
                    ].map((link) => (
                      <Button
                        key={link.name}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(link.url, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Analysis */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  AI ANALYSIS
                </h3>
                {aiLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : forecast ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-xs font-display">TREND</span>
                      </div>
                      <p className={cn("font-bold", 
                        forecast.trend === "bullish" ? "text-success" : 
                        forecast.trend === "bearish" ? "text-danger" : "text-warning"
                      )}>
                        {forecast.trend?.toUpperCase()}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span className="text-xs font-display">SHORT TERM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{forecast.shortTerm}</p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Rocket className="w-4 h-4 text-warning" />
                        <span className="text-xs font-display">LONG TERM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{forecast.longTerm}</p>
                    </div>

                    {forecast.riskLevel !== undefined && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-danger" />
                          <span className="text-xs font-display">RISK LEVEL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all", 
                                forecast.riskLevel <= 30 ? "bg-success" :
                                forecast.riskLevel <= 60 ? "bg-warning" : "bg-danger"
                              )}
                              style={{ width: `${forecast.riskLevel}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{forecast.riskLevel}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedToken.price === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">AI analysis requires price data</p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No AI analysis available</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4">QUICK ACTIONS</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setSelectedToken(null);
                      setSearchQuery("");
                    }}
                  >
                    <Search className="w-4 h-4" />
                    Search Another Token
                  </Button>
                  {selectedToken.contractAddress && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => copyAddress(selectedToken.contractAddress)}
                    >
                      <Copy className="w-4 h-4" />
                      Copy Contract
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Default View - Top Tokens */}
        {!selectedToken && !isSearching && !marketLoading && (
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              TOP TOKENS
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
                  {allCoins.slice(0, 20).map((coin) => (
                    <tr 
                      key={coin.symbol} 
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSearchQuery(coin.symbol)}
                    >
                      <td className="py-3 px-2 text-muted-foreground">{coin.rank}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-display font-bold text-primary text-xs">{coin.symbol[0]}</span>
                          </div>
                          <div>
                            <span className="font-medium">{coin.symbol}</span>
                            <p className="text-xs text-muted-foreground">{coin.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-medium">{formatPrice(coin.price)}</td>
                      <td className={cn("py-3 px-2 text-right font-bold", coin.change24h >= 0 ? "text-success" : "text-danger")}>
                        {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </td>
                      <td className="py-3 px-2 text-right hidden sm:table-cell text-muted-foreground">{formatNumber(coin.volume)}</td>
                      <td className="py-3 px-2 text-right hidden md:table-cell text-muted-foreground">{formatNumber(coin.marketCap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {marketLoading && !isSearching && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground font-display">Loading market data...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExplorerPage;
