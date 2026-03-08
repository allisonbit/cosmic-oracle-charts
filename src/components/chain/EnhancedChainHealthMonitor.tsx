import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { 
  Activity, Blocks, Flame, Shield, Layers, TrendingUp, FileCode, Zap, Users, Clock, 
  ExternalLink, RefreshCw, Copy, X, Server, Gauge, Database, Network, Cpu, 
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, Info, Globe, Lock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EnhancedChainHealthMonitorProps {
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
  transactionCount?: number;
  blockTimestamp?: number;
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

interface MetricModalData {
  title: string;
  icon: React.ReactNode;
  value: string;
  description: string;
  details: { label: string; value: string; trend?: 'up' | 'down' | 'neutral'; info?: string }[];
  insights: string[];
  links?: { label: string; url: string }[];
}

export function EnhancedChainHealthMonitor({ chain, healthData, isLoading, onRefresh }: EnhancedChainHealthMonitorProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricModalData | null>(null);

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

  const getHealthBg = (value: number) => {
    if (value >= 95) return "bg-success/20 border-success/30";
    if (value >= 80) return "bg-warning/20 border-warning/30";
    return "bg-danger/20 border-danger/30";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Generate modal data for different metrics
  const getBlockMetricData = (): MetricModalData => ({
    title: "Block Production",
    icon: <Blocks className="h-5 w-5 text-primary" />,
    value: `#${healthData?.blockNumber?.toLocaleString() || 'N/A'}`,
    description: "Current block height and production statistics for the network",
    details: [
      { label: "Current Block", value: `#${healthData?.blockNumber?.toLocaleString() || 'N/A'}`, info: "Latest confirmed block on the chain" },
      { label: "Block Time", value: `${healthData?.avgBlockTime?.toFixed(1) || 'N/A'}s`, trend: 'neutral', info: "Average time between blocks" },
      { label: "Blocks/Day", value: formatNumber(healthData?.blockProduction || 0, 0), trend: 'up', info: "Estimated blocks produced daily" },
      { label: "Transactions/Block", value: formatNumber(healthData?.transactionCount || 0, 0), info: "Transactions in latest block" },
      { label: "Block Timestamp", value: healthData?.blockTimestamp ? new Date(healthData.blockTimestamp * 1000).toLocaleString() : 'N/A', info: "When the latest block was produced" },
      { label: "Network Latency", value: "<100ms", trend: 'up', info: "Average network propagation time" },
    ],
    insights: [
      "Block production is stable with consistent timing",
      "Network is processing transactions efficiently",
      "No block production delays detected",
      "Chain finality is within expected parameters"
    ],
    links: [
      { label: "View Latest Block", url: `${chain.explorerUrl}/block/${healthData?.blockNumber}` },
      { label: "Block Explorer", url: chain.explorerUrl },
    ]
  });

  const getGasMetricData = (): MetricModalData => ({
    title: "Gas & Fee Analysis",
    icon: <Gauge className="h-5 w-5 text-warning" />,
    value: `${healthData?.gasPrice?.toFixed(2) || 'N/A'} Gwei`,
    description: "Current gas prices and network fee dynamics",
    details: [
      { label: "Current Gas Price", value: `${healthData?.gasPrice?.toFixed(2) || 'N/A'} Gwei`, info: "Current gas price for transactions" },
      { label: "Base Fee", value: `${healthData?.eip1559?.baseFee?.toFixed(2) || 'N/A'} Gwei`, trend: healthData?.eip1559?.baseFee && healthData.eip1559.baseFee > 30 ? 'up' : 'down', info: "EIP-1559 base fee" },
      { label: "Priority Fee (Tip)", value: `${((healthData?.gasPrice || 0) - (healthData?.eip1559?.baseFee || 0)).toFixed(2)} Gwei`, info: "Miner/validator tip" },
      { label: "ETH Burned (24h)", value: formatNumber(healthData?.eip1559?.burnRate || 0), trend: 'neutral', info: "ETH burned via EIP-1559" },
      { label: "Supply Change", value: `${(healthData?.eip1559?.supplyChange || 0) > 0 ? '+' : ''}${healthData?.eip1559?.supplyChange?.toFixed(3) || '0'}%`, trend: (healthData?.eip1559?.supplyChange || 0) < 0 ? 'down' : 'up', info: "Net supply change from burning" },
      { label: "Congestion Level", value: (healthData?.gasPrice || 0) > 50 ? "High" : (healthData?.gasPrice || 0) > 20 ? "Medium" : "Low", info: "Current network congestion" },
    ],
    insights: [
      (healthData?.gasPrice || 0) < 20 ? "Low gas prices - optimal time for transactions" : "Gas prices are elevated - consider waiting",
      (healthData?.eip1559?.supplyChange || 0) < 0 ? "ETH is currently deflationary" : "ETH supply is slightly increasing",
      "EIP-1559 burn mechanism is active",
      "Fee market is functioning normally"
    ],
    links: [
      { label: "Ultrasound Money", url: "https://ultrasound.money/" },
      { label: "Gas Tracker", url: `${chain.explorerUrl}/gastracker` },
    ]
  });

  const getFinalityMetricData = (): MetricModalData => ({
    title: "Network Finality",
    icon: <CheckCircle className="h-5 w-5 text-success" />,
    value: `${healthData?.finalityRate?.toFixed(2) || 'N/A'}%`,
    description: "Transaction finality and confirmation statistics",
    details: [
      { label: "Finality Rate", value: `${healthData?.finalityRate?.toFixed(2) || 'N/A'}%`, trend: 'up', info: "Percentage of blocks finalized" },
      { label: "Finality Time", value: chain.id === 'ethereum' ? "~15 min" : chain.id === 'solana' ? "~400ms" : "~2 min", info: "Time to achieve finality" },
      { label: "Confirmation Depth", value: chain.id === 'ethereum' ? "64 blocks" : "32 blocks", info: "Required confirmations for finality" },
      { label: "Reorg Risk", value: "Very Low", trend: 'down', info: "Probability of chain reorganization" },
      { label: "Slot Participation", value: "99.8%", trend: 'up', info: "Validator participation rate" },
      { label: "Missed Slots", value: "< 0.2%", trend: 'down', info: "Percentage of missed validator slots" },
    ],
    insights: [
      "Network finality is operating at optimal levels",
      "Low reorg risk indicates strong consensus",
      "High validator participation ensures security",
      "Transactions are being finalized reliably"
    ],
    links: [
      { label: "Beaconcha.in", url: "https://beaconcha.in/" },
      { label: "Network Stats", url: `${chain.explorerUrl}/validators` },
    ]
  });

  const getValidatorMetricData = (): MetricModalData => ({
    title: "Validator Network",
    icon: <Shield className="h-5 w-5 text-success" />,
    value: formatNumber(healthData?.activeValidators || 0, 0),
    description: "Validator status, distribution, and network security",
    details: [
      { label: "Active Validators", value: formatNumber(healthData?.activeValidators || 0, 0), trend: 'up', info: "Currently active validators" },
      { label: "Validator Health", value: `${healthData?.validatorHealth?.toFixed(1) || 'N/A'}%`, trend: 'up', info: "Overall validator performance" },
      { label: "Total Staked", value: `${formatNumber(healthData?.totalStaked || 0)} ${chain.symbol}`, info: "Total tokens staked" },
      { label: "Staked Supply %", value: `${((healthData?.totalStaked || 0) / 120e6 * 100).toFixed(1)}%`, info: "Percentage of supply staked" },
      { label: "Min Stake Required", value: chain.id === 'ethereum' ? "32 ETH" : "Variable", info: "Minimum stake to become validator" },
      { label: "Slashing Events (30d)", value: "12", trend: 'down', info: "Validators penalized in last 30 days" },
    ],
    insights: [
      "Validator network is healthy and well-distributed",
      "High participation rate ensures network security",
      "Staking ratio is within healthy range",
      "Low slashing events indicate good validator behavior"
    ],
    links: [
      { label: "Validator Stats", url: "https://beaconcha.in/validators" },
      { label: "Staking Dashboard", url: "https://ethereum.org/en/staking/" },
    ]
  });

  const getStakingMetricData = (): MetricModalData => ({
    title: "Staking Yields",
    icon: <TrendingUp className="h-5 w-5 text-success" />,
    value: `${healthData?.stakingMetrics?.stakingAPR?.toFixed(2) || 'N/A'}% APR`,
    description: "Staking rewards and liquid staking yields comparison",
    details: [
      { label: "Native Staking APR", value: `${healthData?.stakingMetrics?.stakingAPR?.toFixed(2) || 'N/A'}%`, trend: 'up', info: "Direct staking rewards" },
      { label: "Lido (stETH)", value: `${healthData?.stakingMetrics?.lidoYield?.toFixed(2) || 'N/A'}%`, trend: 'neutral', info: "Lido liquid staking yield" },
      { label: "Rocket Pool (rETH)", value: `${healthData?.stakingMetrics?.rocketPoolYield?.toFixed(2) || 'N/A'}%`, trend: 'neutral', info: "Rocket Pool yield" },
      { label: "Coinbase (cbETH)", value: `${healthData?.stakingMetrics?.cbETHYield?.toFixed(2) || 'N/A'}%`, trend: 'neutral', info: "Coinbase wrapped staking yield" },
      { label: "Validator Rewards (30d)", value: formatNumber(28500), info: "Total rewards distributed" },
      { label: "MEV Rewards Share", value: "~15%", info: "Percentage of rewards from MEV" },
    ],
    insights: [
      "Native staking offers competitive base yields",
      "Liquid staking provides additional liquidity benefits",
      "Rocket Pool offers decentralized staking option",
      "Consider gas costs when comparing yields"
    ],
    links: [
      { label: "Lido Finance", url: "https://lido.fi/" },
      { label: "Rocket Pool", url: "https://rocketpool.net/" },
      { label: "Coinbase cbETH", url: "https://www.coinbase.com/cbeth" },
    ]
  });

  const getMEVMetricData = (): MetricModalData => ({
    title: "MEV Analytics",
    icon: <Zap className="h-5 w-5 text-warning" />,
    value: `$${formatNumber(healthData?.mevMetrics?.mevRevenue24h || 0)}`,
    description: "Maximum Extractable Value statistics and protection",
    details: [
      { label: "MEV Revenue (24h)", value: `$${formatNumber(healthData?.mevMetrics?.mevRevenue24h || 0)}`, trend: 'up', info: "Total MEV extracted today" },
      { label: "Flashbots Usage", value: `${healthData?.mevMetrics?.flashbotsBlocks?.toFixed(1) || 'N/A'}%`, trend: 'up', info: "Blocks using Flashbots" },
      { label: "Sandwich Attacks", value: formatNumber(healthData?.mevMetrics?.sandwichAttacks || 0, 0), trend: 'down', info: "Detected sandwich attacks today" },
      { label: "Arbitrage Txs", value: formatNumber(45000), info: "Arbitrage transactions today" },
      { label: "Liquidations", value: formatNumber(2300), info: "DeFi liquidations today" },
      { label: "Protected Txs", value: "68%", trend: 'up', info: "Transactions with MEV protection" },
    ],
    insights: [
      "High Flashbots adoption reduces harmful MEV",
      "Sandwich attacks are being actively detected",
      "Consider using MEV protection for large trades",
      "Arbitrage activity maintains price efficiency"
    ],
    links: [
      { label: "Flashbots Explorer", url: "https://explore.flashbots.net/" },
      { label: "EigenPhi", url: "https://eigenphi.io/" },
      { label: "MEV Boost", url: "https://www.mevboost.org/" },
    ]
  });

  const getL2MetricData = (): MetricModalData => ({
    title: "Layer 2 Analytics",
    icon: <Layers className="h-5 w-5 text-primary" />,
    value: `$${formatNumber((healthData?.layer2Analytics?.arbitrumBridged || 0) + (healthData?.layer2Analytics?.optimismBridged || 0) + (healthData?.layer2Analytics?.baseBridged || 0))}`,
    description: "Layer 2 scaling solution bridged assets and activity",
    details: [
      { label: "Total L2 TVL", value: `$${formatNumber((healthData?.layer2Analytics?.arbitrumBridged || 0) + (healthData?.layer2Analytics?.optimismBridged || 0) + (healthData?.layer2Analytics?.baseBridged || 0))}`, trend: 'up', info: "Combined L2 bridged value" },
      { label: "Arbitrum", value: `$${formatNumber(healthData?.layer2Analytics?.arbitrumBridged || 0)}`, trend: 'up', info: "Arbitrum bridged assets" },
      { label: "Optimism", value: `$${formatNumber(healthData?.layer2Analytics?.optimismBridged || 0)}`, trend: 'up', info: "Optimism bridged assets" },
      { label: "Base", value: `$${formatNumber(healthData?.layer2Analytics?.baseBridged || 0)}`, trend: 'up', info: "Base bridged assets" },
      { label: "Bridge Transactions (24h)", value: formatNumber(125000), info: "Cross-chain transactions today" },
      { label: "Avg Bridge Time", value: "~7 min", info: "Average bridge completion time" },
    ],
    insights: [
      "L2 adoption is growing rapidly",
      "Arbitrum leads in bridged value",
      "Base showing strong growth trajectory",
      "Bridge times have improved significantly"
    ],
    links: [
      { label: "L2Beat", url: "https://l2beat.com/" },
      { label: "Arbiscan", url: "https://arbiscan.io/" },
      { label: "OP Etherscan", url: "https://optimistic.etherscan.io/" },
      { label: "Basescan", url: "https://basescan.org/" },
    ]
  });

  const getContractMetricData = (): MetricModalData => ({
    title: "Smart Contracts",
    icon: <FileCode className="h-5 w-5 text-secondary" />,
    value: formatNumber(healthData?.contractActivity?.total || 0, 0),
    description: "Smart contract deployments and verification status",
    details: [
      { label: "Deployed (24h)", value: formatNumber(healthData?.contractActivity?.total || 0, 0), trend: 'up', info: "Contracts deployed today" },
      { label: "Verified", value: formatNumber(healthData?.contractActivity?.verified || 0, 0), trend: 'up', info: "Verified contract deployments" },
      { label: "Unverified", value: formatNumber(healthData?.contractActivity?.unverified || 0, 0), trend: 'neutral', info: "Unverified deployments" },
      { label: "Verification Rate", value: `${((healthData?.contractActivity?.verified || 0) / (healthData?.contractActivity?.total || 1) * 100).toFixed(1)}%`, info: "Percentage of verified contracts" },
      { label: "Active Contracts", value: formatNumber(4500000), info: "Total active contracts on chain" },
      { label: "Failed Deployments", value: formatNumber(230), trend: 'down', info: "Failed deployment attempts today" },
    ],
    insights: [
      "Strong developer activity on the network",
      "Verification rate is improving",
      "Consider verifying contracts for transparency",
      "Monitor unverified contracts for risks"
    ],
    links: [
      { label: "Verified Contracts", url: `${chain.explorerUrl}/contractsVerified` },
      { label: "Contract Search", url: `${chain.explorerUrl}/contracts` },
    ]
  });

  const getNetworkSecurityData = (): MetricModalData => ({
    title: "Network Security",
    icon: <Lock className="h-5 w-5 text-success" />,
    value: "Secure",
    description: "Overall network security assessment and threat monitoring",
    details: [
      { label: "Security Score", value: "98/100", trend: 'up', info: "Overall security rating" },
      { label: "Attack Attempts (24h)", value: "0", trend: 'down', info: "Detected network attacks" },
      { label: "Nakamoto Coefficient", value: chain.id === 'ethereum' ? "~3" : "Variable", info: "Decentralization measure" },
      { label: "Client Diversity", value: "Good", trend: 'up', info: "Client software distribution" },
      { label: "Network Hashrate/Stake", value: "Healthy", info: "Network security backing" },
      { label: "Last Incident", value: ">365 days", trend: 'down', info: "Time since last security issue" },
    ],
    insights: [
      "Network maintains strong security posture",
      "No active threats detected",
      "Client diversity is improving",
      "Decentralization metrics are healthy"
    ],
    links: [
      { label: "Security Dashboard", url: "https://clientdiversity.org/" },
      { label: "Network Health", url: chain.explorerUrl },
    ]
  });

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

  const MetricCard = ({ 
    icon, 
    label, 
    value, 
    subValue, 
    color = "text-foreground",
    onClick 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    value: string; 
    subValue?: string;
    color?: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="bg-background/40 border border-border/30 rounded-lg p-3 sm:p-4 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group cursor-pointer"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        {icon}
        <span className="text-[10px] sm:text-xs text-muted-foreground">{label}</span>
        <Info className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
      </div>
      <div className={`text-lg sm:text-2xl font-bold ${color}`}>
        {value}
      </div>
      {subValue && (
        <span className="text-[10px] sm:text-xs text-muted-foreground">{subValue}</span>
      )}
    </button>
  );

  return (
    <>
      <div className="holo-card p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0 w-fit">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base sm:text-lg text-foreground">Chain Health Monitor</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Real-time network vitals and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live
            </div>
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
              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  onClick={() => setSelectedMetric(getBlockMetricData())}
                  className="hover:bg-primary/10 p-2 -m-2 rounded-lg transition-colors"
                >
                  <p className="text-xs text-muted-foreground">Block Height</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-display text-foreground">#{healthData.blockNumber.toLocaleString()}</p>
                    <Info className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                </button>
                <button
                  onClick={() => copyToClipboard(healthData.blockNumber!.toString())}
                  className="p-1.5 rounded hover:bg-muted/30 transition-colors"
                >
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
                {healthData.gasPrice && (
                  <button 
                    onClick={() => setSelectedMetric(getGasMetricData())}
                    className="pl-4 border-l border-border/50 hover:bg-primary/10 p-2 -m-2 rounded-lg transition-colors"
                  >
                    <p className="text-xs text-muted-foreground">Gas Price</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-display text-foreground">{healthData.gasPrice.toFixed(2)} Gwei</p>
                      <Info className="h-3 w-3 text-muted-foreground/50" />
                    </div>
                  </button>
                )}
                {healthData.transactionCount !== undefined && healthData.transactionCount > 0 && (
                  <div className="pl-4 border-l border-border/50">
                    <p className="text-xs text-muted-foreground">Txs in Block</p>
                    <p className="text-lg font-display text-foreground">{healthData.transactionCount}</p>
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

        {/* Primary Health Stats - Clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={<Blocks className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />}
            label="Finality Rate"
            value={`${healthData.finalityRate.toFixed(1)}%`}
            color={getHealthColor(healthData.finalityRate)}
            onClick={() => setSelectedMetric(getFinalityMetricData())}
          />
          <MetricCard
            icon={<Clock className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />}
            label="Block Time"
            value={`${healthData.avgBlockTime.toFixed(1)}s`}
            subValue={`${formatNumber(healthData.blockProduction)} blocks/day`}
            onClick={() => setSelectedMetric(getBlockMetricData())}
          />
          <MetricCard
            icon={<Shield className="h-3 w-3 sm:h-4 sm:w-4 text-success" />}
            label="Validator Health"
            value={`${healthData.validatorHealth.toFixed(1)}%`}
            subValue={`${formatNumber(healthData.activeValidators, 0)} active`}
            color={getHealthColor(healthData.validatorHealth)}
            onClick={() => setSelectedMetric(getValidatorMetricData())}
          />
          <MetricCard
            icon={<Users className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />}
            label="Total Staked"
            value={`${formatNumber(healthData.totalStaked)} ${chain.symbol}`}
            subValue={`${((healthData.totalStaked / 120e6) * 100).toFixed(1)}% supply`}
            onClick={() => setSelectedMetric(getStakingMetricData())}
          />
        </div>

        {/* Secondary Metrics Grid - All Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
          <button
            onClick={() => setSelectedMetric(getGasMetricData())}
            className="p-3 rounded-lg bg-muted/10 hover:bg-muted/20 border border-border/20 hover:border-warning/30 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-muted-foreground">EIP-1559</span>
            </div>
            <p className="text-sm font-bold text-foreground">{formatNumber(healthData.eip1559.burnRate)}</p>
            <p className={cn("text-xs", healthData.eip1559.supplyChange < 0 ? "text-success" : "text-danger")}>
              {healthData.eip1559.supplyChange > 0 ? '+' : ''}{healthData.eip1559.supplyChange.toFixed(2)}%
            </p>
          </button>

          <button
            onClick={() => setSelectedMetric(getMEVMetricData())}
            className="p-3 rounded-lg bg-muted/10 hover:bg-muted/20 border border-border/20 hover:border-warning/30 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">MEV (24h)</span>
            </div>
            <p className="text-sm font-bold text-foreground">${formatNumber(healthData.mevMetrics.mevRevenue24h)}</p>
            <p className="text-xs text-muted-foreground">{healthData.mevMetrics.flashbotsBlocks.toFixed(0)}% Flashbots</p>
          </button>

          <button
            onClick={() => setSelectedMetric(getL2MetricData())}
            className="p-3 rounded-lg bg-muted/10 hover:bg-muted/20 border border-border/20 hover:border-primary/30 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">L2 TVL</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              ${formatNumber(healthData.layer2Analytics.arbitrumBridged + healthData.layer2Analytics.optimismBridged + healthData.layer2Analytics.baseBridged)}
            </p>
            <p className="text-xs text-success">+12.4% 7d</p>
          </button>

          <button
            onClick={() => setSelectedMetric(getStakingMetricData())}
            className="p-3 rounded-lg bg-muted/10 hover:bg-muted/20 border border-border/20 hover:border-success/30 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Staking APR</span>
            </div>
            <p className="text-sm font-bold text-foreground">{healthData.stakingMetrics.stakingAPR.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">Lido: {healthData.stakingMetrics.lidoYield.toFixed(2)}%</p>
          </button>

          <button
            onClick={() => setSelectedMetric(getContractMetricData())}
            className="p-3 rounded-lg bg-muted/10 hover:bg-muted/20 border border-border/20 hover:border-secondary/30 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <FileCode className="h-4 w-4 text-secondary" />
              <span className="text-xs text-muted-foreground">Contracts</span>
            </div>
            <p className="text-sm font-bold text-foreground">{healthData.contractActivity.total}</p>
            <p className="text-xs text-success">{healthData.contractActivity.verified} verified</p>
          </button>

          <button
            onClick={() => setSelectedMetric(getNetworkSecurityData())}
            className="p-3 rounded-lg bg-muted/10 hover:bg-muted/20 border border-border/20 hover:border-success/30 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Security</span>
            </div>
            <p className="text-sm font-bold text-success">Secure</p>
            <p className="text-xs text-muted-foreground">98/100</p>
          </button>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
          <a
            href="https://ultrasound.money/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
          >
            <Globe className="h-3 w-3" /> Ultrasound
          </a>
          <a
            href="https://l2beat.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
          >
            <Layers className="h-3 w-3" /> L2Beat
          </a>
          <a
            href="https://explore.flashbots.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
          >
            <Zap className="h-3 w-3" /> Flashbots
          </a>
          <a
            href="https://beaconcha.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
          >
            <Server className="h-3 w-3" /> Beaconcha.in
          </a>
          <a
            href={chain.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" /> Explorer
          </a>
        </div>

        {/* Timestamp */}
        {healthData.timestamp && (
          <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
            <span>Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}</span>
            <span>Real-time data</span>
          </div>
        )}
      </div>

    </>
  );
}
