import { TrendingUp, TrendingDown, Flame, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo } from "react";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

export function MarketOverview() {
  const { data, isLoading, error } = useMarketData();

  const topCoins = useMemo(() => data?.topCoins?.slice(0, 5) || [], [data]);
  const trendingCoins = useMemo(() => data?.trending || [], [data]);
  const global = data?.global;
  const fearGreedIndex = data?.fearGreedIndex || 50;

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 relative cosmic-bg">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[300px] md:min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-display text-sm md:text-base">Loading market data...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 relative cosmic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16 space-y-2 md:space-y-4">
          <h2 className="text-[clamp(1.375rem,4vw,3rem)] font-display font-bold">
            MARKET <span className="glow-text">OVERVIEW</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg">
            Real-time snapshot of the crypto universe
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Top Coins Table */}
          <div className="lg:col-span-2 holo-card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h3 className="font-display text-base md:text-xl font-bold">TOP COINS</h3>
              <span className="text-[10px] md:text-xs text-muted-foreground ml-auto">Live Data</span>
            </div>
            
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="text-muted-foreground text-[10px] md:text-sm font-display border-b border-border">
                    <th className="text-left py-2 md:py-3 px-1 md:px-2">#</th>
                    <th className="text-left py-2 md:py-3 px-1 md:px-2">COIN</th>
                    <th className="text-right py-2 md:py-3 px-1 md:px-2">PRICE</th>
                    <th className="text-right py-2 md:py-3 px-1 md:px-2">24H</th>
                    <th className="text-right py-2 md:py-3 px-1 md:px-2 hidden sm:table-cell">VOLUME</th>
                  </tr>
                </thead>
                <tbody>
                  {topCoins.map((coin) => (
                    <tr 
                      key={coin.symbol} 
                      className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                    >
                      <td className="py-3 md:py-4 px-1 md:px-2 text-muted-foreground text-xs md:text-sm">{coin.rank}</td>
                      <td className="py-3 md:py-4 px-1 md:px-2">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <span className="font-display font-bold text-primary text-xs md:text-base">{coin.symbol}</span>
                          <span className="text-muted-foreground text-[10px] md:text-sm hidden sm:inline">{coin.name}</span>
                          {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 md:w-4 md:h-4 text-warning" />}
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-1 md:px-2 text-right font-medium text-xs md:text-base">
                        ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className={cn(
                        "py-3 md:py-4 px-1 md:px-2 text-right font-medium text-xs md:text-base",
                        coin.change24h >= 0 ? "text-success" : "text-danger"
                      )}>
                        <div className="flex items-center justify-end gap-1">
                          {coin.change24h >= 0 ? (
                            <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                          ) : (
                            <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                          )}
                          <span>{coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-1 md:px-2 text-right text-muted-foreground text-xs md:text-sm hidden sm:table-cell">
                        {formatNumber(coin.volume)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Trending & Stats */}
          <div className="space-y-4 md:space-y-6">
            {/* Trending */}
            <div className="holo-card p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Flame className="w-4 h-4 md:w-5 md:h-5 text-warning" />
                <h3 className="font-display font-bold text-sm md:text-base">TRENDING</h3>
              </div>
              <div className="space-y-2 md:space-y-3">
                {trendingCoins.length > 0 ? trendingCoins.map((coin, index) => (
                  <div key={coin.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs md:text-sm w-4">{index + 1}</span>
                      <span className="font-display font-bold text-primary text-xs md:text-sm">{coin.symbol}</span>
                    </div>
                    <span className={cn(
                      "font-medium text-xs md:text-sm",
                      coin.priceChange >= 0 ? "text-success" : "text-danger"
                    )}>
                      {coin.priceChange >= 0 ? "+" : ""}{coin.priceChange?.toFixed(1) || "0"}%
                    </span>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-xs md:text-sm">Loading trending...</p>
                )}
              </div>
            </div>
            
            {/* Market Stats */}
            <div className="holo-card p-4 md:p-6">
              <h3 className="font-display font-bold text-sm md:text-base mb-3 md:mb-4">MARKET STATS</h3>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <div className="text-muted-foreground text-[10px] md:text-sm">Total Market Cap</div>
                  <div className="text-base md:text-xl font-bold text-foreground">
                    {global ? formatNumber(global.totalMarketCap) : "$3.2T"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px] md:text-sm">24h Volume</div>
                  <div className="text-base md:text-xl font-bold text-foreground">
                    {global ? formatNumber(global.totalVolume24h) : "$120B"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px] md:text-sm">BTC Dominance</div>
                  <div className="text-base md:text-xl font-bold text-primary">
                    {global ? `${global.btcDominance.toFixed(1)}%` : "55%"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sentiment */}
            <div className="holo-card p-4 md:p-6">
              <h3 className="font-display font-bold text-sm md:text-base mb-3 md:mb-4">MARKET SENTIMENT</h3>
              <div className="relative h-3 md:h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-danger via-warning to-success transition-all duration-1000"
                  style={{ width: `${fearGreedIndex}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] md:text-sm">
                <span className="text-danger">Fear</span>
                <span className={cn(
                  "font-bold",
                  fearGreedIndex >= 60 ? "text-success" : fearGreedIndex >= 40 ? "text-warning" : "text-danger"
                )}>
                  {fearGreedIndex} - {fearGreedIndex >= 60 ? "Greed" : fearGreedIndex >= 40 ? "Neutral" : "Fear"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
