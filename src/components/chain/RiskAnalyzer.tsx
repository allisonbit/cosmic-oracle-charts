import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { TokenRisk } from "@/hooks/useChainForecast";
import { Shield, AlertTriangle, AlertOctagon, Skull, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenDetailModal, TokenModalData } from "./TokenDetailModal";

interface RiskAnalyzerProps {
  chain: ChainConfig;
  tokenRisks: TokenRisk[] | undefined;
  isLoading: boolean;
}

export function RiskAnalyzer({ chain, tokenRisks, isLoading }: RiskAnalyzerProps) {
  const [selectedToken, setSelectedToken] = useState<TokenModalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTokenClick = (token: TokenRisk, level: string) => {
    setSelectedToken({
      symbol: token.symbol,
      name: token.symbol,
      riskLevel: level,
      riskScore: token.riskScore,
      reasons: token.reasons,
      volatility: token.volatility,
      liquidityScore: token.liquidity,
    });
    setModalOpen(true);
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low": return Shield;
      case "medium": return AlertTriangle;
      case "high": return AlertOctagon;
      case "extreme": return Skull;
      default: return Shield;
    }
  };

  const groupedRisks = tokenRisks?.reduce((acc, token) => {
    if (!acc[token.riskLevel]) acc[token.riskLevel] = [];
    acc[token.riskLevel].push(token);
    return acc;
  }, {} as Record<string, TokenRisk[]>);

  const riskLevels = ["low", "medium", "high", "extreme"] as const;

  const riskDescriptions = {
    low: "Stable assets with strong liquidity and consistent trading patterns",
    medium: "Moderately volatile with some liquidity concerns",
    high: "High volatility, thin liquidity, exercise caution",
    extreme: "Critical risk - possible rug pull or abnormal behavior detected",
  };

  return (
    <>
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-display text-foreground">AI Risk Analyzer</h3>
            <p className="text-sm text-muted-foreground">Token safety analysis on {chain.name}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <span>Click token for details</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskLevels.map((level) => {
              const tokens = groupedRisks?.[level] || [];
              const Icon = getRiskIcon(level);

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
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-foreground capitalize">{level} Risk</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                          level === "low" && "bg-success/20 text-success",
                          level === "medium" && "bg-warning/20 text-warning",
                          level === "high" && "bg-danger/20 text-danger",
                          level === "extreme" && "bg-destructive/20 text-destructive"
                        )}>
                          {tokens.length}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {riskDescriptions[level]}
                      </p>
                    </div>
                  </div>

                  {/* Tokens Grid */}
                  <div className="space-y-2">
                    {tokens.length > 0 ? (
                      tokens.slice(0, 4).map((token) => (
                        <button
                          key={token.symbol}
                          onClick={() => handleTokenClick(token, level)}
                          className="w-full p-3 rounded-lg bg-background/60 border border-border/30 hover:border-primary/30 hover:bg-background/80 transition-all text-left group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {token.symbol}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Risk Score</span>
                              <span className={cn(
                                "text-sm font-bold",
                                level === "low" && "text-success",
                                level === "medium" && "text-warning",
                                level === "high" && "text-danger",
                                level === "extreme" && "text-destructive"
                              )}>
                                {token.riskScore}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                level === "low" && "bg-success",
                                level === "medium" && "bg-warning",
                                level === "high" && "bg-danger",
                                level === "extreme" && "bg-destructive"
                              )}
                              style={{ width: `${token.riskScore}%` }}
                            />
                          </div>
                          {token.reasons.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                              {token.reasons[0]}
                            </p>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-xs text-muted-foreground">No tokens in this category</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TokenDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        token={selectedToken}
      />
    </>
  );
}
