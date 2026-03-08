import { TrendingUp, TrendingDown, Globe, BarChart3, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { TrendingCoin, TrendingCategory, FearGreedEntry } from "@/hooks/useSentimentData";

interface GoogleTrendsPanelProps {
  trending: TrendingCoin[];
  trendingCategories: TrendingCategory[];
  fearGreed: FearGreedEntry[];
  isLoading?: boolean;
}

export function GoogleTrendsPanel({ trending, trendingCategories, fearGreed, isLoading }: GoogleTrendsPanelProps) {
  if (isLoading) {
    return (
      <div className="holo-card p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const maxRank = Math.max(...trending.map(t => t.marketCapRank || 1000), 1);

  return (
    <div className="holo-card p-6">
      <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
        <Flame className="w-5 h-5 text-warning" />
        TRENDING NOW
        <span className="text-xs text-muted-foreground font-normal ml-auto">Live from CoinGecko</span>
      </h3>

      {/* Trending Coins */}
      <div className="space-y-3 mb-6">
        {trending.slice(0, 8).map((coin, i) => (
          <div key={coin.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <span className="text-xs text-muted-foreground w-5 font-bold">#{i + 1}</span>
            <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" loading="lazy" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{coin.symbol.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground truncate">{coin.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {coin.marketCapRank > 0 && (
                <span className="text-xs text-muted-foreground">
                  <Globe className="w-3 h-3 inline mr-1" />
                  Rank #{coin.marketCapRank}
                </span>
              )}
              <div className="w-16">
                <Progress value={Math.max(5, 100 - (coin.score * 10))} className="h-1.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trending Categories */}
      {trendingCategories.length > 0 && (
        <div className="mb-6">
          <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            HOT SECTORS
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {trendingCategories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium truncate flex-1">{cat.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  {cat.coinsCount > 0 && (
                    <span className="text-xs text-muted-foreground">{cat.coinsCount} coins</span>
                  )}
                  <span className={cn(
                    "text-xs font-bold flex items-center gap-1",
                    cat.marketCapChange24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {cat.marketCapChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {cat.marketCapChange24h >= 0 ? "+" : ""}{cat.marketCapChange24h.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fear & Greed History */}
      {fearGreed.length > 0 && (
        <div className="p-4 rounded-lg bg-muted/30">
          <h4 className="font-display font-bold text-xs mb-3 text-muted-foreground">FEAR & GREED (7 DAY)</h4>
          <div className="flex gap-2">
            {fearGreed.map((entry, i) => (
              <div key={i} className="flex-1 text-center">
                <div className={cn(
                  "text-lg font-bold",
                  entry.value >= 60 ? "text-success" : entry.value >= 40 ? "text-warning" : "text-danger"
                )}>
                  {entry.value}
                </div>
                <div className="text-[9px] text-muted-foreground leading-tight mt-1">
                  {new Date(entry.timestamp).toLocaleDateString('en', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
