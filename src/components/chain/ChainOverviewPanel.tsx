import { ChainConfig } from "@/lib/chainConfig";
import { ChainOverview } from "@/hooks/useChainData";
import { TrendingUp, TrendingDown, Activity, Zap, Users, DollarSign, BarChart3, Wifi, WifiOff, ExternalLink, Copy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimePrices } from "@/hooks/useRealtimePrices";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ChainOverviewPanelProps {
  chain: ChainConfig;
  overview: ChainOverview | undefined;
  isLoading: boolean;
}

export function ChainOverviewPanel({ chain, overview, isLoading }: ChainOverviewPanelProps) {
  const { prices, isConnected } = useRealtimePrices([chain.symbol]);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Detect price changes for flash effect
  useEffect(() => {
    const currentPrice = prices[chain.symbol]?.price;
    if (currentPrice && lastPrice && currentPrice !== lastPrice) {
      setPriceFlash(currentPrice > lastPrice ? "up" : "down");
      setTimeout(() => setPriceFlash(null), 500);
      setLastUpdated(new Date());
    }
    if (currentPrice) {
      setLastPrice(currentPrice);
    }
  }, [prices, chain.symbol, lastPrice]);

  const realtimePrice = prices[chain.symbol];
  const displayChange = realtimePrice?.change24h ?? overview?.priceChange24h ?? 0;

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  const formatSimple = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(0);
  };

  const copyAddress = () => {
    // Copy chain explorer URL
    navigator.clipboard.writeText(chain.explorerUrl);
    toast.success("Explorer URL copied!");
  };

  const stats = [
    {
      label: "Market Cap",
      value: overview ? formatNumber(overview.marketCap) : "--",
      icon: DollarSign,
      color: "primary",
      tooltip: "Total market capitalization",
    },
    {
      label: "24h Volume",
      value: overview ? formatNumber(overview.volume24h) : "--",
      icon: BarChart3,
      color: "secondary",
      tooltip: "Trading volume in last 24 hours",
    },
    {
      label: "Transactions",
      value: overview ? formatSimple(overview.transactions24h) : "--",
      icon: Activity,
      color: "warning",
      tooltip: "Transactions in last 24 hours",
    },
    {
      label: "Gas Fees",
      value: overview ? `${overview.gasFees.toFixed(2)} Gwei` : "--",
      icon: Zap,
      color: "primary",
      tooltip: "Current average gas price",
    },
    {
      label: "TPS",
      value: overview ? overview.tps.toFixed(0) : "--",
      icon: TrendingUp,
      color: "success",
      tooltip: "Transactions per second",
    },
    {
      label: "Active Wallets",
      value: overview ? formatSimple(overview.activeWallets) : "--",
      icon: Users,
      color: "secondary",
      tooltip: "Active addresses in 24h",
    },
    {
      label: "DeFi TVL",
      value: overview ? formatNumber(overview.defiTvl) : "--",
      icon: DollarSign,
      color: "primary",
      tooltip: "Total value locked in DeFi",
      link: chain.defiLlamaId ? `https://defillama.com/chain/${chain.defiLlamaId}` : undefined,
    },
  ];

  return (
    <div className="holo-card p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-4xl flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, hsl(${chain.color} / 0.3), hsl(${chain.color} / 0.1))`,
              boxShadow: `0 0 40px hsl(${chain.color} / 0.4)`,
            }}
          >
            {chain.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-display text-foreground glow-text">{chain.name}</h2>
              {/* Realtime indicator */}
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs flex-shrink-0",
                isConnected ? "bg-success/20 text-success" : "bg-muted/30 text-muted-foreground"
              )}>
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2">
              <span>Chain Analytics Dashboard</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-xs">{chain.symbol}</span>
            </p>
            {/* Last updated */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-0.5">
              <Clock className="h-2.5 w-2.5" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live price */}
            {realtimePrice && (
              <div className={cn(
                "text-xl sm:text-2xl font-display transition-all duration-300",
                priceFlash === "up" && "text-success scale-105",
                priceFlash === "down" && "text-danger scale-105",
                !priceFlash && "text-foreground"
              )}>
                ${realtimePrice.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            )}
            
            {/* Price change badge */}
            <div className={cn(
              "flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all",
              displayChange >= 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
            )}>
              {displayChange >= 0 ? <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />}
              <span className="font-medium text-sm sm:text-base">{displayChange >= 0 ? "+" : ""}{displayChange.toFixed(2)}%</span>
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <a
              href={chain.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Explorer
            </a>
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <Copy className="h-2.5 w-2.5" />
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "relative p-3 sm:p-4 rounded-xl border border-border/50 bg-muted/20 transition-all hover:bg-muted/40 group",
              isLoading && "animate-pulse",
              stat.link && "cursor-pointer"
            )}
            onClick={() => stat.link && window.open(stat.link, '_blank')}
            title={stat.tooltip}
          >
            <div className={cn(
              "absolute inset-0 opacity-10 rounded-xl",
              stat.color === "primary" && "bg-primary",
              stat.color === "secondary" && "bg-secondary",
              stat.color === "success" && "bg-success",
              stat.color === "warning" && "bg-warning"
            )} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <stat.icon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 mb-1.5 sm:mb-2",
                  stat.color === "primary" && "text-primary",
                  stat.color === "secondary" && "text-secondary",
                  stat.color === "success" && "text-success",
                  stat.color === "warning" && "text-warning"
                )} />
                {stat.link && (
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{stat.label}</p>
              <p className="text-sm sm:text-lg font-display text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
