import { Flame, TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiquidationData } from "@/hooks/useLiquidationData";
import { Skeleton } from "@/components/ui/skeleton";

export function LiquidationHeatmap() {
  const { data, isLoading, error, refetch, isFetching } = useLiquidationData();

  const formatAmount = (amount: number): string => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${(amount / 1e3).toFixed(0)}K`;
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "long": return { text: "LONG HEAVY", color: "text-success" };
      case "short": return { text: "SHORT HEAVY", color: "text-danger" };
      default: return { text: "BALANCED", color: "text-warning" };
    }
  };

  const longPercentage = data?.longPercentage || 50;

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            LIQUIDATION HEATMAP
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            Real-time liquidation risk zones from futures markets
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isFetching && "animate-spin")} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 mb-4">
          <AlertTriangle className="w-4 h-4 text-danger" />
          <span className="text-xs text-danger">Failed to load data. Showing estimates.</span>
        </div>
      )}

      {/* Long/Short Balance Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs sm:text-sm mb-2">
          <span className="text-success flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Long Liquidations
          </span>
          <span className="text-danger flex items-center gap-1">
            Short Liquidations
            <TrendingDown className="w-3 h-3" />
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden flex bg-muted">
          <div 
            className="bg-gradient-to-r from-success to-success/70 transition-all duration-500"
            style={{ width: `${longPercentage}%` }}
          />
          <div 
            className="bg-gradient-to-l from-danger to-danger/70 transition-all duration-500"
            style={{ width: `${100 - longPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>{longPercentage.toFixed(1)}%</span>
          <span>{(100 - longPercentage).toFixed(1)}%</span>
        </div>
      </div>

      {/* Total Liquidation Values */}
      {data && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 rounded-lg bg-success/10 border border-success/20 text-center">
            <div className="text-[10px] text-muted-foreground">Long Liq. Est.</div>
            <div className="text-sm font-bold text-success">{formatAmount(data.totalLongLiquidations)}</div>
          </div>
          <div className="p-2 rounded-lg bg-danger/10 border border-danger/20 text-center">
            <div className="text-[10px] text-muted-foreground">Short Liq. Est.</div>
            <div className="text-sm font-bold text-danger">{formatAmount(data.totalShortLiquidations)}</div>
          </div>
        </div>
      )}

      {/* Liquidation Levels */}
      <div className="space-y-2 sm:space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : (
          data?.levels.slice(0, 6).map((level, i) => {
            const typeInfo = getTypeLabel(level.type);
            const totalLiq = level.longLiquidations + level.shortLiquidations;
            return (
              <div 
                key={i}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                    level.type === 'long' ? 'bg-success/20 text-success' :
                    level.type === 'short' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                  )}>
                    {level.symbol}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{level.asset}: {formatPrice(level.price)}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatAmount(totalLiq)} in liquidations • {level.priceDistance.toFixed(1)}% away
                    </div>
                  </div>
                </div>
                <div className={cn("text-[10px] sm:text-xs font-bold", typeInfo.color)}>
                  {typeInfo.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-3 text-[10px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-danger/50" />
          <span>High liquidation zone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-success/50" />
          <span>Support zone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-warning/50" />
          <span>Neutral zone</span>
        </div>
      </div>

      {/* Data Source & Update Time */}
      {data?.lastUpdated && (
        <div className="mt-3 text-[10px] text-muted-foreground/60 text-center">
          Data from Binance Futures • Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
