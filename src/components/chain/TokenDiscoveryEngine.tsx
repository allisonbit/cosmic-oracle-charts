import { ChainConfig } from "@/lib/chainConfig";
import { TokenHeat } from "@/hooks/useChainData";
import { TrendingUp, TrendingDown, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenDiscoveryEngineProps {
  chain: ChainConfig;
  tokenHeat: TokenHeat[] | undefined;
  isLoading: boolean;
}

export function TokenDiscoveryEngine({ chain, tokenHeat, isLoading }: TokenDiscoveryEngineProps) {
  // Categorize tokens
  const rising = tokenHeat?.filter((t) => t.change24h > 5 && t.momentum > 60).slice(0, 4) || [];
  const crashing = tokenHeat?.filter((t) => t.change24h < -5).slice(0, 4) || [];
  const unusual = tokenHeat?.filter((t) => t.volatility > 80 || t.liquidityChange < -20).slice(0, 4) || [];
  const newLaunches = tokenHeat?.filter((t) => t.socialScore > 70 && t.volumeSpike > 80).slice(0, 4) || [];

  const categories = [
    {
      id: "rising",
      label: "Rising",
      icon: TrendingUp,
      color: "success",
      description: "Coins starting to trend",
      tokens: rising,
    },
    {
      id: "crashing",
      label: "Crashing",
      icon: TrendingDown,
      color: "danger",
      description: "Coins losing momentum",
      tokens: crashing,
    },
    {
      id: "new",
      label: "New Launches",
      icon: Sparkles,
      color: "secondary",
      description: "Brand new trending tokens",
      tokens: newLaunches,
    },
    {
      id: "unusual",
      label: "Unusual Activity",
      icon: AlertTriangle,
      color: "warning",
      description: "Suspicious behavior detected",
      tokens: unusual,
    },
  ];

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display text-foreground">Token Discovery Engine</h3>
          <p className="text-sm text-muted-foreground">AI-powered token scanner on {chain.name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={cn(
              "p-4 rounded-xl border transition-all",
              cat.color === "success" && "border-success/30 bg-success/5",
              cat.color === "danger" && "border-danger/30 bg-danger/5",
              cat.color === "secondary" && "border-secondary/30 bg-secondary/5",
              cat.color === "warning" && "border-warning/30 bg-warning/5"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                cat.color === "success" && "bg-success/20",
                cat.color === "danger" && "bg-danger/20",
                cat.color === "secondary" && "bg-secondary/20",
                cat.color === "warning" && "bg-warning/20"
              )}>
                <cat.icon className={cn(
                  "h-4 w-4",
                  cat.color === "success" && "text-success",
                  cat.color === "danger" && "text-danger",
                  cat.color === "secondary" && "text-secondary",
                  cat.color === "warning" && "text-warning"
                )} />
              </div>
              <div>
                <h4 className="text-sm font-display text-foreground">{cat.label}</h4>
                <p className="text-[10px] text-muted-foreground">{cat.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 rounded bg-muted/20 animate-pulse" />
                ))
              ) : cat.tokens.length > 0 ? (
                cat.tokens.map((token) => (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/30"
                  >
                    <span className="text-sm font-medium text-foreground">{token.symbol}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      token.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No tokens detected</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
