import { ChainConfig } from "@/lib/chainConfig";
import { TokenHeat } from "@/hooks/useChainData";
import { TrendingUp, TrendingDown, Activity, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenHeatScannerProps {
  chain: ChainConfig;
  tokenHeat: TokenHeat[] | undefined;
  isLoading: boolean;
}

export function TokenHeatScanner({ chain, tokenHeat, isLoading }: TokenHeatScannerProps) {
  const getHeatLevel = (token: TokenHeat) => {
    const score = (token.momentum + token.volumeSpike + token.socialScore) / 3;
    if (score > 70) return "hot";
    if (score > 40) return "warm";
    return "cool";
  };

  const getHeatColor = (level: string) => {
    switch (level) {
      case "hot": return "danger";
      case "warm": return "warning";
      default: return "primary";
    }
  };

  const sortedTokens = tokenHeat?.sort((a, b) => {
    const scoreA = (a.momentum + a.volumeSpike + a.socialScore) / 3;
    const scoreB = (b.momentum + b.volumeSpike + b.socialScore) / 3;
    return scoreB - scoreA;
  });

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-display text-foreground">Token Heat Scanner</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Top performing tokens on {chain.name}</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-danger" />
            <span>Hot</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>Warm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Cool</span>
          </div>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/20 animate-pulse" />
          ))
        ) : (
          sortedTokens?.map((token, i) => {
            const heatLevel = getHeatLevel(token);
            const heatColor = getHeatColor(heatLevel);

            return (
              <div
                key={token.symbol}
                className={cn(
                  "relative p-4 rounded-xl border transition-all hover:scale-105 cursor-pointer group",
                  heatLevel === "hot" && "border-danger/50 bg-danger/10",
                  heatLevel === "warm" && "border-warning/50 bg-warning/10",
                  heatLevel === "cool" && "border-primary/50 bg-primary/10"
                )}
                style={{
                  animation: heatLevel === "hot" ? "pulse 2s ease-in-out infinite" : undefined,
                }}
              >
                {/* Glow effect */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
                    heatLevel === "hot" && "shadow-[0_0_30px_hsl(0_84%_60%/0.4)]",
                    heatLevel === "warm" && "shadow-[0_0_30px_hsl(38_92%_50%/0.4)]",
                    heatLevel === "cool" && "shadow-[0_0_30px_hsl(190_100%_50%/0.4)]"
                  )}
                />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="font-display text-xs sm:text-sm text-foreground truncate">{token.symbol}</span>
                    {heatLevel === "hot" && <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-danger animate-pulse flex-shrink-0" />}
                  </div>

                  {/* Price */}
                  <p className="text-sm sm:text-lg font-display text-foreground mb-0.5 sm:mb-1 truncate">
                    ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </p>

                  {/* Change */}
                  <div className={cn(
                    "flex items-center gap-1 text-xs sm:text-sm",
                    token.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {token.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%</span>
                  </div>

                  {/* Metrics Bar - Hidden on mobile for density */}
                  <div className="mt-2 sm:mt-3 space-y-1 hidden xs:block">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground w-10 sm:w-14">Momentum</span>
                      <div className="flex-1 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            heatColor === "danger" && "bg-danger",
                            heatColor === "warning" && "bg-warning",
                            heatColor === "primary" && "bg-primary"
                          )}
                          style={{ width: `${token.momentum}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground w-10 sm:w-14">Volume</span>
                      <div className="flex-1 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            heatColor === "danger" && "bg-danger",
                            heatColor === "warning" && "bg-warning",
                            heatColor === "primary" && "bg-primary"
                          )}
                          style={{ width: `${token.volumeSpike}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground w-10 sm:w-14">Social</span>
                      <div className="flex-1 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            heatColor === "danger" && "bg-danger",
                            heatColor === "warning" && "bg-warning",
                            heatColor === "primary" && "bg-primary"
                          )}
                          style={{ width: `${token.socialScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
