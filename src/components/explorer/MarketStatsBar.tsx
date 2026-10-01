import { DollarSign, BarChart3, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplorerChain } from "@/lib/explorerChains";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

interface MarketStatsBarProps {
  chain: ExplorerChain;
}

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '—';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${(num ?? 0).toFixed(0)}`;
}

export function MarketStatsBar({ chain }: MarketStatsBarProps) {
  // Standalone: the chain's native coin stats come from the live engine
  // (CoinGecko top-250 already includes every major chain's native token).
  // TVL is not fetchable client-side and renders as an honest dash.
  const { data: pricesData, isLoading } = useCryptoPrices();
  const native = pricesData?.prices?.find(
    p => p.symbol.toLowerCase() === chain.symbol.toLowerCase(),
  );
  const data = native
    ? {
        nativePrice: native.price,
        nativeChange24h: native.change24h,
        nativeVolume24h: native.volume24h,
        nativeMarketCap: native.marketCap,
        tvl: null as number | null,
        tvlChange1d: null as number | null,
      }
    : null;

  const change = data?.nativeChange24h ?? null;
  const tvlChange = data?.tvlChange1d ?? null;

  return (
    <div className="border-t border-border/30 pt-5 overflow-x-auto">
      <div className="flex items-center gap-6 min-w-max text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">{chain.icon}</span>
          <span className="font-display font-bold text-sm">{chain.name}</span>
        </div>
        
        <div className="h-6 w-px bg-border" />

        {isLoading ? (
          <div className="h-5 w-72 rounded bg-muted/30 animate-pulse" />
        ) : (
          <>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">{chain.symbol} Price:</span>
          <span className="text-sm font-medium">{data?.nativePrice ? `$${data.nativePrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "—"}</span>
          {change !== null && (
            <span className={cn("text-xs flex items-center gap-0.5", change >= 0 ? "text-success" : "text-danger")}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change >= 0 ? "+" : ""}{change.toFixed(2)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">24h Vol:</span>
          <span className="text-sm font-medium">{formatNumber(data?.nativeVolume24h)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary" />
          <span className="text-xs text-muted-foreground">TVL:</span>
          <span className="text-sm font-medium">{formatNumber(data?.tvl)}</span>
          {tvlChange !== null && (
            <span className={cn("text-xs", tvlChange >= 0 ? "text-success" : "text-danger")}>
              {tvlChange >= 0 ? "+" : ""}{tvlChange.toFixed(1)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-warning" />
          <span className="text-xs text-muted-foreground">Market Cap:</span>
          <span className="text-sm font-medium">{formatNumber(data?.nativeMarketCap)}</span>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
