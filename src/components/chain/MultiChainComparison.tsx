import { ChainConfig, CHAINS } from "@/lib/chainConfig";
import { GitCompare, ArrowRightLeft, Layers, DollarSign, Zap, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface MultiChainComparisonProps {
  chain: ChainConfig;
  comparisonData?: MultiChainData;
  isLoading: boolean;
}

export interface MultiChainData {
  chainMetrics: {
    chainId: string;
    name: string;
    tps: number;
    avgFee: number;
    finality: number;
    tvl: number;
    volume24h: number;
    activeUsers: number;
    marketCap: number;
  }[];
  layer2Comparison: {
    name: string;
    tvl: number;
    transactions24h: number;
    avgFee: number;
    sequencerUptime: number;
  }[];
  bridgeMonitoring: {
    bridge: string;
    tvl: number;
    volume24h: number;
    health: number;
    recentHacks: number;
  }[];
  feeComparison: {
    chain: string;
    swapFee: number;
    transferFee: number;
    nftMintFee: number;
    contractDeployFee: number;
  }[];
}

export function MultiChainComparison({ chain, comparisonData, isLoading }: MultiChainComparisonProps) {
  const formatNumber = (n: number, decimals = 2) => {
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(decimals) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(decimals) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(decimals) + "K";
    return "$" + n.toFixed(decimals);
  };

  const formatFee = (n: number) => {
    if (n < 0.01) return "<$0.01";
    return "$" + n.toFixed(2);
  };

  if (isLoading || !comparisonData) {
    return (
      <div className="holo-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="holo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <GitCompare className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-display text-lg text-foreground">Multi-Chain Comparison</h3>
          <p className="text-sm text-muted-foreground">{chain.name} vs competitors</p>
        </div>
      </div>

      {/* Chain Metrics Comparison Table */}
      <div className="mb-6 overflow-x-auto">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Network Performance
        </h4>
        <div className="bg-background/40 border border-border/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Chain</th>
                <th className="text-right p-3 text-muted-foreground font-medium">TPS</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Avg Fee</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Finality</th>
                <th className="text-right p-3 text-muted-foreground font-medium">TVL</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Volume 24h</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.chainMetrics.map((metric, i) => {
                const isCurrentChain = metric.chainId === chain.id;
                return (
                  <tr key={i} className={`border-b border-border/30 last:border-0 ${isCurrentChain ? "bg-primary/10" : ""}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{CHAINS.find(c => c.id === metric.chainId)?.icon || "◆"}</span>
                        <span className={`font-medium ${isCurrentChain ? "text-primary" : "text-foreground"}`}>
                          {metric.name}
                        </span>
                        {isCurrentChain && <Badge className="text-xs">Current</Badge>}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-mono ${metric.tps > 1000 ? "text-green-400" : "text-foreground"}`}>
                        {metric.tps.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-mono ${metric.avgFee < 0.1 ? "text-green-400" : metric.avgFee > 10 ? "text-red-400" : "text-yellow-400"}`}>
                        {formatFee(metric.avgFee)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-mono text-foreground">{metric.finality}s</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-mono text-foreground">{formatNumber(metric.tvl)}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-mono text-foreground">{formatNumber(metric.volume24h)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layer 2 Comparison */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          Layer 2 Comparison
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisonData.layer2Comparison.map((l2, i) => (
            <div key={i} className="bg-background/40 border border-border/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">{l2.name}</span>
                <Badge variant="outline" className={`text-xs ${l2.sequencerUptime > 99 ? "text-green-400 border-green-400/30" : "text-yellow-400 border-yellow-400/30"}`}>
                  {l2.sequencerUptime.toFixed(1)}% uptime
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVL</span>
                  <span className="text-foreground font-medium">{formatNumber(l2.tvl)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">24h Txns</span>
                  <span className="text-foreground font-medium">{(l2.transactions24h / 1e6).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Fee</span>
                  <span className="text-green-400 font-medium">{formatFee(l2.avgFee)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bridge Monitoring */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-cyan-400" />
          Cross-Chain Bridge Monitoring
        </h4>
        <div className="bg-background/40 border border-border/30 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonData.bridgeMonitoring.map((bridge, i) => (
              <div key={i} className="bg-background/40 border border-border/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground text-sm">{bridge.bridge}</span>
                  <div className={`w-2 h-2 rounded-full ${bridge.health > 90 ? "bg-green-400" : bridge.health > 70 ? "bg-yellow-400" : "bg-red-400"}`} />
                </div>
                <div className="text-lg font-bold text-foreground mb-1">{formatNumber(bridge.tvl)}</div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>24h: {formatNumber(bridge.volume24h)}</span>
                  {bridge.recentHacks > 0 && (
                    <span className="text-red-400">⚠️ {bridge.recentHacks} incidents</span>
                  )}
                </div>
                <div className="mt-2">
                  <Progress value={bridge.health} className={`h-1 ${bridge.health > 90 ? "" : bridge.health > 70 ? "[&>div]:bg-yellow-400" : "[&>div]:bg-red-400"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Comparison */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-400" />
          Transaction Fee Comparison
        </h4>
        <div className="bg-background/40 border border-border/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Chain</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Token Swap</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Transfer</th>
                <th className="text-right p-3 text-muted-foreground font-medium">NFT Mint</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Deploy Contract</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.feeComparison.map((fee, i) => {
                const isCurrentChain = fee.chain.toLowerCase() === chain.id;
                return (
                  <tr key={i} className={`border-b border-border/30 last:border-0 ${isCurrentChain ? "bg-primary/10" : ""}`}>
                    <td className="p-3">
                      <span className={`font-medium ${isCurrentChain ? "text-primary" : "text-foreground"}`}>
                        {fee.chain}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-mono ${fee.swapFee < 1 ? "text-green-400" : fee.swapFee > 20 ? "text-red-400" : "text-yellow-400"}`}>
                        {formatFee(fee.swapFee)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-mono ${fee.transferFee < 0.5 ? "text-green-400" : fee.transferFee > 5 ? "text-red-400" : "text-yellow-400"}`}>
                        {formatFee(fee.transferFee)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-mono ${fee.nftMintFee < 5 ? "text-green-400" : fee.nftMintFee > 50 ? "text-red-400" : "text-yellow-400"}`}>
                        {formatFee(fee.nftMintFee)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-mono ${fee.contractDeployFee < 50 ? "text-green-400" : fee.contractDeployFee > 500 ? "text-red-400" : "text-yellow-400"}`}>
                        {formatFee(fee.contractDeployFee)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}