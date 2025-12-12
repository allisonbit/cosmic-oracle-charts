import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { Activity, Blocks, Flame, Shield, Layers, TrendingUp, FileCode, Zap, Users, Clock, ExternalLink, ChevronDown, ChevronUp, RefreshCw, Copy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChainHealthMetricsProps {
  chain: ChainConfig;
  healthData?: ChainHealthData;
  isLoading: boolean;
  onRefresh?: () => void;
}

export interface ChainHealthData {
  finalityRate: number;
  blockProduction: number;
  avgBlockTime: number;
  validatorHealth: number;
  activeValidators: number;
  totalStaked: number;
  blockNumber?: number;
  gasPrice?: number;
  mevMetrics: {
    flashbotsBlocks: number;
    sandwichAttacks: number;
    mevRevenue24h: number;
  };
  layer2Analytics: {
    arbitrumBridged: number;
    optimismBridged: number;
    baseBridged: number;
  };
  eip1559: {
    burnRate: number;
    supplyChange: number;
    baseFee: number;
  };
  stakingMetrics: {
    stakingAPR: number;
    lidoYield: number;
    rocketPoolYield: number;
    cbETHYield: number;
  };
  contractActivity: {
    verified: number;
    unverified: number;
    total: number;
  };
  timestamp?: number;
}

export function ChainHealthMetrics({ chain, healthData, isLoading, onRefresh }: ChainHealthMetricsProps) {
  const [mevExpanded, setMevExpanded] = useState(false);
  const [l2Expanded, setL2Expanded] = useState(false);
  const [stakingExpanded, setStakingExpanded] = useState(false);
  const [contractsExpanded, setContractsExpanded] = useState(false);

  const formatNumber = (n: number, decimals = 2) => {
    if (n >= 1e9) return (n / 1e9).toFixed(decimals) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(decimals) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(decimals) + "K";
    return n.toFixed(decimals);
  };

  const getHealthColor = (value: number) => {
    if (value >= 95) return "text-success";
    if (value >= 80) return "text-warning";
    return "text-danger";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading || !healthData) {
    return (
      <div className="holo-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="holo-card p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0 w-fit">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base sm:text-lg text-foreground">Chain Health Monitor</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Real-time network vitals from Alchemy</p>
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <a
            href={chain.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
            title="View on Explorer"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success">Live</span>
          </div>
        </div>
      </div>

      {/* Real-time Block Info */}
      {healthData.blockNumber && (
        <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Block Height</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-display text-foreground">#{healthData.blockNumber.toLocaleString()}</p>
                  <button
                    onClick={() => copyToClipboard(healthData.blockNumber!.toString())}
                    className="p-1 rounded hover:bg-muted/30"
                  >
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              {healthData.gasPrice && (
                <div className="pl-4 border-l border-border/50">
                  <p className="text-xs text-muted-foreground">Gas Price</p>
                  <p className="text-lg font-display text-foreground">{healthData.gasPrice.toFixed(2)} Gwei</p>
                </div>
              )}
            </div>
            <a
              href={`${chain.explorerUrl}/block/${healthData.blockNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" /> View Block
            </a>
          </div>
        </div>
      )}

      {/* Primary Health Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Blocks className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Finality Rate</span>
          </div>
          <div className={`text-lg sm:text-2xl font-bold ${getHealthColor(healthData.finalityRate)}`}>
            {healthData.finalityRate.toFixed(1)}%
          </div>
          <Progress value={healthData.finalityRate} className="h-1 mt-1.5 sm:mt-2" />
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Block Time</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">
            {healthData.avgBlockTime.toFixed(1)}s
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {formatNumber(healthData.blockProduction)} blocks/day
          </span>
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Validator Health</span>
          </div>
          <div className={`text-lg sm:text-2xl font-bold ${getHealthColor(healthData.validatorHealth)}`}>
            {healthData.validatorHealth.toFixed(1)}%
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {formatNumber(healthData.activeValidators, 0)} active
          </span>
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Total Staked</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">
            {formatNumber(healthData.totalStaked)} {chain.symbol}
          </div>
          <span className="text-[10px] sm:text-xs text-success">
            {((healthData.totalStaked / 120e6) * 100).toFixed(1)}% supply
          </span>
        </div>
      </div>

      {/* MEV Metrics - Expandable */}
      <Collapsible open={mevExpanded} onOpenChange={setMevExpanded}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">MEV Analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">${formatNumber(healthData.mevMetrics.mevRevenue24h)} 24h</span>
              {mevExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 rounded-xl border border-border/30 bg-background/50 mb-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/10">
                <span className="text-xs text-muted-foreground block mb-1">Flashbots</span>
                <span className="text-lg font-bold text-foreground">{healthData.mevMetrics.flashbotsBlocks.toFixed(0)}%</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/10">
                <span className="text-xs text-muted-foreground block mb-1">Sandwich</span>
                <span className="text-lg font-bold text-danger">{formatNumber(healthData.mevMetrics.sandwichAttacks, 0)}</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/10">
                <span className="text-xs text-muted-foreground block mb-1">MEV 24h</span>
                <span className="text-lg font-bold text-success">${formatNumber(healthData.mevMetrics.mevRevenue24h)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://explore.flashbots.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> Flashbots Explorer
              </a>
              <a
                href="https://eigenphi.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> EigenPhi
              </a>
              <a
                href="https://www.mevboost.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> MEV Boost
              </a>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Layer 2 Analytics - Expandable */}
      <Collapsible open={l2Expanded} onOpenChange={setL2Expanded}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors mb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Layer 2 Bridged Assets</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                ${formatNumber(healthData.layer2Analytics.arbitrumBridged + healthData.layer2Analytics.optimismBridged + healthData.layer2Analytics.baseBridged)} total
              </span>
              {l2Expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 rounded-xl border border-border/30 bg-background/50 mb-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <a
                href="https://arbiscan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-3 rounded-lg bg-[#28a0f0]/10 border border-[#28a0f0]/30 hover:border-[#28a0f0]/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground block mb-1">Arbitrum</span>
                <span className="text-lg font-bold text-foreground">${formatNumber(healthData.layer2Analytics.arbitrumBridged)}</span>
                <ExternalLink className="h-3 w-3 mx-auto mt-1 text-muted-foreground" />
              </a>
              <a
                href="https://optimistic.etherscan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-3 rounded-lg bg-[#ff0420]/10 border border-[#ff0420]/30 hover:border-[#ff0420]/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground block mb-1">Optimism</span>
                <span className="text-lg font-bold text-foreground">${formatNumber(healthData.layer2Analytics.optimismBridged)}</span>
                <ExternalLink className="h-3 w-3 mx-auto mt-1 text-muted-foreground" />
              </a>
              <a
                href="https://basescan.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-3 rounded-lg bg-[#0052ff]/10 border border-[#0052ff]/30 hover:border-[#0052ff]/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground block mb-1">Base</span>
                <span className="text-lg font-bold text-foreground">${formatNumber(healthData.layer2Analytics.baseBridged)}</span>
                <ExternalLink className="h-3 w-3 mx-auto mt-1 text-muted-foreground" />
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://l2beat.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> L2Beat
              </a>
              <a
                href="https://defillama.com/chains"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> DeFi Llama
              </a>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* EIP-1559 & Staking - Expandable */}
      <div className="grid md:grid-cols-2 gap-4">
        <Collapsible open={stakingExpanded} onOpenChange={setStakingExpanded}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-foreground">EIP-1559 Burn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-medium",
                  healthData.eip1559.supplyChange < 0 ? "text-success" : "text-danger"
                )}>
                  {healthData.eip1559.supplyChange > 0 ? "+" : ""}{healthData.eip1559.supplyChange.toFixed(2)}%
                </span>
                {stakingExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-4 rounded-xl border border-border/30 bg-background/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ETH Burned/Day</span>
                  <span className="text-lg font-bold text-orange-400">{formatNumber(healthData.eip1559.burnRate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Supply Change</span>
                  <span className={`text-lg font-bold ${healthData.eip1559.supplyChange < 0 ? "text-success" : "text-danger"}`}>
                    {healthData.eip1559.supplyChange > 0 ? "+" : ""}{healthData.eip1559.supplyChange.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base Fee</span>
                  <span className="text-lg font-bold text-foreground">{healthData.eip1559.baseFee.toFixed(1)} Gwei</span>
                </div>
              </div>
              <a
                href="https://ultrasound.money/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" /> Ultrasound Money
              </a>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/10 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-foreground">Staking Yields</span>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Native Staking</span>
              <Badge variant="outline" className="text-success border-success/30">
                {healthData.stakingMetrics.stakingAPR.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <a href="https://lido.fi/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                Lido (stETH) <ExternalLink className="h-3 w-3" />
              </a>
              <Badge variant="outline" className="text-primary border-primary/30">
                {healthData.stakingMetrics.lidoYield.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <a href="https://rocketpool.net/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-orange-400 flex items-center gap-1">
                Rocket Pool <ExternalLink className="h-3 w-3" />
              </a>
              <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                {healthData.stakingMetrics.rocketPoolYield.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <a href="https://www.coinbase.com/cbeth" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-secondary flex items-center gap-1">
                Coinbase (cbETH) <ExternalLink className="h-3 w-3" />
              </a>
              <Badge variant="outline" className="text-secondary border-secondary/30">
                {healthData.stakingMetrics.cbETHYield.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Activity - Expandable */}
      <Collapsible open={contractsExpanded} onOpenChange={setContractsExpanded} className="mt-4">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">Contract Deployments (24h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{healthData.contractActivity.total} total</span>
              {contractsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 p-4 rounded-xl border border-border/30 bg-background/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="text-success font-medium">{healthData.contractActivity.verified}</span>
                </div>
                <Progress value={(healthData.contractActivity.verified / healthData.contractActivity.total) * 100} className="h-2" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Unverified</span>
                  <span className="text-warning font-medium">{healthData.contractActivity.unverified}</span>
                </div>
                <Progress value={(healthData.contractActivity.unverified / healthData.contractActivity.total) * 100} className="h-2 [&>div]:bg-warning" />
              </div>
            </div>
            <a
              href={`${chain.explorerUrl}/contractsVerified`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" /> View Verified Contracts
            </a>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Timestamp */}
      {healthData.timestamp && (
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}</span>
          <span>Data source: Alchemy API</span>
        </div>
      )}
    </div>
  );
}
