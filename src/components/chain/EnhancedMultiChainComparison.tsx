import { ChainConfig } from "@/lib/chainConfig";
import { type AdvancedChainDataResponse } from "@/hooks/useAdvancedChainData";
import { GitCompare, TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedMultiChainComparisonProps {
  chain: ChainConfig;
  comparisonData?: AdvancedChainDataResponse;
  isLoading: boolean;
}

function compact(n: number): string {
  if (!n) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/**
 * Real cross-chain snapshot: live 24h change / volume / market cap per native
 * asset (CoinGecko), plus documented throughput specs. No bridge, fee or
 * uptime fabrications — those need feeds this build doesn't have.
 */
export function EnhancedMultiChainComparison({ chain, comparisonData, isLoading }: EnhancedMultiChainComparisonProps) {
  const rows = comparisonData?.chainMetrics ?? [];
  const maxVolume = Math.max(...rows.map((r) => r.volume24h), 1);

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-display text-foreground flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Chain Comparison
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Live native-asset metrics across covered chains
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className={cn("h-3.5 w-3.5", isLoading ? "text-warning animate-pulse" : "text-success")} />
          {isLoading ? "Loading" : "Live"}
        </div>
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Market data unavailable right now — check your connection and refresh.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                <th className="py-2 pr-3 font-semibold">Chain</th>
                <th className="py-2 px-3 font-semibold text-right">Price 24h</th>
                <th className="py-2 px-3 font-semibold text-right">Mkt Cap</th>
                <th className="py-2 px-3 font-semibold text-right">24h Volume</th>
                <th className="py-2 pl-3 font-semibold text-right">TPS (spec)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const active = r.chainId === chain.id;
                return (
                  <tr
                    key={r.chainId}
                    className={cn(
                      "border-b border-border/20 transition-colors",
                      active ? "bg-primary/5" : "hover:bg-muted/20",
                    )}
                  >
                    <td className="py-2.5 pr-3">
                      <span className={cn("font-medium", active ? "text-primary" : "text-foreground")}>
                        {r.name}{active && <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">viewing</span>}
                      </span>
                    </td>
                    <td className={cn(
                      "py-2.5 px-3 text-right font-mono font-medium",
                      r.change24h >= 0 ? "text-success" : "text-danger",
                    )}>
                      <span className="inline-flex items-center gap-1">
                        {r.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {r.change24h >= 0 ? "+" : ""}{r.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{compact(r.marketCap)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden md:block h-1.5 w-16 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", active ? "bg-primary" : "bg-muted-foreground/40")}
                            style={{ width: `${Math.max(2, (r.volume24h / maxVolume) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-foreground">{compact(r.volume24h)}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="h-3 w-3 opacity-60" />
                        {r.tps ? r.tps.toLocaleString() : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[10px] text-muted-foreground mt-3">
            Price, market cap and volume are live CoinGecko data for each chain's native asset. TPS is the chain's
            documented specification, not a live measurement. L2s share their settlement layer's native asset.
          </p>
        </div>
      )}
    </div>
  );
}
