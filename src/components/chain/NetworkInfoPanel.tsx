import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { ChainOverview } from "@/hooks/useChainData";
import { 
  Cpu, Layers, Hash, Shield, Zap, Globe, Network, 
  Database, FileCode, TrendingUp, Activity, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NetworkInfoPanelProps {
  chain: ChainConfig;
  overview?: ChainOverview;
  isLoading?: boolean;
}

interface MetricDetail {
  label: string;
  value: string;
  description: string;
  icon: any;
  color: string;
  details?: { label: string; value: string }[];
}

export function NetworkInfoPanel({ chain, overview, isLoading }: NetworkInfoPanelProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricDetail | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "layer1": return "text-primary border-primary/30 bg-primary/10";
      case "layer2": return "text-success border-success/30 bg-success/10";
      case "sidechain": return "text-warning border-warning/30 bg-warning/10";
      default: return "text-muted-foreground border-border bg-muted/10";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "layer1": return "Layer 1";
      case "layer2": return "Layer 2";
      case "sidechain": return "Sidechain";
      default: return category;
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "N/A";
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return (num ?? 0).toLocaleString();
  };

  // Documented specs (chainConfig) + live native-asset market data. Node-only
  // metrics (gas, block height, validators, mempool) are intentionally absent —
  // no feed for them exists in this build.
  const networkMetrics: MetricDetail[] = [
    { 
      label: "Throughput (spec)", 
      value: chain.tps ? `${chain.tps.toLocaleString()} TPS` : "—", 
      description: "Documented transactions-per-second specification (not a live measurement)",
      icon: Zap,
      color: "primary",
      details: [
        { label: "Spec TPS", value: chain.tps ? chain.tps.toLocaleString() : "—" },
        { label: "Avg Block Time", value: chain.category === "layer1" ? "~12s" : "~2s" },
        { label: "Finality", value: chain.category === "layer1" ? "~15 min" : "~2 min" },
        { label: "Live node feed", value: "Not available" },
      ]
    },
    { 
      label: "Consensus", 
      value: chain.consensus || "—", 
      description: "The mechanism used to validate transactions and secure the network",
      icon: Shield,
      color: "success",
      details: [
        { label: "Type", value: chain.consensus || "—" },
        { label: "Security Model", value: chain.category === "layer1" ? "Native" : "Inherited from settlement layer" },
        { label: "Stake Required", value: chain.id === "ethereum" ? "32 ETH" : "Varies by chain" },
      ]
    },
    {
      label: "Market Cap",
      value: overview?.marketCap ? `$${formatNumber(overview.marketCap)}` : "—",
      description: "Live market cap of the chain's native asset (CoinGecko)",
      icon: TrendingUp,
      color: "secondary",
      details: [
        { label: "Native asset", value: chain.symbol },
        { label: "Source", value: "CoinGecko (live)" },
        { label: "24h change", value: overview ? `${overview.priceChange24h >= 0 ? "+" : ""}${overview.priceChange24h.toFixed(2)}%` : "—" },
      ]
    },
    {
      label: "24h DEX Volume",
      value: overview?.volume24h ? `$${formatNumber(overview.volume24h)}` : "—",
      description: "24h volume across the chain's busiest DEX pairs (DexScreener)",
      icon: Activity,
      color: "warning",
      details: [
        { label: "Scope", value: "Top DEX pairs" },
        { label: "Source", value: "DexScreener (live)" },
        { label: "Includes", value: "Buys + sells, both swap sides" },
      ]
    },
    { 
      label: "Native Decimals", 
      value: chain.nativeDecimals?.toString() || "—", 
      description: "Decimal precision of the native token",
      icon: Hash,
      color: "muted",
      details: [
        { label: "Decimals", value: chain.nativeDecimals?.toString() || "—" },
        { label: "Symbol", value: chain.symbol },
        { label: "Wrapped form", value: `W${chain.symbol}` },
      ]
    },
    { 
      label: "Network Type", 
      value: getCategoryLabel(chain.category), 
      description: "Classification of the blockchain architecture",
      icon: Layers,
      color: chain.category === "layer1" ? "primary" : chain.category === "layer2" ? "success" : "warning",
      details: [
        { label: "Type", value: getCategoryLabel(chain.category) },
        { label: "EVM Compatible", value: chain.id === "solana" || chain.id === "sui" || chain.id === "ton" ? "No" : "Yes" },
        { label: "Smart Contracts", value: "Yes" },
      ]
    },
  ];

  const liveStats = [
    { 
      label: "Market Cap", 
      value: overview?.marketCap ? `$${formatNumber(overview.marketCap)}` : "—",
      icon: TrendingUp,
    },
    { 
      label: "24h DEX Volume", 
      value: overview?.volume24h ? `$${formatNumber(overview.volume24h)}` : "—",
      icon: Activity,
    },
    { 
      label: "24h Change", 
      value: overview ? `${overview.priceChange24h >= 0 ? "+" : ""}${overview.priceChange24h.toFixed(2)}%` : "—",
      icon: Activity,
    },
  ];

  return (
    <>
      <div className="holo-card p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{
                background: `linear-gradient(135deg, hsl(${chain.color} / 0.4), hsl(${chain.color} / 0.1))`,
                boxShadow: `0 0 30px hsl(${chain.color} / 0.4)`,
              }}
            >
              {chain.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display text-foreground glow-text">{chain.name}</h3>
                <Badge variant="outline" className={getCategoryColor(chain.category)}>
                  {getCategoryLabel(chain.category)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Network className="h-3 w-3" />
                <span>Network Architecture & Specifications</span>
              </p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/20 text-muted-foreground text-xs">
              <Network className="h-3 w-3" />
              <span>Specs + live market data</span>
            </div>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          {liveStats.map((stat) => (
            <div 
              key={stat.label}
              className="p-3 border border-border/30 hover:bg-muted/20 transition-all"
            >
              <stat.icon className="h-4 w-4 text-primary mb-1" />
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-display text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Network Metrics Grid - Clickable */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Network Specifications
            <span className="text-[10px] text-muted-foreground">(Click for details)</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {networkMetrics.map((metric) => (
              <button
                key={metric.label}
                onClick={() => setSelectedMetric(metric)}
                className={cn(
                  "p-3 rounded-lg border border-border/30 text-left transition-all group",
                  "bg-muted/10 hover:bg-muted/30 hover:border-primary/30",
                  "hover:shadow-lg hover:shadow-primary/10"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <metric.icon className={cn(
                    "h-4 w-4",
                    metric.color === "primary" && "text-primary",
                    metric.color === "success" && "text-success",
                    metric.color === "warning" && "text-warning",
                    metric.color === "secondary" && "text-secondary",
                    metric.color === "muted" && "text-muted-foreground"
                  )} />
                  <span className="text-[10px] text-muted-foreground truncate">{metric.label}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-display text-foreground">{metric.value}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
          {chain.website && (
            <a href={chain.website} target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs">
              <Globe className="h-3 w-3" /> Website
            </a>
          )}
          {chain.docs && (
            <a href={chain.docs} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs">
              <FileCode className="h-3 w-3" /> Docs
            </a>
          )}
          {chain.github && (
            <a href={chain.github} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs">
              <Database className="h-3 w-3" /> GitHub
            </a>
          )}
          <a href={chain.explorerUrl} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-xs">
            <ExternalLink className="h-3 w-3" /> Explorer
          </a>
        </div>
      </div>

    </>
  );
}
