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
      <div className="border-t border-border/30 pt-5 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const maxRank = Math.max(...trending.map(t => t.marketCapRank || 1000), 1);

  return (
    <div className="border-t border-border/30 pt-5">
      <h3 className="section-label mb-4 flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-warning" />
        Trending Now
        <span className="text-xs text-muted-foreground font-normal normal-case tracking-normal ml-auto">Live from CoinGecko</span>
      </h3>

      {/* Trending Coins */}
      <div className="mb-6">
        {trending.slice(0, 8).map((coin, i) => (
          <div key={coin.id} className="editorial-row gap-3">
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
          <h4 className="section-label mb-3 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            Hot Sectors
          </h4>
          <div>
            {trendingCategories.map((cat) => (
              <div key={cat.name} className="editorial-row justify-between">
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
                    {cat.marketCapChange24h >= 0 ? "+" : ""}{(cat.marketCapChange24h ?? 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fear & Greed History */}
      {fearGreed.length > 0 && (
        <div className="border-t border-border/20 pt-4">
          <h4 className="section-label mb-3">Fear &amp; Greed (7 Day)</h4>
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
