import { ChainConfig } from "@/lib/chainConfig";
import { Activity, Blocks, Flame, Shield, Layers, TrendingUp, FileCode, Zap, Users, Clock, ArrowUpDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ChainHealthMetricsProps {
  chain: ChainConfig;
  healthData?: ChainHealthData;
  isLoading: boolean;
}

export interface ChainHealthData {
  finalityRate: number;
  blockProduction: number;
  avgBlockTime: number;
  validatorHealth: number;
  activeValidators: number;
  totalStaked: number;
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
}

export function ChainHealthMetrics({ chain, healthData, isLoading }: ChainHealthMetricsProps) {
  const formatNumber = (n: number, decimals = 2) => {
    if (n >= 1e9) return (n / 1e9).toFixed(decimals) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(decimals) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(decimals) + "K";
    return n.toFixed(decimals);
  };

  const getHealthColor = (value: number) => {
    if (value >= 95) return "text-green-400";
    if (value >= 80) return "text-yellow-400";
    return "text-red-400";
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0 w-fit">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base sm:text-lg text-foreground">Chain Health Monitor</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Real-time network vitals</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">Live</span>
        </div>
      </div>

      {/* Primary Health Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Blocks className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Finality Rate</span>
          </div>
          <div className={`text-lg sm:text-2xl font-bold ${getHealthColor(healthData.finalityRate)}`}>
            {healthData.finalityRate.toFixed(1)}%
          </div>
          <Progress value={healthData.finalityRate} className="h-1 mt-1.5 sm:mt-2" />
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Block Time</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">
            {healthData.avgBlockTime.toFixed(1)}s
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {formatNumber(healthData.blockProduction)} blocks/day
          </span>
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Validator Health</span>
          </div>
          <div className={`text-lg sm:text-2xl font-bold ${getHealthColor(healthData.validatorHealth)}`}>
            {healthData.validatorHealth.toFixed(1)}%
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {formatNumber(healthData.activeValidators, 0)} active
          </span>
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Total Staked</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-foreground">
            {formatNumber(healthData.totalStaked)} ETH
          </div>
          <span className="text-[10px] sm:text-xs text-green-400">
            {((healthData.totalStaked / 120e6) * 100).toFixed(1)}% supply
          </span>
        </div>
      </div>

      {/* MEV Metrics */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 flex items-center gap-2">
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
          MEV Analytics
        </h4>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-background/40 border border-border/30 rounded-lg p-2 sm:p-3">
            <span className="text-[10px] sm:text-xs text-muted-foreground block">Flashbots</span>
            <span className="text-sm sm:text-lg font-bold text-foreground">{healthData.mevMetrics.flashbotsBlocks}%</span>
          </div>
          <div className="bg-background/40 border border-border/30 rounded-lg p-2 sm:p-3">
            <span className="text-[10px] sm:text-xs text-muted-foreground block">Sandwich</span>
            <span className="text-sm sm:text-lg font-bold text-red-400">{formatNumber(healthData.mevMetrics.sandwichAttacks, 0)}</span>
          </div>
          <div className="bg-background/40 border border-border/30 rounded-lg p-2 sm:p-3">
            <span className="text-[10px] sm:text-xs text-muted-foreground block">MEV 24h</span>
            <span className="text-sm sm:text-lg font-bold text-green-400">${formatNumber(healthData.mevMetrics.mevRevenue24h)}</span>
          </div>
        </div>
      </div>

      {/* Layer 2 Analytics */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 flex items-center gap-2">
          <Layers className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
          Layer 2 Bridged Assets
        </h4>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-lg p-2 sm:p-3">
            <span className="text-[10px] sm:text-xs text-muted-foreground block">Arbitrum</span>
            <span className="text-sm sm:text-lg font-bold text-foreground">${formatNumber(healthData.layer2Analytics.arbitrumBridged)}</span>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 rounded-lg p-2 sm:p-3">
            <span className="text-[10px] sm:text-xs text-muted-foreground block">Optimism</span>
            <span className="text-sm sm:text-lg font-bold text-foreground">${formatNumber(healthData.layer2Analytics.optimismBridged)}</span>
          </div>
          <div className="bg-gradient-to-br from-blue-400/10 to-transparent border border-blue-400/30 rounded-lg p-2 sm:p-3">
            <span className="text-[10px] sm:text-xs text-muted-foreground block">Base</span>
            <span className="text-sm sm:text-lg font-bold text-foreground">${formatNumber(healthData.layer2Analytics.baseBridged)}</span>
          </div>
        </div>
      </div>

      {/* EIP-1559 & Staking */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            EIP-1559 Burn Rate
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">ETH Burned/Day</span>
              <span className="text-lg font-bold text-orange-400">{formatNumber(healthData.eip1559.burnRate)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Supply Change</span>
              <span className={`text-lg font-bold ${healthData.eip1559.supplyChange < 0 ? "text-green-400" : "text-red-400"}`}>
                {healthData.eip1559.supplyChange > 0 ? "+" : ""}{healthData.eip1559.supplyChange.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Base Fee</span>
              <span className="text-lg font-bold text-foreground">{healthData.eip1559.baseFee.toFixed(1)} Gwei</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            Staking Yields
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Native Staking</span>
              <Badge variant="outline" className="text-green-400 border-green-400/30">
                {healthData.stakingMetrics.stakingAPR.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lido (stETH)</span>
              <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                {healthData.stakingMetrics.lidoYield.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rocket Pool</span>
              <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                {healthData.stakingMetrics.rocketPoolYield.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coinbase (cbETH)</span>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                {healthData.stakingMetrics.cbETHYield.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Activity */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <FileCode className="h-4 w-4 text-purple-400" />
          Contract Deployments (24h)
        </h4>
        <div className="bg-background/40 border border-border/30 rounded-lg p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Verified</span>
                <span className="text-green-400 font-medium">{healthData.contractActivity.verified}</span>
              </div>
              <Progress value={(healthData.contractActivity.verified / healthData.contractActivity.total) * 100} className="h-2" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Unverified</span>
                <span className="text-yellow-400 font-medium">{healthData.contractActivity.unverified}</span>
              </div>
              <Progress value={(healthData.contractActivity.unverified / healthData.contractActivity.total) * 100} className="h-2 [&>div]:bg-yellow-400" />
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Total: <span className="text-foreground font-medium">{healthData.contractActivity.total}</span> new contracts
          </div>
        </div>
      </div>
    </div>
  );
}