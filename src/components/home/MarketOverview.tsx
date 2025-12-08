import { TrendingUp, TrendingDown, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const topCoins = [
  { rank: 1, symbol: "BTC", name: "Bitcoin", price: 67842.50, change: 2.34, volume: "38.2B", hot: true },
  { rank: 2, symbol: "ETH", name: "Ethereum", price: 3521.80, change: -0.87, volume: "18.5B", hot: false },
  { rank: 3, symbol: "SOL", name: "Solana", price: 142.30, change: 5.67, volume: "4.2B", hot: true },
  { rank: 4, symbol: "BNB", name: "BNB", price: 584.20, change: 1.45, volume: "2.1B", hot: false },
  { rank: 5, symbol: "XRP", name: "Ripple", price: 0.62, change: -1.23, volume: "3.8B", hot: false },
];

const trendingCoins = [
  { symbol: "PEPE", change: 45.2 },
  { symbol: "WIF", change: 23.8 },
  { symbol: "BONK", change: 18.5 },
  { symbol: "FLOKI", change: 12.3 },
];

export function MarketOverview() {
  return (
    <section className="py-24 relative cosmic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            MARKET <span className="glow-text">OVERVIEW</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real-time snapshot of the crypto universe
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Top Coins Table */}
          <div className="lg:col-span-2 holo-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl font-bold">TOP COINS</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-muted-foreground text-sm font-display border-b border-border">
                    <th className="text-left py-3 px-2">#</th>
                    <th className="text-left py-3 px-2">COIN</th>
                    <th className="text-right py-3 px-2">PRICE</th>
                    <th className="text-right py-3 px-2">24H</th>
                    <th className="text-right py-3 px-2 hidden sm:table-cell">VOLUME</th>
                  </tr>
                </thead>
                <tbody>
                  {topCoins.map((coin) => (
                    <tr 
                      key={coin.symbol} 
                      className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                    >
                      <td className="py-4 px-2 text-muted-foreground">{coin.rank}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-primary">{coin.symbol}</span>
                          <span className="text-muted-foreground text-sm hidden sm:inline">{coin.name}</span>
                          {coin.hot && <Flame className="w-4 h-4 text-warning" />}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right font-medium">
                        ${coin.price.toLocaleString()}
                      </td>
                      <td className={cn(
                        "py-4 px-2 text-right font-medium flex items-center justify-end gap-1",
                        coin.change >= 0 ? "text-success" : "text-danger"
                      )}>
                        {coin.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {coin.change >= 0 ? "+" : ""}{coin.change}%
                      </td>
                      <td className="py-4 px-2 text-right text-muted-foreground hidden sm:table-cell">
                        ${coin.volume}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Trending & Stats */}
          <div className="space-y-6">
            {/* Trending */}
            <div className="holo-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-warning" />
                <h3 className="font-display font-bold">TRENDING</h3>
              </div>
              <div className="space-y-3">
                {trendingCoins.map((coin, index) => (
                  <div key={coin.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">{index + 1}</span>
                      <span className="font-display font-bold text-primary">{coin.symbol}</span>
                    </div>
                    <span className="text-success font-medium">+{coin.change}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Market Stats */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold mb-4">MARKET STATS</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-muted-foreground text-sm">Total Market Cap</div>
                  <div className="text-xl font-bold text-foreground">$2.45T</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">24h Volume</div>
                  <div className="text-xl font-bold text-foreground">$89.2B</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">BTC Dominance</div>
                  <div className="text-xl font-bold text-primary">52.3%</div>
                </div>
              </div>
            </div>
            
            {/* Sentiment */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold mb-4">MARKET SENTIMENT</h3>
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-danger via-warning to-success"
                  style={{ width: "68%" }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-danger">Fear</span>
                <span className="text-success font-bold">68 - Greed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
