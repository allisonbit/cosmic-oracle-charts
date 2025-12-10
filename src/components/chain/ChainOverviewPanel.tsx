import { ChainConfig } from "@/lib/chainConfig";
import { ChainOverview } from "@/hooks/useChainData";
import { TrendingUp, TrendingDown, Activity, Zap, Users, DollarSign, BarChart3, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimePrices } from "@/hooks/useRealtimePrices";
import { useEffect, useState } from "react";

interface ChainOverviewPanelProps {
  chain: ChainConfig;
  overview: ChainOverview | undefined;
  isLoading: boolean;
}

export function ChainOverviewPanel({ chain, overview, isLoading }: ChainOverviewPanelProps) {
  const { prices, isConnected } = useRealtimePrices([chain.symbol]);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  // Detect price changes for flash effect
  useEffect(() => {
    const currentPrice = prices[chain.symbol]?.price;
    if (currentPrice && lastPrice && currentPrice !== lastPrice) {
      setPriceFlash(currentPrice > lastPrice ? "up" : "down");
      setTimeout(() => setPriceFlash(null), 500);
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

  const stats = [
    {
      label: "Market Cap",
      value: overview ? formatNumber(overview.marketCap) : "--",
      icon: DollarSign,
      color: "primary",
    },
    {
      label: "24h Volume",
      value: overview ? formatNumber(overview.volume24h) : "--",
      icon: BarChart3,
      color: "secondary",
    },
    {
      label: "Transactions",
      value: overview ? formatSimple(overview.transactions24h) : "--",
      icon: Activity,
      color: "warning",
    },
    {
      label: "Gas Fees",
      value: overview ? `${overview.gasFees.toFixed(2)} Gwei` : "--",
      icon: Zap,
      color: "primary",
    },
    {
      label: "TPS",
      value: overview ? overview.tps.toFixed(0) : "--",
      icon: TrendingUp,
      color: "success",
    },
    {
      label: "Active Wallets",
      value: overview ? formatSimple(overview.activeWallets) : "--",
      icon: Users,
      color: "secondary",
    },
    {
      label: "DeFi TVL",
      value: overview ? formatNumber(overview.defiTvl) : "--",
      icon: DollarSign,
      color: "primary",
    },
  ];

  return (
    <div className="holo-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{
              background: `linear-gradient(135deg, hsl(${chain.color} / 0.2), hsl(${chain.color} / 0.1))`,
              boxShadow: `0 0 30px hsl(${chain.color} / 0.3)`,
            }}
          >
            {chain.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-display text-foreground glow-text">{chain.name}</h2>
              {/* Realtime indicator */}
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                isConnected ? "bg-success/20 text-success" : "bg-muted/30 text-muted-foreground"
              )}>
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span className="hidden sm:inline">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Chain Health Status</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live price */}
          {realtimePrice && (
            <div className={cn(
              "text-xl font-display transition-all duration-300",
              priceFlash === "up" && "text-success scale-105",
              priceFlash === "down" && "text-danger scale-105",
              !priceFlash && "text-foreground"
            )}>
              ${realtimePrice.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          )}
          
          {/* Price change badge */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            displayChange >= 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
          )}>
            {displayChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span className="font-medium">{displayChange >= 0 ? "+" : ""}{displayChange.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "relative p-4 rounded-xl border border-border/50 bg-muted/20 transition-all hover:bg-muted/40",
              isLoading && "animate-pulse"
            )}
          >
            <div className={cn(
              "absolute inset-0 opacity-10 rounded-xl",
              stat.color === "primary" && "bg-primary",
              stat.color === "secondary" && "bg-secondary",
              stat.color === "success" && "bg-success",
              stat.color === "warning" && "bg-warning"
            )} />
            <div className="relative">
              <stat.icon className={cn(
                "h-5 w-5 mb-2",
                stat.color === "primary" && "text-primary",
                stat.color === "secondary" && "text-secondary",
                stat.color === "success" && "text-success",
                stat.color === "warning" && "text-warning"
              )} />
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-lg font-display text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
