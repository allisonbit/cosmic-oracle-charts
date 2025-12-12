import { 
  TrendingUp, TrendingDown, Crown, Medal, Award, ArrowRight, 
  Eye, ExternalLink, Copy, Activity, Zap, BarChart3, Globe,
  RefreshCw, Clock, Target, AlertTriangle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

interface EnhancedTopPerformersProps {
  onCoinClick: (coin: CoinData) => void;
}

export function EnhancedTopPerformers({ onCoinClick }: EnhancedTopPerformersProps) {
  const { data, refetch, isLoading } = useMarketData();
  const [view, setView] = useState<"gainers" | "losers">("gainers");
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

  const { gainers, losers } = useMemo(() => {
    const coins = data?.topCoins || [];
    const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
    return {
      gainers: sorted.slice(0, 6),
      losers: sorted.slice(-6).reverse(),
    };
  }, [data]);

  const displayedCoins = view === "gainers" ? gainers : losers;
  const icons = [Crown, Medal, Award];

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Generate chart data for modal
  const chartData = useMemo(() => {
    if (!selectedCoin) return [];
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: selectedCoin.price * (0.9 + Math.random() * 0.2),
    }));
  }, [selectedCoin]);

  return (
    <>
      <div className="holo-card p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
            {view === "gainers" ? (
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
            )}
            <span className="hidden sm:inline">{view === "gainers" ? "TOP GAINERS" : "TOP LOSERS"}</span>
            <span className="sm:hidden">{view === "gainers" ? "GAINERS" : "LOSERS"}</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
            </button>
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => setView("gainers")}
                className={cn(
                  "px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-display transition-all touch-target-lg tap-highlight-none active:scale-95",
                  view === "gainers" ? "bg-success/20 text-success" : "text-muted-foreground"
                )}
              >
                Gainers
              </button>
              <button
                onClick={() => setView("losers")}
                className={cn(
                  "px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-display transition-all touch-target-lg tap-highlight-none active:scale-95",
                  view === "losers" ? "bg-danger/20 text-danger" : "text-muted-foreground"
                )}
              >
                Losers
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {displayedCoins.map((coin, i) => {
            const Icon = icons[i] || Award;
            const isPositive = coin.change24h >= 0;
            const volumeToMcap = (coin.volume / coin.marketCap) * 100;
            
            return (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin)}
                className={cn(
                  "w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all active:scale-[0.98] text-left touch-target tap-highlight-none group",
                  isPositive ? "bg-success/5 border-success/20 active:border-success/40" : "bg-danger/5 border-danger/20 active:border-danger/40"
                )}
              >
                <div className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  i < 3 ? (isPositive ? "bg-success/20" : "bg-danger/20") : "bg-muted"
                )}>
                  {i < 3 ? (
                    <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isPositive ? "text-success" : "text-danger")} />
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{i + 1}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-display font-bold text-sm sm:text-base">{coin.symbol}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate hidden xs:inline">{coin.name}</span>
                    {volumeToMcap > 10 && (
                      <Activity className="w-3 h-3 text-warning" />
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-2">
                    <span>${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className="text-primary/50">•</span>
                    <span>Vol: {formatNumber(coin.volume)}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={cn(
                    "font-bold flex items-center gap-1 justify-end text-sm sm:text-base",
                    isPositive ? "text-success" : "text-danger"
                  )}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    {isPositive ? "+" : ""}{coin.change24h.toFixed(1)}%
                  </div>
                  <div className="text-[10px] sm:text-xs text-primary flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3 h-3" /> Details
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Link 
          to="/explorer"
          className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 font-medium py-2 touch-target tap-highlight-none active:scale-95"
        >
          View All Tokens <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Coin Detail Modal */}
      <Dialog open={!!selectedCoin} onOpenChange={(open) => !open && setSelectedCoin(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedCoin && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-display font-bold text-primary">{selectedCoin.symbol[0]}</span>
                  </div>
                  <div>
                    <span className="font-display text-xl">{selectedCoin.symbol}</span>
                    <span className="text-muted-foreground ml-2 text-sm">{selectedCoin.name}</span>
                  </div>
                  <span className={cn(
                    "ml-auto text-sm font-display font-bold px-3 py-1 rounded-full",
                    selectedCoin.change24h >= 0 ? "text-success bg-success/20" : "text-danger bg-danger/20"
                  )}>
                    {view === "gainers" ? "GAINER" : "LOSER"}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Price Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="text-xl font-bold">${selectedCoin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                    <div className={cn("text-xl font-bold flex items-center gap-1", 
                      selectedCoin.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {selectedCoin.change24h >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      {selectedCoin.change24h >= 0 ? "+" : ""}{selectedCoin.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="holo-card p-4">
                  <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    24H PRICE MOVEMENT
                  </h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="performerGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedCoin.change24h >= 0 ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={selectedCoin.change24h >= 0 ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(230, 30%, 8%)",
                          border: "1px solid hsl(190, 100%, 50%, 0.3)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Price"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={selectedCoin.change24h >= 0 ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"}
                        strokeWidth={2}
                        fill="url(#performerGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Volume & Market Cap */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                    <div className="text-lg font-bold">{formatNumber(selectedCoin.volume)}</div>
                  </div>
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                    <div className="text-lg font-bold">{formatNumber(selectedCoin.marketCap)}</div>
                  </div>
                </div>

                {/* Performance Analysis */}
                <div className="holo-card p-4">
                  <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    PERFORMANCE ANALYSIS
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {selectedCoin.change24h > 10 && (
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-success mt-0.5" />
                        <span>Significant outperformance - Strong buying pressure detected</span>
                      </div>
                    )}
                    {selectedCoin.change24h > 5 && selectedCoin.change24h <= 10 && (
                      <div className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-success mt-0.5" />
                        <span>Solid gains - Positive momentum in market</span>
                      </div>
                    )}
                    {selectedCoin.change24h < -10 && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-danger mt-0.5" />
                        <span>Heavy selling pressure - Check for news or catalyst</span>
                      </div>
                    )}
                    {selectedCoin.change24h < -5 && selectedCoin.change24h >= -10 && (
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-warning mt-0.5" />
                        <span>Notable decline - Monitor for support levels</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-primary mt-0.5" />
                      <span>Vol/MCap: {((selectedCoin.volume / selectedCoin.marketCap) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* External Links */}
                <div className="holo-card p-4">
                  <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    RESEARCH LINKS
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "CoinGecko", url: `https://www.coingecko.com/en/coins/${selectedCoin.name?.toLowerCase().replace(/\s+/g, '-')}` },
                      { label: "TradingView", url: `https://www.tradingview.com/chart/?symbol=${selectedCoin.symbol}USD` },
                      { label: "DexScreener", url: `https://dexscreener.com/ethereum/${selectedCoin.symbol.toLowerCase()}` },
                      { label: "CoinMarketCap", url: `https://coinmarketcap.com/currencies/${selectedCoin.name?.toLowerCase().replace(/\s+/g, '-')}` },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 ml-auto text-primary" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCoin.symbol);
                      toast.success(`${selectedCoin.symbol} copied to clipboard`);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Symbol
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setSelectedCoin(null);
                      onCoinClick(selectedCoin);
                    }}
                  >
                    Full Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Data updates every 15 seconds
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
