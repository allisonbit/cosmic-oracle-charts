import { ChainConfig } from "@/lib/chainConfig";
import { TokenRisk } from "@/hooks/useChainForecast";
import { Shield, AlertTriangle, AlertOctagon, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskAnalyzerProps {
  chain: ChainConfig;
  tokenRisks: TokenRisk[] | undefined;
  isLoading: boolean;
}

export function RiskAnalyzer({ chain, tokenRisks, isLoading }: RiskAnalyzerProps) {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low": return Shield;
      case "medium": return AlertTriangle;
      case "high": return AlertOctagon;
      case "extreme": return Skull;
      default: return Shield;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "success";
      case "medium": return "warning";
      case "high": return "danger";
      case "extreme": return "destructive";
      default: return "muted";
    }
  };

  const groupedRisks = tokenRisks?.reduce((acc, token) => {
    if (!acc[token.riskLevel]) acc[token.riskLevel] = [];
    acc[token.riskLevel].push(token);
    return acc;
  }, {} as Record<string, TokenRisk[]>);

  const riskLevels = ["low", "medium", "high", "extreme"] as const;

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display text-foreground">AI Risk Analyzer</h3>
          <p className="text-sm text-muted-foreground">Token safety analysis on {chain.name}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {riskLevels.map((level) => {
            const tokens = groupedRisks?.[level] || [];
            const Icon = getRiskIcon(level);
            const colorClass = getRiskColor(level);

            return (
              <div
                key={level}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  level === "low" && "border-success/30 bg-success/5",
                  level === "medium" && "border-warning/30 bg-warning/5",
                  level === "high" && "border-danger/30 bg-danger/5",
                  level === "extreme" && "border-destructive/50 bg-destructive/10"
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    level === "low" && "bg-success/20",
                    level === "medium" && "bg-warning/20",
                    level === "high" && "bg-danger/20",
                    level === "extreme" && "bg-destructive/20"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      level === "low" && "text-success",
                      level === "medium" && "text-warning",
                      level === "high" && "text-danger",
                      level === "extreme" && "text-destructive"
                    )} />
                  </div>
                  <div>
                    <h4 className="font-display text-foreground capitalize">{level} Risk</h4>
                    <p className="text-xs text-muted-foreground">
                      {level === "low" && "Stable, strong liquidity"}
                      {level === "medium" && "Volatile but trending"}
                      {level === "high" && "Thin liquidity, dangerous"}
                      {level === "extreme" && "Possible rug, abnormal behavior"}
                    </p>
                  </div>
                  <span className={cn(
                    "ml-auto px-2 py-1 rounded-full text-xs font-medium",
                    level === "low" && "bg-success/20 text-success",
                    level === "medium" && "bg-warning/20 text-warning",
                    level === "high" && "bg-danger/20 text-danger",
                    level === "extreme" && "bg-destructive/20 text-destructive"
                  )}>
                    {tokens.length} tokens
                  </span>
                </div>

                {tokens.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {tokens.slice(0, 4).map((token) => (
                      <div
                        key={token.symbol}
                        className="p-2 rounded-lg bg-background/50 border border-border/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{token.symbol}</span>
                          <span className="text-xs text-muted-foreground">{token.riskScore}/100</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              level === "low" && "bg-success",
                              level === "medium" && "bg-warning",
                              level === "high" && "bg-danger",
                              level === "extreme" && "bg-destructive"
                            )}
                            style={{ width: `${token.riskScore}%` }}
                          />
                        </div>
                        {token.reasons.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {token.reasons[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
