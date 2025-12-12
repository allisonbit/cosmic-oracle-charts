import { ChainConfig } from "@/lib/chainConfig";
import { useRealtimePricesWS } from "@/hooks/useRealtimeWebSocket";
import { ArrowUpRight, ArrowDownRight, Wifi, WifiOff, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealtimePriceTickerProps {
  chain: ChainConfig;
}

export function RealtimePriceTicker({ chain }: RealtimePriceTickerProps) {
  const { prices, isConnected, lastUpdate } = useRealtimePricesWS([chain.id]);
  const priceData = prices[chain.id];

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatChange = (change: number) => {
    const prefix = change >= 0 ? "+" : "";
    return `${prefix}${change.toFixed(2)}%`;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    return `$${(vol / 1e3).toFixed(0)}K`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    return `$${(cap / 1e6).toFixed(0)}M`;
  };

  const timeAgo = lastUpdate ? Math.floor((Date.now() - lastUpdate) / 1000) : 0;

  return (
    <div className="holo-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{chain.icon}</span>
          <div>
            <h3 className="font-display text-foreground">{chain.name}</h3>
            <span className="text-xs text-muted-foreground">{chain.symbol}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1 text-[10px] text-success bg-success/10 px-2 py-1 rounded-full">
              <Wifi className="h-3 w-3" />
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
              <WifiOff className="h-3 w-3" />
              Connecting...
            </span>
          )}
        </div>
      </div>

      {priceData ? (
        <div className="space-y-4">
          {/* Main Price */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-display text-foreground">
                {formatPrice(priceData.price)}
              </p>
              <div className={cn(
                "flex items-center gap-1 text-sm mt-1",
                priceData.change24h >= 0 ? "text-success" : "text-danger"
              )}>
                {priceData.change24h >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{formatChange(priceData.change24h)}</span>
                <span className="text-muted-foreground text-xs">(24h)</span>
              </div>
            </div>
            <div className={cn(
              "p-2 rounded-lg",
              priceData.change24h >= 0 ? "bg-success/10" : "bg-danger/10"
            )}>
              {priceData.change24h >= 0 ? (
                <TrendingUp className={cn("h-6 w-6", priceData.change24h >= 0 ? "text-success" : "text-danger")} />
              ) : (
                <TrendingDown className="h-6 w-6 text-danger" />
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <BarChart3 className="h-3 w-3" />
                <span className="text-xs">24h Volume</span>
              </div>
              <p className="text-sm font-display text-foreground">{formatVolume(priceData.volume24h)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">Market Cap</span>
              </div>
              <p className="text-sm font-display text-foreground">{formatMarketCap(priceData.marketCap)}</p>
            </div>
          </div>

          {/* Last Update */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3">
            <span>Last update: {timeAgo}s ago</span>
            <span className="flex items-center gap-1">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isConnected ? "bg-success" : "bg-muted"
              )} />
              {isConnected ? "Real-time" : "Polling"}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading price data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
