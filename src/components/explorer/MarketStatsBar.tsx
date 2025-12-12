import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, Activity, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplorerChain } from "@/lib/explorerChains";

interface MarketStatsBarProps {
  chain: ExplorerChain;
}

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(0)}`;
}

export function MarketStatsBar({ chain }: MarketStatsBarProps) {
  // Mock chain stats
  const stats = {
    totalPairs: Math.floor(Math.random() * 50000) + 10000,
    volume24h: Math.random() * 500000000 + 50000000,
    volumeChange: (Math.random() - 0.5) * 50,
    tvl: Math.random() * 10000000000 + 1000000000,
    transactions24h: Math.floor(Math.random() * 1000000) + 100000,
    activeTraders: Math.floor(Math.random() * 100000) + 10000,
    newPairs24h: Math.floor(Math.random() * 500) + 50,
    trendingPairs: Math.floor(Math.random() * 100) + 20,
  };

  return (
    <div className="holo-card p-4 overflow-x-auto">
      <div className="flex items-center gap-6 min-w-max">
        <div className="flex items-center gap-2">
          <span className="text-xl">{chain.icon}</span>
          <span className="font-display font-bold text-sm">{chain.name}</span>
        </div>
        
        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Pairs:</span>
          <span className="text-sm font-medium">{stats.totalPairs.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">24h Vol:</span>
          <span className="text-sm font-medium">{formatNumber(stats.volume24h)}</span>
          <span className={cn("text-xs", stats.volumeChange >= 0 ? "text-success" : "text-danger")}>
            {stats.volumeChange >= 0 ? "+" : ""}{stats.volumeChange.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary" />
          <span className="text-xs text-muted-foreground">TVL:</span>
          <span className="text-sm font-medium">{formatNumber(stats.tvl)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-warning" />
          <span className="text-xs text-muted-foreground">Traders:</span>
          <span className="text-sm font-medium">{stats.activeTraders.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-success" />
          <span className="text-xs text-muted-foreground">New Pairs:</span>
          <span className="text-sm font-medium text-success">+{stats.newPairs24h}</span>
        </div>

        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-danger" />
          <span className="text-xs text-muted-foreground">Trending:</span>
          <span className="text-sm font-medium text-danger">{stats.trendingPairs}</span>
        </div>
      </div>
    </div>
  );
}
