import { ChainConfig } from "@/lib/chainConfig";
import { SmartMoneyFlow as SmartMoneyFlowType } from "@/hooks/useChainData";
import { ArrowDownLeft, ArrowUpRight, Droplets, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartMoneyFlowProps {
  chain: ChainConfig;
  smartMoneyFlow: SmartMoneyFlowType | undefined;
  isLoading: boolean;
}

export function SmartMoneyFlow({ chain, smartMoneyFlow, isLoading }: SmartMoneyFlowProps) {
  const formatValue = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const inflowPercent = smartMoneyFlow
    ? (smartMoneyFlow.inflow / (smartMoneyFlow.inflow + smartMoneyFlow.outflow)) * 100
    : 50;

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display text-foreground">Smart Money Flow</h3>
          <p className="text-sm text-muted-foreground">Capital movement on {chain.name}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse bg-muted/20 rounded-xl" />
      ) : smartMoneyFlow ? (
        <div className="space-y-6">
          {/* Flow Visualization */}
          <div className="relative">
            {/* Flow Bar */}
            <div className="h-8 rounded-full overflow-hidden bg-muted/30 flex">
              <div
                className="h-full bg-gradient-to-r from-success/80 to-success flex items-center justify-end px-3 transition-all"
                style={{ width: `${inflowPercent}%` }}
              >
                <ArrowDownLeft className="h-4 w-4 text-success-foreground" />
              </div>
              <div
                className="h-full bg-gradient-to-r from-danger to-danger/80 flex items-center px-3 transition-all"
                style={{ width: `${100 - inflowPercent}%` }}
              >
                <ArrowUpRight className="h-4 w-4 text-danger-foreground" />
              </div>
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-sm text-success font-medium">Inflow</p>
                <p className="text-lg font-display text-foreground">{formatValue(smartMoneyFlow.inflow)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Net Flow</p>
                <p className={cn(
                  "text-lg font-display",
                  smartMoneyFlow.netFlow >= 0 ? "text-success" : "text-danger"
                )}>
                  {smartMoneyFlow.netFlow >= 0 ? "+" : ""}{formatValue(smartMoneyFlow.netFlow)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-danger font-medium">Outflow</p>
                <p className="text-lg font-display text-foreground">{formatValue(smartMoneyFlow.outflow)}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Swaps */}
            <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <Repeat className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Top Swaps</h4>
              </div>
              <div className="space-y-2">
                {smartMoneyFlow.topSwaps.slice(0, 3).map((swap, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {swap.from} → {swap.to}
                    </span>
                    <span className="text-foreground font-medium">{formatValue(swap.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liquidity Changes */}
            <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="h-4 w-4 text-secondary" />
                <h4 className="text-sm font-medium text-foreground">Liquidity</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Added</span>
                    <span className="text-xs text-success">{formatValue(smartMoneyFlow.liquidityAdded)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{
                        width: `${(smartMoneyFlow.liquidityAdded / (smartMoneyFlow.liquidityAdded + smartMoneyFlow.liquidityRemoved)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Removed</span>
                    <span className="text-xs text-danger">{formatValue(smartMoneyFlow.liquidityRemoved)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-danger rounded-full"
                      style={{
                        width: `${(smartMoneyFlow.liquidityRemoved / (smartMoneyFlow.liquidityAdded + smartMoneyFlow.liquidityRemoved)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
