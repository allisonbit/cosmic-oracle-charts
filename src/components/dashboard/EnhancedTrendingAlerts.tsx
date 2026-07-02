import {
  Flame, TrendingUp, TrendingDown, AlertTriangle, Rocket,
  Activity, Zap, Bell, Volume2, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
        alertList.push({ type: "pump", symbol: coin.symbol, name: coin.name, message: `Massive pump — up ${(coin.change24h ?? 0).toFixed(1)}% in 24h`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(), severity: "critical" });
      } else if (coin.change24h > 8) {
        alertList.push({ type: "breakout", symbol: coin.symbol, name: coin.name, message: `Strong breakout — ${(coin.change24h ?? 0).toFixed(1)}% gains`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(), severity: "high" });
      } else if (coin.change24h > 5) {
        alertList.push({ type: "breakout", symbol: coin.symbol, name: coin.name, message: `Breaking out — ${(coin.change24h ?? 0).toFixed(1)}% gains`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(), severity: "medium" });
      } else if (coin.change24h < -15) {
        alertList.push({ type: "dump", symbol: coin.symbol, name: coin.name, message: `Major crash — down ${Math.abs(coin.change24h).toFixed(1)}%`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(), severity: "critical" });
      } else if (coin.change24h < -8) {
        alertList.push({ type: "dump", symbol: coin.symbol, name: coin.name, message: `Sharp decline — down ${Math.abs(coin.change24h).toFixed(1)}%`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(), severity: "high" });
      } else if (coin.change24h < -5) {
        alertList.push({ type: "warning", symbol: coin.symbol, name: coin.name, message: `Correction — ${(coin.change24h ?? 0).toFixed(1)}%`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(), severity: "medium" });
      }

      if (volumeToMcap > 15) {
        alertList.push({ type: "volume_spike", symbol: coin.symbol, name: coin.name, message: `Unusual volume — ${(volumeToMcap ?? 0).toFixed(1)}% of market cap traded`, change: coin.change24h, volume: coin.volume, price: coin.price, marketCap: coin.marketCap, timestamp: new Date(), severity: volumeToMcap > 25 ? "critical" : "high" });
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
    const styles = {
      pump:         { icon: Rocket,       color: "text-success",          dot: "bg-success" },
      breakout:     { icon: TrendingUp,   color: "text-primary",          dot: "bg-primary" },
      dump:         { icon: TrendingDown, color: "text-danger",           dot: "bg-danger" },
      warning:      { icon: AlertTriangle,color: "text-warning",          dot: "bg-warning" },
      volume_spike: { icon: Volume2,      color: "text-secondary",        dot: "bg-secondary" },
      whale:        { icon: Activity,     color: "text-primary",          dot: "bg-primary" },
    };
    return styles[type as keyof typeof styles] || { icon: Flame, color: "text-muted-foreground", dot: "bg-muted-foreground" };
  };

  const getCoinId = (alert: Alert) => alert.name?.toLowerCase().replace(/\s+/g, '-') || alert.symbol.toLowerCase();

  return (
    <div className="border-t border-border/30 pt-5 pb-5">
      <div className="section-header mb-2">
        <span className="section-label flex items-center gap-1.5">
          <Bell className="w-3 h-3 text-warning" />
          Live Alerts
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
        </span>
        <div className="flex items-center gap-1 text-xs">
          {(["all", "bullish", "bearish"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2 py-0.5 capitalize transition-colors",
                filter === f ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <h3 className="font-display font-bold text-base md:text-lg mb-4">
        Market <span className="text-gradient-cosmic">Alerts</span>
      </h3>

      {alerts.length > 0 ? (
        <div>
          {alerts.map((alert, i) => {
            const style = getAlertStyle(alert.type);
            const AlertIcon = style.icon;
            return (
              <Link
                key={`${alert.symbol}-${alert.type}-${i}`}
                to={`/price-prediction/${getCoinId(alert)}/daily`}
                className="editorial-row group items-start gap-3"
              >
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", style.dot)} />
                <AlertIcon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", style.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-display font-bold text-sm">{alert.symbol}</span>
                    <span className={cn("text-xs font-bold", alert.change >= 0 ? "text-success" : "text-danger")}>
                      {alert.change >= 0 ? "+" : ""}{(alert.change ?? 0).toFixed(1)}%
                    </span>
                    {alert.severity === "critical" && (
                      <span className="text-[9px] font-bold uppercase text-danger">CRITICAL</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{alert.message}</div>
                </div>
                <Zap className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-muted-foreground">
          <Flame className="w-6 h-6 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No major alerts — market is stable</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          {alerts.length} active alerts
        </span>
        <span className="flex items-center gap-1 text-success">
          <Radio className="w-3 h-3" /> Live monitoring
        </span>
      </div>
    </div>
  );
}
