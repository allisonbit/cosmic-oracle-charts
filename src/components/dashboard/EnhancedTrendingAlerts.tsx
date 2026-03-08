import { 
  Flame, TrendingUp, TrendingDown, AlertTriangle, Rocket, 
  Clock, Activity, Zap, Bell, Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TokenIcon } from "@/components/ui/token-icon";

interface Alert {
  type: "pump" | "dump" | "breakout" | "warning" | "volume_spike" | "whale";
  symbol: string;
  name?: string;
  message: string;
  change: number;
  volume?: number;
  price?: number;
  marketCap?: number;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

interface EnhancedTrendingAlertsProps {
  compact?: boolean;
}

export function EnhancedTrendingAlerts({ compact }: EnhancedTrendingAlertsProps) {
  const { data, isLoading } = useMarketData();
  const [filter, setFilter] = useState<"all" | "bullish" | "bearish">("all");

  const alerts = useMemo(() => {
    const topCoins = data?.topCoins || [];
    const alertList: Alert[] = [];

    topCoins.forEach(coin => {
      const volumeToMcap = (coin.volume / coin.marketCap) * 100;
      
      if (coin.change24h > 15) {
        alertList.push({ type: "pump", symbol: coin.symbol, name: coin.name, message: `Massive pump - up ${coin.change24h.toFixed(1)}% in 24h`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(Date.now() - Math.random() * 3600000), severity: "critical" });
      } else if (coin.change24h > 8) {
        alertList.push({ type: "breakout", symbol: coin.symbol, name: coin.name, message: `Strong breakout with ${coin.change24h.toFixed(1)}% gains`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(Date.now() - Math.random() * 3600000), severity: "high" });
      } else if (coin.change24h > 5) {
        alertList.push({ type: "breakout", symbol: coin.symbol, name: coin.name, message: `Breaking out with ${coin.change24h.toFixed(1)}% gains`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(Date.now() - Math.random() * 7200000), severity: "medium" });
      } else if (coin.change24h < -15) {
        alertList.push({ type: "dump", symbol: coin.symbol, name: coin.name, message: `Major crash - down ${Math.abs(coin.change24h).toFixed(1)}%`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(Date.now() - Math.random() * 1800000), severity: "critical" });
      } else if (coin.change24h < -8) {
        alertList.push({ type: "dump", symbol: coin.symbol, name: coin.name, message: `Sharp decline - down ${Math.abs(coin.change24h).toFixed(1)}%`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(Date.now() - Math.random() * 3600000), severity: "high" });
      } else if (coin.change24h < -5) {
        alertList.push({ type: "warning", symbol: coin.symbol, name: coin.name, message: `Correction underway - ${coin.change24h.toFixed(1)}%`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(Date.now() - Math.random() * 7200000), severity: "medium" });
      }

      if (volumeToMcap > 15) {
        alertList.push({ type: "volume_spike", symbol: coin.symbol, name: coin.name, message: `Unusual volume - ${volumeToMcap.toFixed(1)}% of market cap traded`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(Date.now() - Math.random() * 1800000), severity: volumeToMcap > 25 ? "critical" : "high" });
      }
    });

    let filtered = alertList;
    if (filter === "bullish") filtered = alertList.filter(a => a.change > 0);
    else if (filter === "bearish") filtered = alertList.filter(a => a.change < 0);

    return filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }).slice(0, compact ? 4 : 8);
  }, [data, compact, filter]);

  const getAlertStyle = (type: string) => {
    const baseStyles = {
      pump: { icon: Rocket, color: "text-success", bg: "bg-success/10 border-success/30" },
      breakout: { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
      dump: { icon: TrendingDown, color: "text-danger", bg: "bg-danger/10 border-danger/30" },
      warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/30" },
      volume_spike: { icon: Volume2, color: "text-secondary", bg: "bg-secondary/10 border-secondary/30" },
      whale: { icon: Activity, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
    };
    return baseStyles[type as keyof typeof baseStyles] || { icon: Flame, color: "text-muted-foreground", bg: "bg-muted" };
  };

  const getTimeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const getCoinId = (alert: Alert) => alert.name?.toLowerCase().replace(/\s+/g, '-') || alert.symbol.toLowerCase();

  return (
    <div className="holo-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-warning animate-pulse" />
          LIVE ALERTS
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-warning" : "bg-success")} />
          Live
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-muted/30 p-1 rounded-lg">
        {[
          { key: "all", label: "All" },
          { key: "bullish", label: "Bullish" },
          { key: "bearish", label: "Bearish" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={cn(
              "flex-1 py-1.5 px-2 text-xs font-display rounded transition-colors",
              filter === tab.key ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const style = getAlertStyle(alert.type);
            const AlertIcon = style.icon;
            return (
              <Link 
                key={`${alert.symbol}-${alert.type}-${i}`}
                to={`/price-prediction/${getCoinId(alert)}/daily`}
                className={cn(
                  "w-full p-3 rounded-lg border flex items-center gap-3 animate-fade-in transition-all hover:scale-[1.01] text-left group",
                  style.bg,
                  alert.severity === "critical" && "ring-1 ring-offset-1 ring-offset-background"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative">
                  <AlertIcon className={cn("w-5 h-5", style.color)} />
                  {alert.severity === "critical" && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold">{alert.symbol}</span>
                    <span className={cn("text-xs font-bold", alert.change >= 0 ? "text-success" : "text-danger")}>
                      {alert.change >= 0 ? "+" : ""}{alert.change.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{getTimeAgo(alert.timestamp)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{alert.message}</div>
                </div>
                <Zap className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Flame className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No major alerts at the moment</p>
          <p className="text-xs mt-1">Market is relatively stable</p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Activity className="w-3 h-3" />
          {alerts.length} active alerts
        </span>
        <span className="text-xs text-success flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live monitoring
        </span>
      </div>
    </div>
  );
}
