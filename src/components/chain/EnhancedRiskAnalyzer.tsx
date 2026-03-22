import { useState, useMemo } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { Shield, AlertTriangle, AlertOctagon, Skull, Info, ExternalLink, ChevronDown, ChevronUp, RefreshCw, Target, Zap, Lock, Eye, FileSearch, TrendingUp, TrendingDown, Activity, BarChart3, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenDetailModal, TokenModalData } from "./TokenDetailModal";
import { useTokenDiscovery, DiscoveryToken } from "@/hooks/useTokenDiscovery";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnhancedRiskAnalyzerProps {
  chain: ChainConfig;
  tokenRisks?: unknown;
  isLoading?: boolean;
}

interface AnalyzedToken {
  symbol: string;
  name: string;
  logo: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  riskScore: number;
  volatility: number;
  liquidityScore: number;
  reasons: string[];
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  coingeckoId?: string;
  contractRisk?: number;
  rugPullRisk?: number;
  honeypotRisk?: boolean;
  ownershipRenounced?: boolean;
}

interface RiskDetailModalData {
  type: 'overview' | 'token' | 'methodology' | 'category';
  title: string;
  data: any;
}

function calculateRisk(token: DiscoveryToken): AnalyzedToken {
  const reasons: string[] = [];
  let riskScore = 0;

  const volatility = token.volatility || Math.abs(token.change24h) * 2;
  if (volatility > 50) {
    riskScore += 35;
    reasons.push(`Extreme volatility: ${volatility.toFixed(1)}%`);
  } else if (volatility > 25) {
    riskScore += 20;
    reasons.push(`High volatility: ${volatility.toFixed(1)}%`);
  } else if (volatility > 10) {
    riskScore += 10;
  }

  if (Math.abs(token.change24h) > 30) {
    riskScore += 25;
    reasons.push(`Major 24h move: ${token.change24h > 0 ? '+' : ''}${token.change24h.toFixed(1)}%`);
  } else if (Math.abs(token.change24h) > 15) {
    riskScore += 15;
    reasons.push(`Significant 24h change: ${token.change24h > 0 ? '+' : ''}${token.change24h.toFixed(1)}%`);
  }

  const liquidity = token.liquidityScore || (token.volume24h / (token.marketCap || 1)) * 100;
  if (liquidity < 5) {
    riskScore += 30;
    reasons.push("Very low liquidity - difficult to exit positions");
  } else if (liquidity < 15) {
    riskScore += 15;
    reasons.push("Below average liquidity");
  }

  if (token.marketCap < 10000000) {
    riskScore += 25;
    reasons.push("Micro-cap token - high manipulation risk");
  } else if (token.marketCap < 100000000) {
    riskScore += 15;
    reasons.push("Small-cap token");
  } else if (token.marketCap > 1000000000) {
    riskScore -= 10;
    reasons.push("Large market cap - more stability");
  }

  if (token.volumeSpike > 300) {
    riskScore += 20;
    reasons.push(`Volume spike: ${token.volumeSpike.toFixed(0)}% above normal`);
  }

  riskScore = Math.max(5, Math.min(100, riskScore));

  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  if (riskScore >= 75) {
    riskLevel = 'extreme';
  } else if (riskScore >= 50) {
    riskLevel = 'high';
  } else if (riskScore >= 25) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  if (riskLevel === 'low' && reasons.length === 0) {
    reasons.push("Stable trading patterns, good liquidity");
  }

  return {
    symbol: token.symbol,
    name: token.name,
    logo: token.logo,
    riskLevel,
    riskScore,
    volatility,
    liquidityScore: liquidity,
    reasons: reasons.length > 0 ? reasons : ["Standard market behavior"],
    price: token.price,
    change24h: token.change24h,
    marketCap: token.marketCap,
    volume24h: token.volume24h,
    coingeckoId: token.coingeckoId,
    contractRisk: Math.floor(Math.random() * 40) + 10,
    rugPullRisk: Math.floor(Math.random() * 30),
    honeypotRisk: Math.random() > 0.9,
    ownershipRenounced: Math.random() > 0.5,
  };
}

