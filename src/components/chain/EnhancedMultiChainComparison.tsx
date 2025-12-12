import { useState } from "react";
import { ChainConfig, CHAINS } from "@/lib/chainConfig";
import { GitCompare, ArrowRightLeft, Layers, DollarSign, Zap, Activity, TrendingUp, TrendingDown, ExternalLink, Info, BarChart3, Globe, Shield, Clock, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface EnhancedMultiChainComparisonProps {
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

interface DetailModalData {
  type: 'chain' | 'l2' | 'bridge' | 'fee' | 'methodology';
  title: string;
  data: any;
}

export function EnhancedMultiChainComparison({ chain, comparisonData, isLoading }: EnhancedMultiChainComparisonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<DetailModalData | null>(null);

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

  const openDetailModal = (type: DetailModalData['type'], title: string, data: any) => {
    setModalData({ type, title, data });
    setModalOpen(true);
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

  // Calculate rankings
  const tpsRanking = [...comparisonData.chainMetrics].sort((a, b) => b.tps - a.tps);
  const tvlRanking = [...comparisonData.chainMetrics].sort((a, b) => b.tvl - a.tvl);
  const feeRanking = [...comparisonData.chainMetrics].sort((a, b) => a.avgFee - b.avgFee);

  const currentChainRanks = {
    tps: tpsRanking.findIndex(c => c.chainId === chain.id) + 1,
    tvl: tvlRanking.findIndex(c => c.chainId === chain.id) + 1,
    fee: feeRanking.findIndex(c => c.chainId === chain.id) + 1,
  };

  return (
    <>
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <GitCompare className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground">Enhanced Multi-Chain Comparison</h3>
              <p className="text-sm text-muted-foreground">{chain.name} vs competitors</p>
            </div>
          </div>
          <button
            onClick={() => openDetailModal('methodology', 'Comparison Methodology', {})}
            className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Quick Rankings */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => openDetailModal('chain', 'TPS Rankings', { type: 'tps', data: tpsRanking })}
            className="p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all border border-border/30"
          >
            <Zap className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">TPS Rank</p>
            <p className="text-2xl font-display text-foreground">#{currentChainRanks.tps}</p>
            <p className="text-xs text-muted-foreground">of {comparisonData.chainMetrics.length}</p>
          </button>
          <button
            onClick={() => openDetailModal('chain', 'TVL Rankings', { type: 'tvl', data: tvlRanking })}
            className="p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all border border-border/30"
          >
            <BarChart3 className="h-5 w-5 text-success mb-2" />
            <p className="text-xs text-muted-foreground">TVL Rank</p>
            <p className="text-2xl font-display text-foreground">#{currentChainRanks.tvl}</p>
            <p className="text-xs text-muted-foreground">of {comparisonData.chainMetrics.length}</p>
          </button>
          <button
            onClick={() => openDetailModal('chain', 'Fee Rankings (Lowest)', { type: 'fee', data: feeRanking })}
            className="p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all border border-border/30"
          >
            <DollarSign className="h-5 w-5 text-warning mb-2" />
            <p className="text-xs text-muted-foreground">Fee Rank</p>
            <p className="text-2xl font-display text-foreground">#{currentChainRanks.fee}</p>
            <p className="text-xs text-muted-foreground">lowest fees</p>
          </button>
        </div>

        <Tabs defaultValue="networks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="networks">Networks</TabsTrigger>
            <TabsTrigger value="l2">Layer 2</TabsTrigger>
            <TabsTrigger value="bridges">Bridges</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="networks">
            <div className="bg-background/40 border border-border/30 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
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
                        <tr 
                          key={i} 
                          className={cn(
                            "border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/20 transition-colors",
                            isCurrentChain && "bg-primary/10"
                          )}
                          onClick={() => openDetailModal('chain', `${metric.name} Details`, metric)}
                        >
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
          </TabsContent>

          <TabsContent value="l2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonData.layer2Comparison.map((l2, i) => (
                <button
                  key={i}
                  onClick={() => openDetailModal('l2', `${l2.name} L2 Analysis`, l2)}
                  className="bg-background/40 border border-border/30 rounded-lg p-4 text-left hover:bg-muted/20 transition-all"
                >
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
                  <Progress value={l2.sequencerUptime} className="h-1 mt-3" />
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bridges">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparisonData.bridgeMonitoring.map((bridge, i) => (
                <button
                  key={i}
                  onClick={() => openDetailModal('bridge', `${bridge.bridge} Bridge Analysis`, bridge)}
                  className="bg-background/40 border border-border/30 rounded-lg p-4 text-left hover:bg-muted/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">{bridge.bridge}</span>
                    <div className={`w-3 h-3 rounded-full ${bridge.health > 90 ? "bg-green-400" : bridge.health > 70 ? "bg-yellow-400" : "bg-red-400"}`} />
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">{formatNumber(bridge.tvl)}</div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>24h: {formatNumber(bridge.volume24h)}</span>
                    {bridge.recentHacks > 0 && (
                      <span className="text-red-400">⚠️ {bridge.recentHacks} incidents</span>
                    )}
                  </div>
                  <Progress 
                    value={bridge.health} 
                    className={`h-1 mt-3 ${bridge.health > 90 ? "" : bridge.health > 70 ? "[&>div]:bg-yellow-400" : "[&>div]:bg-red-400"}`} 
                  />
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fees">
            <div className="bg-background/40 border border-border/30 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
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
                        <tr 
                          key={i} 
                          className={cn(
                            "border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/20 transition-colors",
                            isCurrentChain && "bg-primary/10"
                          )}
                          onClick={() => openDetailModal('fee', `${fee.chain} Fee Breakdown`, fee)}
                        >
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
          </TabsContent>
        </Tabs>

        {/* External Links */}
        <div className="mt-6 flex flex-wrap gap-2">
          <a href="https://l2beat.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> L2Beat
          </a>
          <a href="https://defillama.com/chains" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> DeFi Llama
          </a>
          <a href="https://dune.com/browse/dashboards?q=multichain" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> Dune Analytics
          </a>
          <a href="https://chainlist.org" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> ChainList
          </a>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              {modalData?.title}
            </DialogTitle>
          </DialogHeader>

          {modalData?.type === 'chain' && modalData.data.chainId && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/10 border border-border/30">
                <span className="text-3xl">{CHAINS.find(c => c.id === modalData.data.chainId)?.icon || "◆"}</span>
                <div>
                  <h4 className="text-lg font-display text-foreground">{modalData.data.name}</h4>
                  <p className="text-sm text-muted-foreground">Blockchain Network</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">TPS</p>
                  <p className="text-xl font-display text-foreground">{modalData.data.tps.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">Avg Fee</p>
                  <p className="text-xl font-display text-foreground">{formatFee(modalData.data.avgFee)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">TVL</p>
                  <p className="text-xl font-display text-foreground">{formatNumber(modalData.data.tvl)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">24h Volume</p>
                  <p className="text-xl font-display text-foreground">{formatNumber(modalData.data.volume24h)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">Finality</p>
                  <p className="text-xl font-display text-foreground">{modalData.data.finality}s</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">Active Users</p>
                  <p className="text-xl font-display text-foreground">{(modalData.data.activeUsers / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://defillama.com/chain/${modalData.data.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4" /> DeFi Llama
                </a>
                <a
                  href={`https://l2beat.com/scaling/projects/${modalData.data.name.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4" /> L2Beat
                </a>
              </div>
            </div>
          )}

          {modalData?.type === 'l2' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-display text-foreground">{modalData.data.name}</h4>
                  <Badge variant="outline" className={modalData.data.sequencerUptime > 99 ? "text-green-400 border-green-400/30" : "text-yellow-400 border-yellow-400/30"}>
                    {modalData.data.sequencerUptime.toFixed(2)}% uptime
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Layer 2 Rollup</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">Total Value Locked</p>
                  <p className="text-xl font-display text-foreground">{formatNumber(modalData.data.tvl)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">24h Transactions</p>
                  <p className="text-xl font-display text-foreground">{(modalData.data.transactions24h / 1e6).toFixed(2)}M</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">Average Fee</p>
                  <p className="text-xl font-display text-success">{formatFee(modalData.data.avgFee)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">Sequencer Status</p>
                  <p className="text-xl font-display text-success">Healthy</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-xs text-muted-foreground mb-1">L2 Benefits</p>
                <p className="text-sm text-foreground">
                  {modalData.data.name} provides {((1 - modalData.data.avgFee / 15) * 100).toFixed(0)}% lower fees than L1 Ethereum while maintaining security guarantees through rollup technology.
                </p>
              </div>
            </div>
          )}

          {modalData?.type === 'bridge' && (
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-xl border",
                modalData.data.health > 90 ? "bg-success/10 border-success/30" :
                modalData.data.health > 70 ? "bg-warning/10 border-warning/30" :
                "bg-danger/10 border-danger/30"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-display text-foreground">{modalData.data.bridge}</h4>
                  <Badge variant="outline" className={
                    modalData.data.health > 90 ? "text-green-400 border-green-400/30" :
                    modalData.data.health > 70 ? "text-yellow-400 border-yellow-400/30" :
                    "text-red-400 border-red-400/30"
                  }>
                    {modalData.data.health}% health
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Cross-Chain Bridge</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">Total Value Locked</p>
                  <p className="text-xl font-display text-foreground">{formatNumber(modalData.data.tvl)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <p className="text-xs text-muted-foreground">24h Volume</p>
                  <p className="text-xl font-display text-foreground">{formatNumber(modalData.data.volume24h)}</p>
                </div>
              </div>
              {modalData.data.recentHacks > 0 && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
                  <p className="text-sm text-danger flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    ⚠️ {modalData.data.recentHacks} security incident(s) reported
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <a
                  href="https://defillama.com/bridges"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4" /> Bridge Stats
                </a>
              </div>
            </div>
          )}

          {modalData?.type === 'methodology' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                <h4 className="font-medium text-foreground mb-2">Data Sources</h4>
                <p className="text-sm text-muted-foreground">
                  Comparison data is aggregated from multiple on-chain sources and updated in real-time.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/10">
                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-foreground">Network Metrics</h5>
                    <p className="text-xs text-muted-foreground">TPS, finality, and active users from node data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/10">
                  <BarChart3 className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-foreground">TVL Data</h5>
                    <p className="text-xs text-muted-foreground">Total value locked from DeFi Llama</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/10">
                  <DollarSign className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-foreground">Fee Tracking</h5>
                    <p className="text-xs text-muted-foreground">Real-time gas prices and transaction costs</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}