import { 
  Github, GitCommit, TrendingUp, TrendingDown, Activity, Loader2,
  DollarSign, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { TopCoinData } from "@/hooks/useSentimentData";

interface GitHubActivityPanelProps {
  topCoins: TopCoinData[];
  isLoading?: boolean;
}

export function GitHubActivityPanel({ topCoins, isLoading }: GitHubActivityPanelProps) {
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="holo-card p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const coins = topCoins.slice(0, 10);
  const maxVolume = Math.max(...coins.map(c => c.volume), 1);

  return (
    <div className="holo-card p-6">
      <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        MARKET DEEP DIVE
        <span className="text-xs text-muted-foreground font-normal ml-auto">Live data</span>
      </h3>

      <div className="space-y-3">
        {coins.map((coin) => {
          const athDistance = coin.athChangePercentage;
          const range24h = coin.high24h - coin.low24h;
          const positionInRange = coin.high24h > coin.low24h 
            ? ((coin.price - coin.low24h) / range24h) * 100 
            : 50;

          return (
            <div key={coin.id} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" loading="lazy" />
                  <span className="font-display font-bold text-primary">{coin.symbol}</span>
                  <span className="text-sm text-muted-foreground">{formatNumber(coin.price)}</span>
                </div>
                <span className={cn(
                  "text-xs font-bold flex items-center gap-1 px-2 py-1 rounded",
                  coin.change24h >= 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                )}>
                  {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                </span>
              </div>

              {/* Volume bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Volume 24h
                  </span>
                  <span className="font-medium text-foreground">{formatNumber(coin.volume)}</span>
                </div>
                <Progress value={(coin.volume / maxVolume) * 100} className="h-1.5" />
              </div>

              {/* 24h Range + ATH Distance */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-[10px] text-muted-foreground">24h Low</div>
                  <div className="text-xs font-bold">{formatNumber(coin.low24h)}</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-[10px] text-muted-foreground">24h Range</div>
                  <Progress value={positionInRange} className="h-1 mt-1" />
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-[10px] text-muted-foreground">24h High</div>
                  <div className="text-xs font-bold">{formatNumber(coin.high24h)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-display text-primary">MARKET INSIGHT</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {(() => {
            const bullish = coins.filter(c => c.change24h > 0).length;
            const totalVol = coins.reduce((s, c) => s + c.volume, 0);
            return <>
              <span className={cn("font-medium", bullish > 5 ? "text-success" : "text-danger")}>
                {bullish}/{coins.length} coins
              </span>{' '}
              trading green. Total volume: <span className="font-medium text-foreground">{formatNumber(totalVol)}</span>.
              {coins[0] && <> {coins[0].symbol} is <span className={cn("font-medium", coins[0].athChangePercentage > -20 ? "text-warning" : "text-muted-foreground")}>{Math.abs(coins[0].athChangePercentage).toFixed(0)}% from ATH</span>.</>}
            </>;
          })()}
        </p>
      </div>
    </div>
  );
}