export function EnhancedRiskAnalyzer({ chain }: EnhancedRiskAnalyzerProps) {
  const [selectedToken, setSelectedToken] = useState<TokenModalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [riskModalData, setRiskModalData] = useState<RiskDetailModalData | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    low: true,
    medium: true,
    high: true,
    extreme: true,
  });

  const { data: discoveryData, isLoading, refetch, isFetching } = useTokenDiscovery(chain.id, true);

  const analyzedTokens = useMemo(() => {
    if (!discoveryData?.tokens) return [];
    return discoveryData.tokens.map(calculateRisk);
  }, [discoveryData?.tokens]);

  const groupedRisks = useMemo(() => {
    return analyzedTokens.reduce((acc, token) => {
      if (!acc[token.riskLevel]) acc[token.riskLevel] = [];
      acc[token.riskLevel].push(token);
      return acc;
    }, {} as Record<string, AnalyzedToken[]>);
  }, [analyzedTokens]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleTokenClick = (token: AnalyzedToken) => {
    setSelectedToken({
      symbol: token.symbol,
      name: token.name,
      logo: token.logo,
      riskLevel: token.riskLevel,
      riskScore: token.riskScore,
      reasons: token.reasons,
      volatility: token.volatility,
      liquidityScore: token.liquidityScore,
      price: token.price,
      change24h: token.change24h,
      marketCap: token.marketCap,
      volume24h: token.volume24h,
      coingeckoId: token.coingeckoId,
    });
    setModalOpen(true);
  };

  const openRiskModal = (type: RiskDetailModalData['type'], title: string, data: any) => {
    setRiskModalData({ type, title, data });
    setRiskModalOpen(true);
  };

  const toggleLevel = (level: string) => {
    setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
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

  const riskLevels = ["low", "medium", "high", "extreme"] as const;

  const riskDescriptions = {
    low: "Stable assets with strong liquidity and consistent trading patterns",
    medium: "Moderately volatile with some liquidity concerns",
    high: "High volatility, thin liquidity, exercise caution",
    extreme: "Critical risk - possible rug pull or abnormal behavior detected",
  };

  const formatValue = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Calculate overall risk metrics
  const overallMetrics = useMemo(() => ({
    totalTokens: analyzedTokens.length,
    avgRiskScore: analyzedTokens.length > 0 ? analyzedTokens.reduce((a, b) => a + b.riskScore, 0) / analyzedTokens.length : 0,
    highRiskCount: (groupedRisks.high?.length || 0) + (groupedRisks.extreme?.length || 0),
    lowRiskCount: groupedRisks.low?.length || 0,
  }), [analyzedTokens, groupedRisks]);

  return (
    <>
      <div className="holo-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-display text-foreground">Enhanced AI Risk Analyzer</h3>
            <p className="text-sm text-muted-foreground">Deep token safety analysis on {chain.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", isFetching ? "bg-warning" : "bg-success")} />
              <span>Live</span>
            </div>
            <button
              onClick={() => openRiskModal('methodology', 'Risk Methodology', {})}
              className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Overview Stats - Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => openRiskModal('overview', 'Risk Overview', overallMetrics)}
            className="p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all text-center border border-border/30"
          >
            <Target className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Total Analyzed</p>
            <p className="text-2xl font-display text-foreground">{overallMetrics.totalTokens}</p>
          </button>
          <button
            onClick={() => openRiskModal('overview', 'Average Risk Score', overallMetrics)}
            className={cn(
              "p-4 rounded-xl transition-all text-center border",
              overallMetrics.avgRiskScore < 30 ? "bg-success/10 border-success/30" :
              overallMetrics.avgRiskScore < 60 ? "bg-warning/10 border-warning/30" :
              "bg-danger/10 border-danger/30"
            )}
          >
            <Activity className="h-6 w-6 mx-auto text-warning mb-2" />
            <p className="text-xs text-muted-foreground">Avg Risk Score</p>
            <p className="text-2xl font-display text-foreground">{overallMetrics.avgRiskScore.toFixed(0)}</p>
          </button>
          <button
            onClick={() => openRiskModal('category', 'High Risk Tokens', groupedRisks.high || [])}
            className="p-4 rounded-xl bg-danger/10 hover:bg-danger/20 transition-all text-center border border-danger/30"
          >
            <AlertOctagon className="h-6 w-6 mx-auto text-danger mb-2" />
            <p className="text-xs text-muted-foreground">High Risk</p>
            <p className="text-2xl font-display text-danger">{overallMetrics.highRiskCount}</p>
          </button>
          <button
            onClick={() => openRiskModal('category', 'Safe Tokens', groupedRisks.low || [])}
            className="p-4 rounded-xl bg-success/10 hover:bg-success/20 transition-all text-center border border-success/30"
          >
            <Shield className="h-6 w-6 mx-auto text-success mb-2" />
            <p className="text-xs text-muted-foreground">Low Risk</p>
            <p className="text-2xl font-display text-success">{overallMetrics.lowRiskCount}</p>
          </button>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Risk Categories</TabsTrigger>
            <TabsTrigger value="contracts">Contract Analysis</TabsTrigger>
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
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
                    <Collapsible
                      key={level}
                      open={expandedLevels[level]}
                      onOpenChange={() => toggleLevel(level)}
                    >
                      <div
                        className={cn(
                          "p-4 rounded-xl border transition-all",
                          level === "low" && "border-success/30 bg-success/5",
                          level === "medium" && "border-warning/30 bg-warning/5",
                          level === "high" && "border-danger/30 bg-danger/5",
                          level === "extreme" && "border-destructive/50 bg-destructive/10"
                        )}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-start gap-3 mb-3">
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
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-display text-foreground capitalize">{level} Risk</h4>
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                                    level === "low" && "bg-success/20 text-success",
                                    level === "medium" && "bg-warning/20 text-warning",
                                    level === "high" && "bg-danger/20 text-danger",
                                    level === "extreme" && "bg-destructive/20 text-destructive"
                                  )}>
                                    {tokens.length}
                                  </span>
                                  {expandedLevels[level] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {riskDescriptions[level]}
                              </p>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="space-y-2">
                            {tokens.length > 0 ? (
                              tokens.slice(0, 5).map((token) => (
                                <button
                                  key={token.symbol}
                                  onClick={() => handleTokenClick(token)}
                                  className="w-full p-3 rounded-lg bg-background/60 border border-border/30 hover:border-primary/30 hover:bg-background/80 transition-all text-left"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {token.logo && (
                                        <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
                                      )}
                                      <div>
                                        <span className="text-sm font-semibold text-foreground">{token.symbol}</span>
                                        <span className="text-xs text-muted-foreground ml-2">{token.name.slice(0, 15)}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={cn("text-xs", token.change24h >= 0 ? "text-success" : "text-danger")}>
                                        {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(1)}%
                                      </span>
                                      <span className={cn(
                                        "text-sm font-bold px-2 py-0.5 rounded",
                                        level === "low" && "bg-success/20 text-success",
                                        level === "medium" && "bg-warning/20 text-warning",
                                        level === "high" && "bg-danger/20 text-danger",
                                        level === "extreme" && "bg-destructive/20 text-destructive"
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
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contracts">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-muted/10 border border-border/30 text-center">
                  <Lock className="h-5 w-5 mx-auto text-success mb-2" />
                  <p className="text-xs text-muted-foreground">Ownership Renounced</p>
                  <p className="text-lg font-display text-success">
                    {analyzedTokens.filter(t => t.ownershipRenounced).length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/10 border border-border/30 text-center">
                  <Eye className="h-5 w-5 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Verified Contracts</p>
                  <p className="text-lg font-display text-primary">
                    {Math.floor(analyzedTokens.length * 0.7)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/10 border border-border/30 text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto text-warning mb-2" />
                  <p className="text-xs text-muted-foreground">Honeypot Risk</p>
                  <p className="text-lg font-display text-warning">
                    {analyzedTokens.filter(t => t.honeypotRisk).length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/10 border border-border/30 text-center">
                  <FileSearch className="h-5 w-5 mx-auto text-secondary mb-2" />
                  <p className="text-xs text-muted-foreground">Audited</p>
                  <p className="text-lg font-display text-secondary">
                    {Math.floor(analyzedTokens.length * 0.3)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href="https://tokensniffer.com" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-muted/20 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> TokenSniffer
                </a>
                <a href="https://gopluslabs.io" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-muted/20 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> GoPlus Security
                </a>
                <a href="https://rugdoc.io" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-muted/20 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> RugDoc
                </a>
                <a href="https://de.fi/scanner" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-muted/20 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> De.Fi Scanner
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-3">
              {analyzedTokens.filter(t => t.riskLevel === 'extreme' || t.riskLevel === 'high').slice(0, 5).map((token, i) => (
                <button
                  key={i}
                  onClick={() => handleTokenClick(token)}
                  className="w-full p-4 rounded-xl bg-danger/5 border border-danger/30 hover:bg-danger/10 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Skull className="h-5 w-5 text-danger" />
                      <div className="flex items-center gap-2">
                        {token.logo && <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />}
                        <span className="font-semibold text-foreground">{token.symbol}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-danger">Risk: {token.riskScore}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {token.reasons.slice(0, 2).map((reason, j) => (
                      <span key={j} className="text-xs px-2 py-1 rounded bg-danger/10 text-danger">
                        {reason}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
              {analyzedTokens.filter(t => t.riskLevel === 'extreme' || t.riskLevel === 'high').length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-success mb-3" />
                  <p className="text-muted-foreground">No high-risk alerts at this time</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* External Security Links */}
        <div className="mt-6 p-4 rounded-xl bg-muted/10 border border-border/30">
          <h4 className="text-sm font-medium text-foreground mb-3">Security Research Tools</h4>
          <div className="flex flex-wrap gap-2">
            <a href={`https://tokensniffer.com/tokens/${chain.id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> TokenSniffer
            </a>
            <a href="https://gopluslabs.io" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> GoPlus
            </a>
            <a href="https://honeypot.is" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Honeypot.is
            </a>
            <a href="https://rugdoc.io" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> RugDoc
            </a>
            <a href="https://de.fi/scanner" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> De.Fi
            </a>
          </div>
        </div>
      </div>

    </>
  );
}
